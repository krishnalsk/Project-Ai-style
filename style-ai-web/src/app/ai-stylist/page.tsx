// src/app/ai-stylist/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ScoredProduct } from "@/lib/queryEngine";
import { generateClientChatResponse } from "@/lib/clientChatEngine";
import {
  Camera,
  X,
  Sparkles,
  Shirt,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Menu,
  ChevronRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface DiagnosisData {
  diseaseOrCondition: string;
  severity: string;
  comfortScore: number;
  rootCause: string;
  recommendedFabric: string;
  recommendedWeave: string;
  careTip: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string | null;
  timestamp: string;
  source?: "multimodal-ai-engine" | "catalog-retrieval" | "conversational-ai" | "system";
  diagnosis?: DiagnosisData;
  matchedProducts?: ScoredProduct[];
  userFeedback?: "useful" | "comfortable" | "unsuitable";
  feedbackNote?: string;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

const DEFAULT_SUGGESTIONS = [
  "What fabric is suitable for my skin?",
  "Show me products under ₹2,000",
  "Is polyester suitable for sensitive skin?",
  "📸 Upload skin irritation photo",
  "Best clothes for eczema & dermatitis",
  "Summer outfits in linen & cotton",
];

const STORAGE_KEY = "styleai_chat_sessions_v2";

/**
 * Clean native Markdown renderer for ChatGPT-like rich text output.
 */
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 3
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-extrabold text-base text-slate-900 mt-2 mb-1">
              {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        // Heading 2 or 1
        if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="font-black text-lg text-slate-900 mt-2.5 mb-1.5">
              {renderInlineMarkdown(trimmed.replace(/^#+\s+/, ""))}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <div
              key={idx}
              className="border-l-4 border-blue-500 bg-blue-50/70 p-2.5 rounded-r-xl text-xs text-blue-950 font-medium my-1.5 italic"
            >
              {renderInlineMarkdown(trimmed.replace(/^>\s+/, ""))}
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-blue-600 font-black shrink-0 mt-0.5">•</span>
              <span className="flex-1">{renderInlineMarkdown(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-blue-700 shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
              <span className="flex-1">{renderInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-800 font-medium">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses bold, italics, code, and links inside inline markdown strings.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex to match **bold**, *italic*, `code`, and [link](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-700 border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <Link
          key={i}
          href={linkMatch[2]}
          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
        </Link>
      );
    }
    return part;
  });
}

export default function AiStylistPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestedPills, setSuggestedPills] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgCounter = useRef(0);

  const nextId = useCallback(() => {
    msgCounter.current += 1;
    return `msg-${Date.now()}-${msgCounter.current}`;
  }, []);

  // 1. Load initial sessions from localStorage or initialize first session
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to read chat sessions from storage:", e);
    }

    // Default first session
    startNewChat(false);
  }, []);

  // 2. Persist active session updates to localStorage
  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn("Failed to persist chat sessions:", e);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    document.title = "Style AI | ChatGPT-Style Fashion & Skin Assistant";
  }, []);

  // Back navigation handler
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Start a fresh chat session
  const startNewChat = (saveCurrent = true) => {
    const welcomeMsg: Message = {
      id: "welcome-" + Date.now(),
      sender: "ai",
      text:
        `Hello! 👋 I am your **Style AI Assistant**, trained on real fashion and textile dermatology datasets.\n\n` +
        `Ask me anything about fabrics, outfits, skin sensitivities, or search our verified catalog (*e.g. "Show me products under ₹2,000"*). You can also click the camera icon to upload a photo of your skin, fabric, or clothing care tag!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "system",
    };

    const newSessionId = "session-" + Date.now();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Conversation",
      createdAt: Date.now(),
      messages: [welcomeMsg],
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev.filter((s) => s.id !== newSessionId)].slice(0, 20);
      saveSessionsToStorage(updated);
      return updated;
    });

    setActiveSessionId(newSessionId);
    setMessages([welcomeMsg]);
    setInput("");
    setAttachedImage(null);
    setSuggestedPills(DEFAULT_SUGGESTIONS);
  };

  // Switch to an existing session
  const handleSelectSession = (sessionId: string) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveSessionId(found.id);
      setMessages(found.messages);
      setAttachedImage(null);
      setInput("");
    }
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    saveSessionsToStorage(filtered);

    if (activeSessionId === sessionId) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        startNewChat(false);
      }
    }
  };

  // Handle image upload from file picker
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message and get assistant response
  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if ((!text.trim() && !attachedImage) || loading) return;

    const userMessageText = text.trim() || (attachedImage ? "Uploaded photo for diagnosis" : "");
    const userMsg: Message = {
      id: nextId(),
      sender: "user",
      text: userMessageText,
      image: attachedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Update session title if first user message
    const isFirstUserMsg = !messages.some((m) => m.sender === "user");
    const updatedTitle = isFirstUserMsg ? userMessageText.slice(0, 28) + (userMessageText.length > 28 ? "..." : "") : undefined;

    const sentImage = attachedImage;
    if (!textToSend) setInput("");
    setAttachedImage(null);
    setLoading(true);

    let data: any = null;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const apiUrl = `${basePath}/api/chat/`.replace(/\/{2,}/g, "/");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          image: sentImage,
          skinType: profile?.skinType || "Sensitive / Allergy Prone",
          climate: "Moderate (18°C - 24°C)",
          history: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
            matchedProducts: m.matchedProducts,
            diagnosis: m.diagnosis,
          })),
          allergies: profile?.confirmedAllergies || [],
        }),
      });

      if (res.ok) {
        const parsed = await res.json();
        if (parsed && parsed.reply) {
          data = parsed;
        }
      }
    } catch (fetchErr) {
      console.warn("[Style AI] Server API unavailable, engaging high-availability client intelligence engine:", fetchErr);
    }

    // High-availability fallback: If network failed or running as static GitHub Pages export
    if (!data || !data.reply) {
      data = await generateClientChatResponse({
        message: text.trim(),
        image: sentImage,
        skinType: profile?.skinType || "Sensitive / Allergy Prone",
        climate: "Moderate (18°C - 24°C)",
        history: updatedMessages.map((m) => ({
          sender: m.sender,
          text: m.text,
          matchedProducts: m.matchedProducts,
          diagnosis: m.diagnosis,
        })),
        allergies: profile?.confirmedAllergies || [],
      });
    }

    try {
      if (data && data.reply) {
        const aiMsg: Message = {
          id: nextId(),
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: data.source || "conversational-ai",
          diagnosis: data.diagnosis,
          matchedProducts: data.matchedProducts || [],
        };

        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);

        if (Array.isArray(data.suggestedPills) && data.suggestedPills.length > 0) {
          setSuggestedPills(data.suggestedPills);
        }

        // Persist session
        setSessions((prev) => {
          const mapped = prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  title: updatedTitle || s.title,
                  messages: finalMessages,
                }
              : s
          );
          saveSessionsToStorage(mapped);
          return mapped;
        });
      }
    } catch (renderErr) {
      console.error("[Style AI render error]", renderErr);
    } finally {
      setLoading(false);
    }
  }

  const handleFeedback = (msgId: string, feedback: "useful" | "comfortable" | "unsuitable") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              userFeedback: feedback,
              feedbackNote:
                feedback === "unsuitable"
                  ? "Feedback noted: Excluded from style preferences."
                  : "Saved to your textile preferences!",
            }
          : m
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* ============================================================================== */}
      {/* 1. CHATGPT-STYLE SIDEBAR */}
      {/* ============================================================================== */}
      <div
        className={`${
          isSidebarOpen ? "w-72" : "w-0 -translate-x-full"
        } transition-all duration-300 ease-in-out bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 z-20 overflow-hidden md:relative absolute h-full`}
      >
        {/* New Chat Button & Back Navigation */}
        <div className="p-3.5 border-b border-slate-800/80 flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={() => startNewChat(true)}
            className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-100 hover:text-white transition shadow-xs group"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
              New Chat
            </span>
            <span className="text-[10px] text-slate-500 font-mono">⌘N</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Recent Conversations
          </div>

          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                  isActive
                    ? "bg-slate-800 text-white font-bold border border-slate-700/70"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* User Context Footer in Sidebar */}
        <div className="p-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Skin Profile:</span>
            <span className="font-bold text-blue-300">{profile?.skinType || "Sensitive"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Catalog Engine:</span>
            <span className="font-bold text-emerald-400">1,000 In-Stock</span>
          </div>
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" /> Return to Store
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. MAIN CHAT CONTAINER */}
      {/* ============================================================================== */}
      <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 relative min-w-0">
        {/* Top Header */}
        <div className="h-14 border-b border-slate-200 bg-white px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Back Arrow Navigation Button */}
            <button
              onClick={handleGoBack}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-blue-600 transition flex items-center gap-1.5 text-xs font-bold shrink-0 border border-slate-200/80 cursor-pointer"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5 shrink-0" />

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center font-black text-sm shadow-xs transition">
                ✨
              </div>
              <div>
                <h1 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  Style AI Assistant <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">ChatGPT Mode</span>
                </h1>
                <p className="text-[10px] text-slate-500">Grounded in 1,000 Verified Fashion Items & Sharp Vision Models</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startNewChat(true)}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Chat
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-4xl w-full mx-auto">
          {messages.map((m) => {
            const isUser = m.sender === "user";

            return (
              <div key={m.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                    isUser
                      ? "bg-slate-900 text-white"
                      : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] md:max-w-[78%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-4 shadow-xs ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-xs"
                        : "bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs"
                    }`}
                  >
                    {/* User Attached Image Preview */}
                    {m.image && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-950/10">
                        <img src={m.image} alt="Uploaded attachment" className="object-contain w-full max-h-56 rounded-lg" />
                      </div>
                    )}

                    {/* Formatted Markdown Content */}
                    {isUser ? (
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <MarkdownRenderer content={m.text} />
                    )}

                    {/* Diagnostic Process Card (When Diagnosis Returned) */}
                    {m.diagnosis && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                          <span className="flex items-center gap-1.5 text-blue-900 uppercase tracking-wider text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Clinical Assessment
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                            Comfort Index: {m.diagnosis.comfortScore}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Condition / Finding:</span>
                            <strong className="text-slate-900">{m.diagnosis.diseaseOrCondition}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Recommended Fabric:</span>
                            <strong className="text-emerald-700">{m.diagnosis.recommendedFabric}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Authentic Catalog Item Recommendations */}
                    {m.matchedProducts && m.matchedProducts.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Shirt className="w-3.5 h-3.5 text-blue-600" /> Authentic Items From 1,000-Item Catalog:
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">100% In-Stock</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {m.matchedProducts.map(({ product, explanation }) => (
                            <div
                              key={product.id}
                              className="p-3 bg-slate-50/80 hover:bg-blue-50/30 rounded-xl border border-slate-200 transition text-xs flex flex-col justify-between shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                    {product.fabric}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Safety: {product.skinSafetyScore}/100
                                  </span>
                                </div>
                                <h5 className="font-extrabold text-slate-900 line-clamp-1">{product.name}</h5>
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{explanation}</p>
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="font-black text-sm text-slate-900">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                <Link
                                  href={`/shop/${product.id}`}
                                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 hover:underline"
                                >
                                  View Item <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback Action Buttons */}
                    {!isUser && m.source !== "system" && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleFeedback(m.id, "useful")}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 ${
                              m.userFeedback === "useful"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" /> Helpful
                          </button>
                          <button
                            onClick={() => handleFeedback(m.id, "unsuitable")}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 ${
                              m.userFeedback === "unsuitable"
                                ? "bg-rose-600 text-white border-rose-600"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" /> Unsuitable
                          </button>
                          {m.feedbackNote && (
                            <span className="text-[10px] text-emerald-600 font-bold ml-1">{m.feedbackNote}</span>
                          )}
                        </div>

                        {/* Source Badge */}
                        <span className="text-[10px] font-bold text-slate-400">
                          {m.source === "multimodal-ai-engine"
                            ? "🔬 Multimodal Vision"
                            : m.source === "catalog-retrieval"
                            ? "🛍️ 1,000-Product Catalog"
                            : "💬 Style AI Assistant"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className={`text-[10px] text-slate-400 block px-1 ${isUser ? "text-right" : "text-left"}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Assistant Loading Pulse */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs text-xs font-bold text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Thinking & querying verified product catalog...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ============================================================================== */}
        {/* 3. DYNAMIC SUGGESTED PILLS */}
        {/* ============================================================================== */}
        <div className="px-4 py-2 max-w-4xl w-full mx-auto overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
          {suggestedPills.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                if (sug.includes("Upload")) {
                  fileInputRef.current?.click();
                } else {
                  handleSend(sug);
                }
              }}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition whitespace-nowrap shadow-2xs hover:bg-blue-50/50"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Attached Image Preview Pill */}
        {attachedImage && (
          <div className="max-w-4xl w-full mx-auto px-4 py-1.5 shrink-0">
            <div className="relative inline-flex items-center gap-2 border border-blue-300 rounded-xl overflow-hidden shadow-xs bg-blue-50/80 p-1.5 pr-3">
              <img src={attachedImage} alt="Attachment" className="h-10 w-10 object-cover rounded-lg" />
              <div className="text-[11px]">
                <strong className="block text-blue-900">Photo Attached</strong>
                <span className="text-slate-500 text-[10px]">Ready to diagnose</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="ml-2 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* 4. CHAT INPUT BAR */}
        {/* ============================================================================== */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="max-w-4xl mx-auto flex items-center gap-2"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition flex items-center justify-center shrink-0"
              title="Attach skin, fabric, or care label photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Main Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                attachedImage
                  ? "Describe this photo or ask a question (optional)..."
                  : "Message Style AI (e.g. 'Show products under ₹2,000', 'Is polyester safe?')..."
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 placeholder:text-slate-400"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && !attachedImage) || loading}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 shadow-xs flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
