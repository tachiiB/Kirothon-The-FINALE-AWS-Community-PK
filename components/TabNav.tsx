"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Map } from "lucide-react";

export type Tab = "analyzer" | "advisor" | "roadmap";

interface TabNavProps {
  active: Tab;
  onChange: (t: Tab) => void;
  hasResults: boolean;
}

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "analyzer", label: "AI Analyzer",  icon: Sparkles,      desc: "Rank your opportunities" },
  { id: "advisor",  label: "AI Advisor",   icon: MessageSquare, desc: "Chat in English or Roman Urdu" },
  { id: "roadmap",  label: "Career Roadmap", icon: Map,         desc: "Phase-by-phase plan" },
];

export default function TabNav({ active, onChange, hasResults }: TabNavProps) {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0A0F1E]/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-stretch gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-6 py-4 flex-1 sm:flex-none sm:px-8 transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
                }`}
              >
                <div className={`flex items-center gap-2 font-bold text-base sm:text-lg transition-all ${isActive ? "text-white" : "text-slate-500"}`}>
                  <Icon size={18} className={isActive ? "text-violet-400" : "text-slate-600"} />
                  {tab.label}
                </div>
                <span className={`text-xs hidden sm:block transition-all ${isActive ? "text-slate-400" : "text-slate-700"}`}>
                  {tab.desc}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
