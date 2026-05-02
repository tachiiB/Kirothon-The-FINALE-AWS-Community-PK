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
import { Sparkles, AlertCircle, RotateCcw, Zap, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "kairos_results";
const PROFILE_KEY = "kairos_profile";

export default function Home() {
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

  // When emails are entered/loaded, turn off demo mode automatically
  const handleEmailsChange = (newEmails: string[]) => {
    setEmails(newEmails);
    if (newEmails.some(e => e.trim())) {
      setDemoMode(false);
    }
  };

  // When demo mode turns ON, clear emails
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
    // Try live analysis first
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, profile }),
      });

      if (res.ok) {
        return await res.json();
      }
      // Non-ok (502, 504, 500) → fall through to demo fallback
    } catch {
      // Network error → fall through to demo fallback
    }

    // Automatic fallback — serve precomputed results
    const fallbackRes = await fetch("/api/analyze?demo=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: " ", profile }),
    });
    const data = await fallbackRes.json();
    return { ...data, isFallback: true };
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

  const hasEmails = emails.some(e => e.trim());

  return (
    <main className="min-h-screen">
      <Hero onGetStarted={scrollToInput} />

      <div ref={inputRef} className="max-w-5xl mx-auto px-4 pb-8 space-y-5">
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
            Live AI analysis timed out — showing pre-analyzed sample results. Your emails were not lost.
          </div>
        )}

        <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="group flex items-center gap-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 disabled:hover:scale-100"
          >
            <Sparkles size={20} className={loading ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
            {loading ? "Analyzing..." : demoMode ? "Run Demo" : "Analyze Inbox"}
          </button>

          {/* Demo Mode toggle */}
          <button
            onClick={handleDemoModeToggle}
            className={`flex items-center gap-2 px-4 py-4 rounded-2xl text-sm border transition-all ${
              demoMode
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
            }`}
            title={demoMode ? "Demo Mode ON — emails cleared. Click to disable." : "Enable Demo Mode for instant pre-analyzed results"}
          >
            <Zap size={14} />
            {demoMode ? "Demo Mode ON" : "Demo Mode"}
          </button>

          {/* Conflict warning */}
          {demoMode && hasEmails && (
            <p className="w-full text-center text-xs text-amber-400/80">
              Demo Mode is active — your loaded emails have been cleared.
            </p>
          )}

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
