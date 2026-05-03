"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import type { StudentProfile, RankedOpportunity } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AdvisorTabProps {
  profile: StudentProfile;
  topOpportunities: RankedOpportunity[];
}

const QUICK_PROMPTS = [
  { label: "🎯 First internship strategy",    text: "Mujhe pehli internship kaise milegi? Main Lahore mein hoon aur CS kar raha hoon." },
  { label: "🏢 Best Lahore tech companies",   text: "What are the best tech companies in Lahore for a fresh CS graduate? Include salaries." },
  { label: "📋 Top opportunity breakdown",    text: "Meri ranked opportunities mein se mujhe pehle kaunsi apply karni chahiye aur kyon?" },
  { label: "🎓 HEC scholarship tips",         text: "How do I strengthen my HEC scholarship application? What do they look for?" },
  { label: "💼 Remote jobs from Pakistan",    text: "How can I get a remote job from Pakistan? Which platforms work best?" },
  { label: "🚀 6-month career roadmap",       text: "Give me a realistic 6-month plan to land my first tech job in Pakistan." },
];

export default function AdvisorTab({ profile, topOpportunities }: AdvisorTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          profile,
          topOpportunities: topOpportunities.slice(0, 3),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Advisor unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const { text } = JSON.parse(payload) as { text: string };
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: updated[updated.length - 1].content + text,
              };
              return updated;
            });
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Advisor unavailable right now. Please try again." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Bot size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Kairos AI Advisor</h2>
          <p className="text-sm text-slate-500">Industry Intelligence · English & Roman Urdu · Pakistan-aware</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 mb-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-violet-400" />
              </div>
              <p className="text-slate-400 font-medium mb-1">Your AI Career Advisor</p>
              <p className="text-slate-600 text-sm">Ask anything about Pakistan's tech industry, in English or Roman Urdu.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.text)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-violet-500/40 text-slate-300 transition-all duration-200 group"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] text-sm leading-relaxed rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-br-sm"
                    : "border border-white/10 text-slate-200 rounded-bl-sm"
                }`}
                style={msg.role === "assistant" ? { background: "rgba(255,255,255,0.06)" } : {}}
              >
                {msg.content ? (
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                    {msg.content}
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-slate-400">
                    <Loader2 size={13} className="animate-spin" /> Thinking...
                  </span>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border border-white/10 rounded-2xl overflow-hidden focus-within:border-violet-500/50 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask in English ya Roman Urdu... (Enter to send, Shift+Enter for new line)"
          disabled={streaming}
          rows={2}
          className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none px-4 pt-3 pb-2 resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-slate-600">Shift+Enter for new line</span>
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Send size={13} />
            {streaming ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
