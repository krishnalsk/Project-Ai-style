"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SparklesIcon } from "@/components/ui/Icons";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "Sensitive skin wear?",
  "Best fabric for dermatitis?",
  "Summer outfit recommendations?",
  "Korean casual style?",
  "Build my capsule wardrobe",
  "Polyester vs Cotton?",
];

export default function AiStylistPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your Style AI advisor — trained on skin safety, comfort science and sustainability. Ask me about fabrics, weather-ready outfits or your capsule wardrobe.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(0);

  const nextId = useCallback(() => {
    msgCounter.current += 1;
    return `msg-${msgCounter.current}-${Date.now()}`;
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.title = "AI Stylist | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Get AI-powered outfit recommendations");
  }, []);

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: nextId(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userProfile: profile }),
      });
      const data = await res.json();
      const aiReply: Message = {
        id: nextId(),
        sender: "ai",
        text: data.reply || "Sorry, I could not generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: "ai",
          text: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Style AI Assistant"
        subtitle="Skin Safety Engine — Online"
        backHref="/dashboard"
        actions={
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-[#EFF6FF] text-[#4A90E2] border border-[#BFDBFE] px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden /> Random Forest v2.4
          </span>
        }
      />

      {/* Engine banner */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs">
          <span className="w-7 h-7 rounded-lg bg-[#E6F4FF] border border-[#BFDBFE] flex items-center justify-center text-[#4A90E2]">
            <SparklesIcon size={14} />
          </span>
          <span className="font-semibold text-slate-700">Ask about skin-safe fabrics, weather pairings or capsule planning.</span>
        </div>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed whitespace-pre-line ${
                  m.sender === "user" ? "bg-[#4A90E2] text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 w-fit shadow-sm">
              <div className="flex gap-1" aria-hidden>
                <span className="w-2 h-2 rounded-full bg-[#4A90E2] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#4A90E2] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#4A90E2] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-slate-600 font-medium">Style AI is analyzing fabrics…</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-slate-100 p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="toolbar" aria-label="Quick prompts">
            {SUGGESTIONS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="shrink-0 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:border-[#4A90E2] hover:bg-[#EFF6FF] hover:text-[#4A90E2] px-3.5 py-2 rounded-full transition min-h-[32px]"
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-[#4A90E2] focus-within:ring-2 focus-within:ring-[#4A90E2]/15 transition"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skin-safe fabrics, outfit pairings or style advice…"
              aria-label="Message Style AI"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#4A90E2] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#3A6BC8] transition disabled:opacity-40 shrink-0 text-sm shadow-sm min-h-[40px]"
            >
              Send
            </button>
          </form>
          <p className="text-[11px] text-center text-slate-400">Style AI can make mistakes. Verify fabric advice with Label Lens.</p>
        </div>
      </footer>
    </div>
  );
}
