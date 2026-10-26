// src/lib/weatherService.ts
// Reliable Climate & Weather Service integrating Open-Meteo API with strict freshness indicators

export interface WeatherObservation {
  location: string;
  latitude?: number;
  longitude?: number;
  temp: number; // Celsius
  condition: string;
  humidity: number; // %
  uvIndex: number;
  precipitationMm?: number;
  isRealTime: boolean;
  isStale: boolean;
  isUnavailable: boolean;
  source: "Live Open-Meteo Sensor API" | "Cached Observation" | "Offline Reference (Unavailable)";
  lastUpdated: string;
  recommendedFabrics: string[];
  avoidFabrics: string[];
  layeringAdvice: string;
  skinAlertLevel: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const weatherCache = new Map<string, { data: WeatherObservation; timestamp: number }>();

/**
 * Derives clinical dermatological styling advice based on atmospheric parameters.
 */
export function deriveClimateAdvice(temp: number, humidity: number, uv: number, locationName: string, condition = "Partly Cloudy"): {
  recommendedFabrics: string[];
  avoidFabrics: string[];
  layeringAdvice: string;
  skinAlertLevel: WeatherObservation["skinAlertLevel"];
} {
  let skinAlertLevel: WeatherObservation["skinAlertLevel"] = "LOW";
  let recommendedFabrics = ["100% GOTS Organic Cotton", "Bamboo Viscose"];
  let avoidFabrics = ["Heavy Synthetics", "Coarse Wool"];
  let layeringAdvice = "Single light layer for optimal thermal regulation.";

  if (uv >= 8 || temp >= 34) {
    skinAlertLevel = "EXTREME";
    recommendedFabrics = ["100% French Linen (Long Sleeve)", "Unbleached GOTS Cotton (UPF 40+)"];
    avoidFabrics = ["Polyester", "Acrylic", "Nylon", "Dark Synthetic Knits"];
    layeringAdvice = "Wear loose, long-sleeved natural fibers to physically shield epidermis from solar UV radiation.";
  } else if (humidity >= 75 || temp >= 30) {
    skinAlertLevel = "HIGH";
    recommendedFabrics = ["100% Pure French Flax Linen", "95% Bamboo Viscose"];
    avoidFabrics = ["100% Polyester", "Synthetic Blends", "Tight Denim"];
    layeringAdvice = "High moisture traps perspiration. Choose open-weave natural linen to prevent sweat gland occlusion.";
  } else if (humidity < 40 || temp < 18) {
    skinAlertLevel = "MODERATE";
    recommendedFabrics = ["Soft Organic Cotton Baselayers", "Mulberry Silk Innerwear"];
    avoidFabrics = ["Raw Wool", "Scratchy Acrylics"];
    layeringAdvice = "Dry or cool air compromises skin barrier hydration. Layer soft cotton under outer garments to avoid friction.";
  }

  return { recommendedFabrics, avoidFabrics, layeringAdvice, skinAlertLevel };
}

/**
 * Fetches real-time weather from Open-Meteo with transparent status reporting.
 * Never disguises mock or cached data as live sensor data.
 */
export async function getLiveWeather(cityName = "Mumbai"): Promise<WeatherObservation> {
  const normalizedKey = cityName.toLowerCase().trim();
  const now = Date.now();

  // 1. Check local cache
  const cached = weatherCache.get(normalizedKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return {
      ...cached.data,
      isRealTime: false,
      isStale: false,
      source: "Cached Observation",
    };
  }

  // 2. Fetch live data from Open-Meteo
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error(`Geocoding HTTP error: ${geoRes.status}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Location "${cityName}" not recognized by Open-Meteo.`);
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index,precipitation&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error(`Forecast HTTP error: ${weatherRes.status}`);
    const weatherJson = await weatherRes.json();

    const current = weatherJson.current;
    const temp = Math.round(current.temperature_2m);
    const humidity = Math.round(current.relative_humidity_2m);
    const uv = Math.round(current.uv_index || 0);
    const precip = current.precipitation || 0;

    let condition = "Clear Sky";
    const code = current.weather_code;
    if (code >= 51 && code <= 67) condition = "Light Rain / Drizzle";
    else if (code >= 71 && code <= 77) condition = "Snow Showers";
    else if (code >= 80 && code <= 99) condition = "Thunderstorm / Heavy Rain";
    else if (code >= 1 && code <= 3) condition = "Partly Cloudy";

    const advice = deriveClimateAdvice(temp, humidity, uv, `${name}, ${country}`, condition);

    const observation: WeatherObservation = {
      location: `${name}, ${country}`,
      latitude,
      longitude,
      temp,
      humidity,
      uvIndex: uv,
      precipitationMm: precip,
      condition,
      isRealTime: true,
      isStale: false,
      isUnavailable: false,
      source: "Live Open-Meteo Sensor API",
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...advice,
    };

    // Update Cache
    weatherCache.set(normalizedKey, { data: observation, timestamp: now });
    return observation;
  } catch (err: unknown) {
    // 3. Fallback: If network fails, return cached if exists (marked as stale) or explicit Unavailable object
    if (cached) {
      return {
        ...cached.data,
        isRealTime: false,
        isStale: true,
        source: "Cached Observation",
      };
    }

    // Explicitly labeled unavailable observation
    const fallbackAdvice = deriveClimateAdvice(28, 65, 5, cityName, "Unavailable");
    return {
      location: cityName,
      temp: 28,
      humidity: 65,
      uvIndex: 5,
      condition: "Real-time weather unavailable",
      isRealTime: false,
      isStale: false,
      isUnavailable: true,
      source: "Offline Reference (Unavailable)",
      lastUpdated: "Not available",
      ...fallbackAdvice,
    };
  }
}
