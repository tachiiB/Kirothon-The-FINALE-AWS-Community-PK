"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hero from "@/components/Hero";
import ProfileForm from "@/components/ProfileForm";
import EmailInput from "@/components/EmailInput";
import ResultsPanel, { ResultsSkeleton } from "@/components/ResultsPanel";
import Footer from "@/components/Footer";
import TabNav, { type Tab } from "@/components/TabNav";
import AdvisorTab from "@/components/AdvisorTab";
import RoadmapTab from "@/components/RoadmapTab";
import { DEFAULT_PROFILE } from "@/lib/sampleData";
import type { StudentProfile, AnalyzeResponse } from "@/lib/types";
import { Sparkles, AlertCircle, RotateCcw, Zap, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "kairos_results";
const PROFILE_KEY = "kairos_profile";

const tabVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("analyzer");
  const [emails, setEmails] = useState<string[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setResults(JSON.parse(saved));
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  }, [profile]);

  const handleEmailsChange = (newEmails: string[]) => {
    setEmails(newEmails);
    if (newEmails.some(e => e.trim())) setDemoMode(false);
  };

  const handleDemoModeToggle = () => {
    if (!demoMode) {
      setEmails([]);
      setResults(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    setDemoMode(d => !d);
  };

  const scrollToInput = () =>
    setTimeout(() => inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

  const fetchWithFallback = async (emails: string, profile: StudentProfile): Promise<AnalyzeResponse & { isFallback?: boolean }> => {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, profile }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const fallbackRes = await fetch("/api/analyze?demo=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: " ", profile }),
    });
    return { ...(await fallbackRes.json()), isFallback: true };
  };

  const handleAnalyze = async () => {
    const combined = emails.filter(e => e.trim()).join("\n\n---\n\n");
    if (!demoMode && !combined) {
      setError("Please add at least one email or load sample emails.");
      scrollToInput();
      return;
    }
    setError(null);
    setIsFallback(false);
    setLoading(true);
    setResults(null);
    try {
      let data: AnalyzeResponse & { isFallback?: boolean };
      if (demoMode) {
        const res = await fetch("/api/analyze?demo=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: " ", profile }),
        });
        data = await res.json();
      } else {
        data = await fetchWithFallback(combined, profile);
      }
      setResults(data);
      setIsFallback(!!data.isFallback);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setEmails([]);
    setIsFallback(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <main className="min-h-screen">
      {/* Hero only on analyzer tab */}
      {activeTab === "analyzer" && <Hero onGetStarted={scrollToInput} />}

      {/* Sticky tab navigation */}
      <TabNav active={activeTab} onChange={setActiveTab} hasResults={!!results} />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "analyzer" && (
          <motion.div
            key="analyzer"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <div ref={inputRef} className="max-w-5xl mx-auto px-4 pb-8 pt-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <EmailInput emails={emails} onChange={handleEmailsChange} />
                <ProfileForm profile={profile} onChange={setProfile} />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {isFallback && (
                <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-xl px-4 py-3 text-sm">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  Live AI analysis timed out — showing pre-analyzed sample results.
                </div>
              )}

              <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="group btn-glow flex items-center gap-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 shadow-xl shadow-violet-500/30"
                >
                  <Sparkles size={20} className={loading ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
                  {loading ? "Analyzing..." : demoMode ? "Run Demo" : "Analyze Inbox"}
                </button>

                <button
                  onClick={handleDemoModeToggle}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-4 rounded-2xl text-sm border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    demoMode
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                  }`}
                  title={loading ? "Analysis in progress..." : demoMode ? "Demo Mode ON" : "Enable Demo Mode"}
                >
                  <Zap size={14} />
                  {demoMode ? "Demo Mode ON" : "Demo Mode"}
                </button>

                {results && !loading && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 text-slate-500 hover:text-white border border-white/10 hover:border-white/25 px-5 py-4 rounded-2xl text-sm transition-all"
                  >
                    <RotateCcw size={14} /> Clear & Reset
                  </button>
                )}
              </div>

              {loading && <ResultsSkeleton />}

              <AnimatePresence>
                {results && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultsPanel data={results} profile={profile} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === "advisor" && (
          <motion.div
            key="advisor"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <AdvisorTab
              profile={profile}
              topOpportunities={results?.results ?? []}
            />
          </motion.div>
        )}

        {activeTab === "roadmap" && (
          <motion.div
            key="roadmap"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <RoadmapTab profile={profile} />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
