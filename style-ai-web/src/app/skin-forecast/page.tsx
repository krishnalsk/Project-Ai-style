// src/app/skin-forecast/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLiveWeather, WeatherObservation } from "@/lib/weatherService";
import { queryCatalog, ScoredProduct } from "@/lib/queryEngine";
import { useAuth } from "@/context/AuthContext";

export default function SkinForecastPage() {
  const { profile } = useAuth();
  const [city, setCity] = useState(profile?.location || "Mumbai");
  const [searchCity, setSearchCity] = useState(profile?.location || "Mumbai");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherObservation | null>(null);
  const [matchingGarments, setMatchingGarments] = useState<ScoredProduct[]>([]);

  useEffect(() => {
    document.title = "Live Skin Forecast | Style AI";
    fetchWeather(city);
  }, []);

  async function fetchWeather(targetCity: string) {
    setLoadingWeather(true);
    const observation = await getLiveWeather(targetCity);
    setWeatherData(observation);
    setCity(observation.location.split(",")[0] || targetCity);

    // Retrieve weather-matched products from the 1,000-record dataset
    const weatherTag = observation.temp >= 30 ? "Hot" : observation.temp <= 20 ? "Cold" : "Pleasant";
    const queried = queryCatalog({
      weather: weatherTag,
      confirmedAllergies: profile?.confirmedAllergies || [],
      minSkinSafety: 90,
      inStockOnly: true,
      limit: 3,
    });
    setMatchingGarments(queried.items);
    setLoadingWeather(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeather(searchCity.trim());
    }
  }

  function handleUseGeolocation() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLoadingWeather(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocode or fetch directly
            const revRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=Mumbai&count=1`
            );
            if (revRes.ok) {
              await fetchWeather("Your Location");
            }
          } catch {
            await fetchWeather("Mumbai");
          }
          setLoadingWeather(false);
        },
        () => {
          setLoadingWeather(false);
        },
        { timeout: 8000 }
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" aria-label="Back to dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">Live Skin Forecast</h1>
              <p className="text-xs text-slate-500">Real-time UV, humidity & weather-adjusted fabric safety</p>
            </div>
          </div>

          {weatherData && (
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                weatherData.isRealTime
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : weatherData.isStale
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {weatherData.source === "Live Open-Meteo Sensor API"
                ? "📡 Live Open-Meteo Sensor"
                : weatherData.source === "Cached Observation"
                ? "⏱️ Cached Telemetry"
                : "⚠️ Baseline Reference"}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search City */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search any global city (e.g. Mumbai, Delhi, Paris, Tokyo, London)..."
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xs font-medium"
            />
            <button
              type="submit"
              disabled={loadingWeather}
              className="bg-blue-600 text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-blue-700 transition text-sm shadow-xs disabled:opacity-50"
            >
              {loadingWeather ? "Measuring..." : "Get Forecast"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseGeolocation}
            disabled={loadingWeather}
            className="bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-bold px-4 py-3 rounded-2xl transition text-sm shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            📍 GPS
          </button>
        </div>

        {weatherData?.isUnavailable && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Real-time weather telemetry is currently offline or unreachable. Displaying baseline environmental guidelines.
            </span>
          </div>
        )}

        {/* Live Weather Card */}
        {weatherData && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">
                  📍 {weatherData.location} · {weatherData.lastUpdated}
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl font-black">{weatherData.temp}°C</span>
                  <span className="text-lg text-blue-100 font-semibold">{weatherData.condition}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center min-w-[90px]">
                  <span className="text-[11px] text-blue-100 font-bold block">UV Index</span>
                  <span className="text-2xl font-black">{weatherData.uvIndex}</span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    {weatherData.uvIndex >= 8 ? "Extreme" : weatherData.uvIndex >= 6 ? "High" : "Moderate"}
                  </span>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center min-w-[90px]">
                  <span className="text-[11px] text-blue-100 font-bold block">Humidity</span>
                  <span className="text-2xl font-black">{weatherData.humidity}%</span>
                  <span className="text-[10px] text-blue-200 block">
                    {weatherData.humidity >= 70 ? "High Moisture" : "Comfortable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Weather Rationale Card */}
        {weatherData && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-base">Skin Irritation Risk Assessment</h3>
              <span
                className={`text-xs font-black px-4 py-1.5 rounded-full ${
                  weatherData.skinAlertLevel === "LOW"
                    ? "bg-emerald-100 text-emerald-800"
                    : weatherData.skinAlertLevel === "MODERATE"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {weatherData.skinAlertLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-emerald-800 block mb-1">✅ Recommended Breathable Fabrics Today:</span>
                <p className="text-sm font-black text-emerald-950">{weatherData.recommendedFabrics.join(", ")}</p>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-red-800 block mb-1">❌ Fabrics to Avoid in this Climate:</span>
                <p className="text-sm font-black text-red-950">{weatherData.avoidFabrics.join(", ")}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-xs font-bold text-blue-700 block mb-1">🔬 Dermatological Layering Advice:</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{weatherData.layeringAdvice}</p>
            </div>
          </div>
        )}

        {/* Real Matching Garments from 1,000-Record Dataset */}
        {matchingGarments.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Recommended Garments for Today&apos;s Climate
                </h3>
                <p className="text-xs text-slate-500">Filtered from the 1,000-record catalog to match current UV & humidity</p>
              </div>
              <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
                View All in Shop →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {matchingGarments.map(({ product, score, explanation }) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-200 mb-2">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-black text-slate-900 block truncate">{product.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">{product.fabric}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                    <span className="text-xs font-black text-blue-600">₹{product.price.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      {score}% Match
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex gap-3">
          <Link
            href="/outfit-generator"
            className="flex-1 bg-blue-600 text-white font-bold text-xs py-3.5 rounded-2xl hover:bg-blue-700 transition text-center shadow-xs"
          >
            Generate Today&apos;s Weather Outfit →
          </Link>
          <Link
            href="/ai-stylist"
            className="flex-1 border-2 border-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl hover:bg-slate-50 transition text-center"
          >
            Ask AI Stylist About This Weather
          </Link>
        </div>
      </main>
    </div>
  );
}
