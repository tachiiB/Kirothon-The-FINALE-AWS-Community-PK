"use client";

import { ArrowRight, Mail, Clock, FileText, Sparkles, Shield, Zap } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center">
      {/* Ambient orbs */}
      <div className="animate-orb-1 absolute top-[-120px] left-[-120px] w-[600px] h-[600px] rounded-full bg-violet-600/12 blur-[130px] pointer-events-none" />
      <div className="animate-orb-2 absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none" />
      <div className="animate-orb-3 absolute top-[30%] left-[55%] w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />

      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-40" />

      {/* Top fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.12),transparent_65%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="animate-badge-pulse inline-flex items-center gap-2.5 glass border border-violet-500/30 rounded-full px-5 py-2.5 text-sm text-violet-300 mb-10"
          style={{ animationDelay: "0s" }}
        >
          <Sparkles size={13} className="text-cyan-400" />
          <span className="font-medium">AI-Powered Opportunity Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-7xl font-bold mb-6 leading-[1.05] tracking-tight animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Stop Missing{" "}
          <span className="gradient-text-animated">
            Deadlines.
          </span>
          <br />
          <span className="text-white/90">Start Winning.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-slate-400 text-xl mb-3 max-w-2xl mx-auto leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Paste your opportunity emails. Kairos scores every scholarship, internship, and fellowship
          against your profile — and tells you exactly what to apply to first.
        </p>

        <p
          className="text-slate-600 text-sm mb-12 max-w-xl mx-auto animate-slide-up"
          style={{ animationDelay: "0.25s" }}
        >
          Deterministic scoring engine. No guesswork. Every rank is backed by evidence you can read.
        </p>

        {/* CTA */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={onGetStarted}
            className="group btn-glow inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white font-semibold px-10 py-4 rounded-2xl text-lg shadow-xl shadow-violet-500/30"
          >
            <Mail size={18} />
            Analyze My Emails
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" />
          </button>
        </div>

        {/* Trust badges */}
        <div
          className="flex items-center justify-center gap-6 mt-8 flex-wrap animate-slide-up"
          style={{ animationDelay: "0.35s" }}
        >
          {[
            { icon: Shield, text: "No emails stored" },
            { icon: Zap,    text: "Results in < 15s" },
            { icon: Mail,   text: "Gmail integration" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-slate-600">
              <Icon size={11} className="text-slate-700" />
              {text}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { icon: Mail,     value: "Up to 15",  label: "Emails analyzed" },
            { icon: Clock,    value: "< 15s",     label: "Ranked results" },
            { icon: FileText, value: "1-click",   label: "Cover letter" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="card-hover glass border border-violet-500/15 rounded-2xl py-5 px-3 group"
            >
              <Icon size={15} className="text-violet-400 mx-auto mb-2.5 group-hover:text-cyan-400 transition-colors" />
              <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
