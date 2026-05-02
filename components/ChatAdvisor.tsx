"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, ChevronDown, Loader2 } from "lucide-react";
import type { StudentProfile, RankedOpportunity } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatAdvisorProps {
  profile: StudentProfile;
  topOpportunities: RankedOpportunity[];
}

const QUICK_PROMPTS = [
  { label: "Pehli internship kaise milegi?", text: "Mujhe pehli internship kaise milegi? Main Lahore mein hoon aur CS kar raha hoon." },
  { label: "Best companies in Lahore?", text: "What are the best tech companies to apply to in Lahore for a fresh CS graduate?" },
  { label: "Meri top opportunity konsi hai?", text: "Meri ranked opportunities mein se mujhe pehle kaunsi apply karni chahiye aur kyon?" },
  { label: "HEC scholarship tips?", text: "How do I strengthen my HEC scholarship application? What do they look for?" },
];

export default function ChatAdvisor({ profile, topOpportunities }: ChatAdvisorProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

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
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Advisor unavailable right now. Please try again.",
        };
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
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold px-5 py-3.5 rounded-2xl shadow-2xl shadow-violet-500/40 transition-all hover:scale-105 active:scale-95"
        aria-label="Open AI Career Advisor"
      >
        <Bot size={18} />
        <span className="text-sm">Career Advisor</span>
        {open ? <ChevronDown size={14} /> : <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden"
          style={{ height: "520px", background: "rgba(14,19,36,0.97)", backdropFilter: "blur(16px)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-cyan-500/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Bot size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Kairos AI Advisor</p>
                <p className="text-xs text-emerald-400">Pakistan-aware • Roman Urdu / English</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center pt-2">
                  Ask in English or Roman Urdu — I know Pakistan's job market.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.text)}
                      className="text-left text-xs px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/40 text-slate-300 transition-all"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-br-sm"
                      : "bg-white/8 border border-white/10 text-slate-200 rounded-bl-sm"
                  }`}
                  style={msg.role === "assistant" ? { background: "rgba(255,255,255,0.06)" } : {}}
                >
                  {msg.content || (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Loader2 size={12} className="animate-spin" /> Thinking...
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-violet-500/50 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask in English ya Roman Urdu..."
                disabled={streaming}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none disabled:opacity-50"
                maxLength={1000}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim()}
                className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <Send size={12} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
