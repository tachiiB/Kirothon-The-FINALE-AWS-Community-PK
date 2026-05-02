"use client";

import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import ProfileForm from "@/components/ProfileForm";
import EmailInput from "@/components/EmailInput";
import ResultsPanel, { ResultsSkeleton } from "@/components/ResultsPanel";
import Footer from "@/components/Footer";
import ChatAdvisor from "@/components/ChatAdvisor";
import { DEFAULT_PROFILE } from "@/lib/sampleData";
import type { StudentProfile, AnalyzeResponse } from "@/lib/types";
import { Sparkles, AlertCircle, RotateCcw, Zap } from "lucide-react";

const STORAGE_KEY = "kairos_results";
const PROFILE_KEY = "kairos_profile";

export default function Home() {
  const [emails, setEmails] = useState<string[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [demoMode, setDemoMode] = useState(false);
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

  const scrollToInput = () =>
    setTimeout(() => inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

  const handleAnalyze = async () => {
    const combined = emails.filter(e => e.trim()).join("\n\n---\n\n");

    if (!demoMode && !combined) {
      setError("Please add at least one email or load sample emails.");
      scrollToInput();
      return;
    }

    setError(null);
    setLoading(true);
    setResults(null);

    try {
      const url = demoMode ? "/api/analyze?demo=true" : "/api/analyze";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: combined || " ", profile }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data: AnalyzeResponse & { isFallback?: boolean } = await res.json();
      setResults(data);

      if (data.isFallback && !demoMode) {
        setError("Live analysis timed out — showing pre-analyzed sample results.");
      }

      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setEmails([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <main className="min-h-screen">
      <Hero onGetStarted={scrollToInput} />

      <div ref={inputRef} className="max-w-5xl mx-auto px-4 pb-8 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <EmailInput emails={emails} onChange={setEmails} />
          <ProfileForm profile={profile} onChange={setProfile} />
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="group flex items-center gap-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 disabled:hover:scale-100"
          >
            <Sparkles size={20} className={loading ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
            {loading ? "Analyzing..." : "Analyze Inbox"}
          </button>

          {/* Demo Mode toggle */}
          <button
            onClick={() => setDemoMode(d => !d)}
            className={`flex items-center gap-2 px-4 py-4 rounded-2xl text-sm border transition-all ${
              demoMode
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
            }`}
            title="Demo Mode skips the API and shows instant pre-analyzed results"
          >
            <Zap size={14} />
            Demo Mode {demoMode ? "ON" : "OFF"}
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
        {results && !loading && <ResultsPanel data={results} profile={profile} />}
      </div>

      <Footer />

      {results && (
        <ChatAdvisor
          profile={profile}
          topOpportunities={results.results}
        />
      )}
    </main>
  );
}
