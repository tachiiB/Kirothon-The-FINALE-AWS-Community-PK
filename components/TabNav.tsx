"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Map } from "lucide-react";

export type Tab = "analyzer" | "advisor" | "roadmap";

interface TabNavProps {
  active: Tab;
  onChange: (t: Tab) => void;
  hasResults: boolean;
}

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "analyzer", label: "Analyzer",   icon: Sparkles },
  { id: "advisor",  label: "AI Advisor", icon: MessageSquare },
  { id: "roadmap",  label: "Roadmap",    icon: Map },
];

export default function TabNav({ active, onChange, hasResults }: TabNavProps) {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0A0F1E]/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.badge && (
                  <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
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
