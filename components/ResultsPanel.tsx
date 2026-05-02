"use client";

import type { AnalyzeResponse, StudentProfile } from "@/lib/types";
import OpportunityCard from "./OpportunityCard";
import CoverLetterModal from "./CoverLetterModal";
import CareerRoadmap from "./CareerRoadmap";
import { Trophy, Filter, TrendingUp, AlertTriangle, Clock, Star } from "lucide-react";
import { useState } from "react";
import type { RankedOpportunity } from "@/lib/types";

interface ResultsPanelProps {
  data: AnalyzeResponse;
  profile: StudentProfile;
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-40 shimmer rounded-lg" />
        <div className="h-5 w-16 shimmer rounded-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="glass border border-violet-500/15 rounded-2xl p-5 space-y-3"
          style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 shimmer rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 shimmer rounded" />
              <div className="h-4 w-3/4 shimmer rounded" />
              <div className="h-3 w-1/3 shimmer rounded" />
            </div>
            <div className="w-14 h-14 shimmer rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsPanel({ data, profile }: ResultsPanelProps) {
  const { results, spamCount, processedAt } = data;
  const [coverLetterItem, setCoverLetterItem] = useState<RankedOpportunity | null>(null);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.score.total, 0) / results.length) : 0;

  const critical  = results.filter(r => r.daysUntilDeadline !== null && r.daysUntilDeadline <= 3);
  const thisWeek  = results.filter(r => r.daysUntilDeadline !== null && r.daysUntilDeadline > 3 && r.daysUntilDeadline <= 7);
  const topScore  = results[0]?.score.total ?? 0;

  return (
    <div className="space-y-5">

      {/* Urgency Alert Banner */}
      {critical.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-5 py-3.5 animate-fade-slide-in">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <span className="text-sm font-medium">
            <strong>{critical.length} deadline{critical.length > 1 ? "s" : ""} in the next 3 days</strong>
            {" — "}{critical.map(r => r.opportunity.title).join(", ")}
          </span>
        </div>
      )}
      {thisWeek.length > 0 && critical.length === 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-2xl px-5 py-3.5 animate-fade-slide-in">
          <Clock size={16} className="text-amber-400 flex-shrink-0" />
          <span className="text-sm font-medium">
            <strong>{thisWeek.length} deadline{thisWeek.length > 1 ? "s" : ""} this week</strong>
            {" — "}{thisWeek.map(r => r.opportunity.title).join(", ")}
          </span>
        </div>
      )}

      {/* Header bar */}
      <div className="glass border border-violet-500/20 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <span className="font-bold text-lg">Ranked Results</span>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <CareerRoadmap profile={profile} />
            <span className="bg-violet-600/20 text-violet-300 border border-violet-500/25 text-xs px-2.5 py-1 rounded-full font-medium">
              {results.length} found
            </span>
            {spamCount > 0 && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full">
                {spamCount} spam filtered
              </span>
            )}
            <span className="bg-white/5 text-slate-400 border border-white/10 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={10} /> avg {avg}
            </span>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star size={10} /> top {topScore}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <Filter size={10} />
          <span>Fit ×0.45 · Urgency ×0.30 · Completeness ×0.15 · Prestige ×0.10</span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="glass border border-violet-500/15 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/10 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-violet-400" />
          </div>
          <p className="text-slate-300 font-semibold">No real opportunities found</p>
          <p className="text-slate-500 text-sm mt-1">Try loading the sample emails to see the demo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((item, i) => (
            <OpportunityCard
              key={`${item.opportunity.emailIndex}-${i}`}
              item={item}
              style={{ animationDelay: `${i * 70}ms` }}
              onCoverLetter={() => setCoverLetterItem(item)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-600 pt-2">
        Analyzed {new Date(processedAt).toLocaleTimeString()} · Results saved locally
      </p>

      {coverLetterItem && (
        <CoverLetterModal
          item={coverLetterItem}
          profile={profile}
          onClose={() => setCoverLetterItem(null)}
        />
      )}
    </div>
  );
}
