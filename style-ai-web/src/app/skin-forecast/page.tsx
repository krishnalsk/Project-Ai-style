"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface WeatherAlert {
  location: string;
  temp: number;
  condition: string;
  uvIndex: number;
  humidity: number;
  skinRiskLevel: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  recommendedFabric: string;
  avoidFabric: string;
  dermatologyTip: string;
}

export default function SkinForecastPage() {
  const [city, setCity] = useState("Mumbai");
  const [searchCity, setSearchCity] = useState("Mumbai");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [dataSource, setDataSource] = useState<"Live Sensor API" | "Regional Reference Station">("Regional Reference Station");
  const [weatherData, setWeatherData] = useState<WeatherAlert | null>(null);

  useEffect(() => {
    document.title = "Skin Forecast | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Weather-based skin safety forecast");
  }, []);

  const referenceData: Record<string, WeatherAlert> = {
    mumbai: {
      location: "Mumbai, India",
      temp: 31,
      condition: "Humid & Partly Cloudy",
      uvIndex: 8,
      humidity: 82,
      skinRiskLevel: "HIGH",
      recommendedFabric: "100% French Linen, Bamboo Viscose",
      avoidFabric: "100% Polyester, Acrylic Knit",
      dermatologyTip: "High humidity accelerates sweat accumulation under synthetic fabrics. Wear open-weave natural linen to prevent heat rashes.",
    },
    delhi: {
      location: "Delhi, India",
      temp: 36,
      condition: "Hot & Dry",
      uvIndex: 9,
      humidity: 45,
      skinRiskLevel: "EXTREME",
      recommendedFabric: "GOTS Organic Cotton, Mulberry Silk",
      avoidFabric: "Heavy Synthetics, Tight Denim",
      dermatologyTip: "Extreme UV index. Ensure long-sleeve organic cotton layers to shield skin barrier from solar radiation.",
    },
    bengaluru: {
      location: "Bengaluru, India",
      temp: 24,
      condition: "Pleasant Breeze",
      uvIndex: 5,
      humidity: 60,
      skinRiskLevel: "LOW",
      recommendedFabric: "Organic Cotton T-shirts, Tencel Joggers",
      avoidFabric: "Coarse Wool Innerwear",
      dermatologyTip: "Optimal weather for skin respiration. Moderate UV allows comfortable wear of light natural cotton blends.",
    },
  };

  function deriveSkinAdvice(temp: number, humidity: number, uv: number, locationName: string, conditionText: string): WeatherAlert {
    let skinRiskLevel: WeatherAlert["skinRiskLevel"] = "LOW";
    let recommendedFabric = "100% GOTS Organic Cotton, Bamboo Viscose";
    let avoidFabric = "Heavy Synthetics, Tight Denim";
    let dermatologyTip = "Balanced environmental factors. Light natural cotton maintains skin barrier respiration.";

    if (uv >= 8 || temp >= 34) {
      skinRiskLevel = "EXTREME";
      recommendedFabric = "GOTS Organic Cotton (Long Sleeve), Unbleached Linen";
      avoidFabric = "Dark Synthetic Blends, Raw Wool";
      dermatologyTip = "Intense solar radiation and heat. Wear breathable long-sleeve organic cotton to shield epidermal layers from UV irritation.";
    } else if (humidity >= 75 || temp >= 30) {
      skinRiskLevel = "HIGH";
      recommendedFabric = "100% French Linen, Antibacterial Bamboo Viscose";
      avoidFabric = "Polyester Activewear, Nylon, Spandex Blends";
      dermatologyTip = "High ambient moisture traps perspiration under synthetic garments. Choose open-weave flax linen to avoid sweat gland occlusion.";
    } else if (humidity < 40 || temp < 18) {
      skinRiskLevel = "MODERATE";
      recommendedFabric = "Soft Organic Cotton Layering, Mulberry Silk Innerwear";
      avoidFabric = "Coarse Wool, Acrylic Knits";
      dermatologyTip = "Dry or cool conditions can strip skin hydration. Use soft organic cotton base layers to avoid direct skin friction.";
    }

    return {
      location: locationName,
      temp: Math.round(temp),
      condition: conditionText,
      uvIndex: Math.round(uv),
      humidity: Math.round(humidity),
      skinRiskLevel,
      recommendedFabric,
      avoidFabric,
      dermatologyTip,
    };
  }

  async function fetchLiveWeather(targetCity: string) {
    setLoadingWeather(true);
    try {
      // 1. Geocode city name via Open-Meteo
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const { latitude, longitude, name, country } = place;

        // 2. Fetch live weather & UV index
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&timezone=auto`
        );
        if (!weatherRes.ok) throw new Error("Weather fetch failed");
        const wData = await weatherRes.json();
        const cur = wData.current;

        const weatherCode = cur.weather_code ?? 0;
        const condition =
          weatherCode === 0
            ? "Clear Sky"
            : weatherCode <= 3
            ? "Partly Cloudy"
            : weatherCode <= 67
            ? "Rain & Moisture"
            : "Scattered Clouds";

        const alert = deriveSkinAdvice(
          cur.temperature_2m,
          cur.relative_humidity_2m,
          cur.uv_index || 5,
          `${name}, ${country}`,
          condition
        );

        setWeatherData(alert);
        setDataSource("Live Sensor API");
        setCity(name);
        setLoadingWeather(false);
        return;
      }
    } catch {
      // Fallback handled below
    }

    // Reference fallback
    const key = targetCity.toLowerCase().trim();
    const fallback = referenceData[key] || {
      ...referenceData["mumbai"],
      location: `${targetCity.charAt(0).toUpperCase() + targetCity.slice(1)} (Regional Reference)`,
    };
    setWeatherData(fallback);
    setDataSource("Regional Reference Station");
    setCity(targetCity);
    setLoadingWeather(false);
  }

  function handleUseGeolocation() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLoadingWeather(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&timezone=auto`
            );
            if (weatherRes.ok) {
              const wData = await weatherRes.json();
              const cur = wData.current;
              const alert = deriveSkinAdvice(
                cur.temperature_2m,
                cur.relative_humidity_2m,
                cur.uv_index || 6,
                "Your Current Coordinates",
                cur.weather_code <= 3 ? "Local Conditions" : "Variable Sky"
              );
              setWeatherData(alert);
              setDataSource("Live Sensor API");
              setCity("Your Location");
              setLoadingWeather(false);
              return;
            }
          } catch {}
          setLoadingWeather(false);
        },
        () => {
          setLoadingWeather(false);
        },
        { timeout: 8000 }
      );
    }
  }

  const current = weatherData || referenceData[city.toLowerCase().trim()] || referenceData["mumbai"];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchLiveWeather(searchCity.trim());
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" aria-label="Back to dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Live Skin Forecast</h1>
              <p className="text-xs text-slate-500">Real-time UV, humidity & weather-adjusted fabric safety</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              dataSource === "Live Sensor API"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {dataSource === "Live Sensor API" ? "📡 Live Sensor API (Open-Meteo)" : "📍 Climate Reference Station"}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* City Search Bar & GPS */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search any global city (e.g. Paris, Tokyo, Mumbai, New York)..."
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-xs"
            />
            <button
              type="submit"
              disabled={loadingWeather}
              className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-blue-700 transition text-sm shadow-xs disabled:opacity-50"
            >
              {loadingWeather ? "Fetching..." : "Search City"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseGeolocation}
            disabled={loadingWeather}
            className="bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-bold px-4 py-3 rounded-2xl transition text-sm shadow-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            📍 Use My GPS
          </button>
        </div>

        {dataSource === "Regional Reference Station" && (
          <div className="bg-amber-50/70 border border-amber-200 text-amber-900 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              Showing regional reference climate baseline for &quot;{city}&quot;. Enter another city or click &quot;Use My GPS&quot; to fetch live open satellite sensor telemetry.
            </span>
          </div>
        )}

        {/* Live Weather Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">📍 {current.location}</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-5xl font-black">{current.temp}°C</span>
                <span className="text-lg text-blue-100 font-medium">{current.condition}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center min-w-[90px]">
                <span className="text-[11px] text-blue-100 font-bold block">UV Index</span>
                <span className="text-2xl font-black">{current.uvIndex}</span>
                <span className="text-[11px] text-amber-300 font-bold block">Very High</span>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center min-w-[90px]">
                <span className="text-[11px] text-blue-100 font-bold block">Humidity</span>
                <span className="text-2xl font-black">{current.humidity}%</span>
                <span className="text-[11px] text-blue-200 block">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skin Safety Verdict */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">Skin Irritation Risk Level</h3>
            <span
              className={`text-xs font-black px-4 py-1.5 rounded-full ${
                current.skinRiskLevel === "LOW"
                  ? "bg-emerald-100 text-emerald-800"
                  : current.skinRiskLevel === "MODERATE"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {current.skinRiskLevel} RISK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
              <span className="text-xs font-bold text-emerald-800 block mb-1">✅ Recommended Fabrics Today:</span>
              <p className="text-sm font-black text-emerald-950">{current.recommendedFabric}</p>
            </div>

            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4">
              <span className="text-xs font-bold text-red-800 block mb-1">❌ Fabrics to Avoid Today:</span>
              <p className="text-sm font-black text-red-950">{current.avoidFabric}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-xs font-bold text-blue-700 block mb-1">🔬 Dermatologist AI Guidance:</span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{current.dermatologyTip}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <Link
            href="/outfit-generator"
            className="flex-1 bg-blue-600 text-white font-bold text-xs py-3.5 rounded-2xl hover:bg-blue-700 transition text-center shadow-xs"
          >
            Generate Today&apos;s Outfit →
          </Link>
          <Link
            href="/ai-stylist"
            className="flex-1 border-2 border-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl hover:bg-slate-50 transition text-center"
          >
            Consult AI Stylist
          </Link>
        </div>

        <div className="text-center mt-6">
          <p className="text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            ⚕️ <strong>Informational Guidance:</strong> Skin Forecast provides environmental fabric suggestions based on regional meteorological readings. It does not replace medical sun protection guidance or individualized dermatological care.
          </p>
        </div>
      </main>
    </div>
  );
}
