"use client";

import { useState } from "react";
import { Map, ChevronDown, Loader2, Briefcase, Target, BookOpen, Building2, Globe, TrendingUp, X } from "lucide-react";
import type { StudentProfile } from "@/lib/types";
import type { RoadmapResponse, TargetRole } from "@/lib/roadmap";
import { ROLES } from "@/lib/roadmap";

interface CareerRoadmapProps {
  profile: StudentProfile;
}

const PHASE_COLORS = [
  { border: "border-violet-500/40", bg: "bg-violet-500/10", dot: "bg-violet-500", text: "text-violet-400", num: "bg-violet-500/20 text-violet-300" },
  { border: "border-cyan-500/40",   bg: "bg-cyan-500/10",   dot: "bg-cyan-500",   text: "text-cyan-400",   num: "bg-cyan-500/20 text-cyan-300" },
  { border: "border-emerald-500/40",bg: "bg-emerald-500/10",dot: "bg-emerald-500",text: "text-emerald-400",num: "bg-emerald-500/20 text-emerald-300" },
  { border: "border-amber-500/40",  bg: "bg-amber-500/10",  dot: "bg-amber-500",  text: "text-amber-400",  num: "bg-amber-500/20 text-amber-300" },
];

export default function CareerRoadmap({ profile }: CareerRoadmapProps) {
  const [open, setOpen] = useState(false);
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
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
      >
        <Map size={14} /> Career Roadmap
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
            style={{ background: "rgba(14,19,36,0.98)" }}>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 z-10"
              style={{ background: "rgba(14,19,36,0.98)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                  <Map size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">Career Roadmap</p>
                  <p className="text-xs text-slate-500">Pakistan-specific · Phase-by-phase plan</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Role selector */}
              {!roadmap && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Select your target role and I'll generate a personalized, Pakistan-aware roadmap.</p>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value as TargetRole)}
                      className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                      <option value="" className="bg-[#0A0F1E]">Choose a target role...</option>
                      {ROLES.map(r => (
                        <option key={r} value={r} className="bg-[#0A0F1E]">{r}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    onClick={generate}
                    disabled={!selectedRole || loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Generating your roadmap...</> : <><TrendingUp size={16} /> Generate Roadmap</>}
                  </button>
                </div>
              )}

              {/* Roadmap output */}
              {roadmap && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-bold text-white text-base">{roadmap.role}</p>
                      <span className="text-xs bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full border border-violet-500/30">
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
                        <div key={i} className={`border rounded-xl overflow-hidden transition-all ${c.border}`}>
                          <button
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left ${c.bg} hover:opacity-90 transition-opacity`}
                            onClick={() => setExpandedPhase(isExpanded ? null : i)}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.num}`}>
                              {phase.phase}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm">{phase.title}</p>
                              <p className="text-xs text-slate-500">{phase.duration}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.num}`}>{phase.salaryRange}</span>
                            <ChevronDown size={14} className={`text-slate-500 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-3 space-y-4 border-t border-white/5">
                              {/* Skills */}
                              <div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <BookOpen size={10} /> Skills to acquire
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {phase.skills.map((s, j) => (
                                    <span key={j} className={`text-xs px-2.5 py-1 rounded-full border ${c.border} ${c.bg} ${c.text}`}>{s}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Target size={10} /> Actions
                                </p>
                                <ul className="space-y-1.5">
                                  {phase.actions.map((a, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                                      {a}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Resources */}
                              <div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <BookOpen size={10} /> Resources
                                </p>
                                <ul className="space-y-1 text-sm text-slate-400">
                                  {phase.resources.map((r, j) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <span className="text-slate-600">→</span> {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Milestone */}
                              <div className={`rounded-lg px-3 py-2.5 ${c.bg} border ${c.border}`}>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Milestone</p>
                                <p className="text-sm text-white">{phase.milestone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Top companies + global opportunities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Building2 size={10} /> Top companies hiring
                      </p>
                      <ul className="space-y-1.5">
                        {roadmap.topCompanies.map((c, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Globe size={10} /> Global opportunities
                      </p>
                      <ul className="space-y-1.5">
                        {roadmap.globalOpportunities.map((o, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />{o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reset */}
                  <button
                    onClick={() => { setRoadmap(null); setSelectedRole(""); }}
                    className="w-full text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors"
                  >
                    ← Generate for a different role
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
