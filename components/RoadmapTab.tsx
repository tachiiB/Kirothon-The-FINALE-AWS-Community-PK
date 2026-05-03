"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ChevronDown, Loader2, Target, BookOpen, Building2, Globe, TrendingUp } from "lucide-react";
import type { StudentProfile } from "@/lib/types";
import type { RoadmapResponse, TargetRole } from "@/lib/roadmap";
import { ROLES } from "@/lib/roadmap";

interface RoadmapTabProps {
  profile: StudentProfile;
}

const PHASE_COLORS = [
  { border: "border-violet-500/40", bg: "bg-violet-500/10", dot: "bg-violet-500", text: "text-violet-400", num: "bg-violet-500/20 text-violet-300", glow: "shadow-violet-500/20" },
  { border: "border-cyan-500/40",   bg: "bg-cyan-500/10",   dot: "bg-cyan-500",   text: "text-cyan-400",   num: "bg-cyan-500/20 text-cyan-300",   glow: "shadow-cyan-500/20" },
  { border: "border-emerald-500/40",bg: "bg-emerald-500/10",dot: "bg-emerald-500",text: "text-emerald-400",num: "bg-emerald-500/20 text-emerald-300",glow: "shadow-emerald-500/20" },
  { border: "border-amber-500/40",  bg: "bg-amber-500/10",  dot: "bg-amber-500",  text: "text-amber-400",  num: "bg-amber-500/20 text-amber-300",  glow: "shadow-amber-500/20" },
];

export default function RoadmapTab({ profile }: RoadmapTabProps) {
  const [selectedRole, setSelectedRole] = useState<TargetRole | "">("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const generate = async () => {
    if (!selectedRole || loading) return;
    setLoading(true);
    setError(null);
    setRoadmap(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, profile }),
      });
      if (!res.ok) throw new Error("Failed to generate roadmap");
      const data = await res.json() as RoadmapResponse;
      setRoadmap(data);
      setExpandedPhase(0);
    } catch {
      setError("Could not generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Map size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Career Roadmap</h2>
          <p className="text-sm text-slate-500">Pakistan-specific · Phase-by-phase · Real companies & salaries</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!roadmap ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Role grid */}
            <div>
              <p className="text-sm text-slate-400 mb-4">Select your target role to generate a personalized roadmap:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`text-left text-xs px-3 py-3 rounded-xl border transition-all duration-200 ${
                      selectedRole === role
                        ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                        : "border-white/8 bg-white/3 text-slate-400 hover:border-violet-500/30 hover:text-slate-300"
                    }`}
                    style={{ background: selectedRole === role ? undefined : "rgba(255,255,255,0.03)" }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={generate}
              disabled={!selectedRole || loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all text-base shadow-lg shadow-violet-500/25"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Generating your roadmap...</>
                : <><TrendingUp size={18} /> Generate Roadmap</>
              }
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-5"
          >
            {/* Summary card */}
            <div className="glass border border-violet-500/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-bold text-white text-lg">{roadmap.role}</p>
                <span className="text-xs bg-violet-500/20 text-violet-300 px-3 py-1.5 rounded-full border border-violet-500/30 font-semibold">
                  {roadmap.totalDuration}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{roadmap.summary}</p>
            </div>

            {/* Phases */}
            <div className="space-y-3">
              {roadmap.phases.map((phase, i) => {
                const c = PHASE_COLORS[i % PHASE_COLORS.length];
                const isExpanded = expandedPhase === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`border rounded-2xl overflow-hidden ${c.border}`}
                  >
                    <button
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left ${c.bg} hover:opacity-90 transition-opacity`}
                      onClick={() => setExpandedPhase(isExpanded ? null : i)}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${c.num}`}>
                        {phase.phase}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{phase.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{phase.duration}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.num}`}>{phase.salaryRange}</span>
                      <ChevronDown size={15} className={`text-slate-500 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-4 space-y-4 border-t border-white/5">
                            <div>
                              <p className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${c.text}`}>
                                <BookOpen size={11} /> Skills to acquire
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {phase.skills.map((s, j) => (
                                  <span key={j} className={`text-xs px-2.5 py-1 rounded-full border ${c.border} ${c.bg} ${c.text}`}>{s}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${c.text}`}>
                                <Target size={11} /> Actions
                              </p>
                              <ul className="space-y-1.5">
                                {phase.actions.map((a, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />{a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${c.text}`}>
                                <BookOpen size={11} /> Resources
                              </p>
                              <ul className="space-y-1 text-sm text-slate-400">
                                {phase.resources.map((r, j) => (
                                  <li key={j} className="flex items-start gap-2"><span className="text-slate-600">→</span>{r}</li>
                                ))}
                              </ul>
                            </div>
                            <div className={`rounded-xl px-4 py-3 ${c.bg} border ${c.border}`}>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Milestone</p>
                              <p className="text-sm text-white font-medium">{phase.milestone}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Companies + Global */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 size={11} /> Top companies hiring
                </p>
                <ul className="space-y-2">
                  {roadmap.topCompanies.map((c, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Globe size={11} /> Global opportunities
                </p>
                <ul className="space-y-2">
                  {roadmap.globalOpportunities.map((o, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => { setRoadmap(null); setSelectedRole(""); }}
              className="w-full text-sm text-slate-500 hover:text-slate-300 py-3 transition-colors border border-white/5 rounded-xl hover:border-white/10"
            >
              ← Generate for a different role
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
