"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { saveUserProfile } from "@/lib/firebaseAuth";

const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive", "Dermatitis / Eczema"];
const FABRICS = ["Cotton", "Bamboo", "Linen", "Silk", "Organic Cotton", "Polyester", "Wool"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [skinType, setSkinType] = useState("");
  const [preferredFabric, setPreferredFabric] = useState("");
  const [size, setSize] = useState("");

  const totalSteps = 3;

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        fullName,
        age,
        profession,
        location,
        skinType,
        preferredFabric,
        size,
        email: user.email,
        comfortScore: 92,
      });
      await refreshProfile();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-lg w-full glass rounded-3xl p-10 shadow-xl border border-blue-100">
        {/* Logo + Progress */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">S</span>
            </div>
            <span className="font-extrabold text-lg text-slate-900">Style <span className="text-blue-600">AI</span></span>
          </div>
          <span className="text-sm text-slate-400 font-medium">Step {step} of {totalSteps}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1 – Personal Info */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Personal Info</h2>
            <p className="text-slate-500 text-sm mb-6">Tell us a little about yourself.</p>
            <div className="flex flex-col gap-4">
              {[
                { label: "Full Name", value: fullName, set: setFullName, placeholder: "Your name", type: "text" },
                { label: "Age", value: age, set: setAge, placeholder: "e.g. 24", type: "number" },
                { label: "Profession", value: profession, set: setProfession, placeholder: "e.g. Designer", type: "text" },
                { label: "City / Location", value: location, set: setLocation, placeholder: "e.g. Mumbai", type: "text" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 – Skin Type */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Skin Diagnosis</h2>
            <p className="text-slate-500 text-sm mb-6">
              Select your skin type so Style AI can recommend safe fabrics.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SKIN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSkinType(type)}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold text-left transition ${
                    skinType === type
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:border-blue-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 – Preferences */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Comfort Preferences</h2>
            <p className="text-slate-500 text-sm mb-6">Choose your favourite fabric and clothing size.</p>

            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-3">Preferred Fabric</p>
              <div className="flex flex-wrap gap-2">
                {FABRICS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setPreferredFabric(f)}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
                      preferredFabric === f
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:border-blue-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Clothing Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-14 rounded-xl border-2 py-2 text-sm font-bold transition ${
                      size === s
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:border-blue-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition"
            >
              ← Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? "Saving..." : "🚀 Launch My Style AI"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
