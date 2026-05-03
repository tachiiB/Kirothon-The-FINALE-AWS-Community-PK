"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, ExternalLink, CheckSquare, AlertTriangle, FileText, CalendarPlus } from "lucide-react";
import type { RankedOpportunity } from "@/lib/types";
import ScoreRing from "./ScoreRing";

interface OpportunityCardProps {
  item: RankedOpportunity;
  style?: React.CSSProperties;
  onCoverLetter?: () => void;
}

const RANK_STYLE: Record<number, string> = {
  1: "from-yellow-500/30 to-amber-500/10 border-yellow-500/40",
  2: "from-slate-400/20 to-slate-500/10 border-slate-400/30",
  3: "from-amber-700/20 to-amber-800/10 border-amber-700/30",
};
const RANK_LABEL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const TYPE_PILL: Record<string, string> = {
  scholarship: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  internship:  "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  fellowship:  "bg-violet-500/15 text-violet-400 border-violet-500/25",
  competition: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  research:    "bg-blue-500/15 text-blue-400 border-blue-500/25",
  default:     "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

function priority(score: number) {
  if (score >= 75) return { label: "Critical", cls: "bg-red-500/20 text-red-400 border-red-500/30" };
  if (score >= 55) return { label: "High",     cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  if (score >= 35) return { label: "Medium",   cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return               { label: "Low",      cls: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%`, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function buildCalendarUrl(opp: import("@/lib/types").ExtractedOpportunity): string {
  const title = encodeURIComponent(`Apply: ${opp.title}`);
  const org = encodeURIComponent(opp.organization);
  const link = opp.applicationLink ? `\nApply: ${opp.applicationLink}` : "";
  const details = encodeURIComponent(
    `Opportunity: ${opp.title}\nOrganization: ${opp.organization}${link}\n\nRanked by Kairos — kairos-production-5dd9.up.railway.app`
  );
  let dates = "";
  if (opp.deadline) {
    const d = opp.deadline.replace(/-/g, "");
    const end = new Date(opp.deadline);
    end.setDate(end.getDate() + 1);
    const endStr = end.toISOString().slice(0, 10).replace(/-/g, "");
    dates = `${d}/${endStr}`;
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${org}`;
}

export default function OpportunityCard({ item, style, onCoverLetter }: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { rank, opportunity: opp, score, actionChecklist, daysUntilDeadline } = item;
  const rankStyle = RANK_STYLE[rank] ?? "from-violet-500/10 to-transparent border-violet-500/20";
  const typePill = TYPE_PILL[opp.type] ?? TYPE_PILL.default;
  const prio = priority(score.total);

  return (
    <div
      style={style}
      className={`animate-fade-slide-in card-hover glass rounded-2xl border overflow-hidden bg-gradient-to-br ${rankStyle}`}
    >
      <button onClick={() => setExpanded(e => !e)} className="w-full text-left px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Rank badge */}
          <div className="flex-shrink-0 text-center">
            {rank <= 3
              ? <div className="text-2xl leading-none">{RANK_LABEL[rank]}</div>
              : <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-slate-400">{rank}</div>
            }
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typePill}`}>{opp.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${prio.cls}`}>{prio.label}</span>
            </div>
            <h3 className="font-semibold text-white text-sm sm:text-base leading-snug">{opp.title}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{opp.organization}</p>
          </div>

          {/* Score ring */}
          <ScoreRing score={score.total} size={56} />

          <div className="flex-shrink-0">
            {expanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
          </div>
        </div>

        {/* Urgency row */}
        <div className="flex items-center gap-4 mt-3 pl-12 flex-wrap">
          {daysUntilDeadline !== null && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              daysUntilDeadline <= 3 ? "text-red-400" : daysUntilDeadline <= 7 ? "text-amber-400" : daysUntilDeadline <= 14 ? "text-yellow-400" : "text-emerald-400"
            }`}>
              <Clock size={11} />
              {daysUntilDeadline <= 0 ? "Deadline passed" : `${daysUntilDeadline} days left`}
              {daysUntilDeadline >= 0 && daysUntilDeadline <= 5 && <AlertTriangle size={11} />}
            </div>
          )}
          {opp.deadline && <span className="text-xs text-slate-600">Due: {opp.deadline}</span>}
          {opp.location && <span className="text-xs text-slate-600">{opp.location}</span>}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-5">
          <p className="text-slate-300 text-sm leading-relaxed">{opp.summary}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ScoreBar label="Fit"          value={score.fit}          color="bg-gradient-to-r from-violet-600 to-violet-400" />
            <ScoreBar label="Urgency"      value={score.urgency}      color="bg-gradient-to-r from-red-600 to-red-400" />
            <ScoreBar label="Completeness" value={score.completeness} color="bg-gradient-to-r from-cyan-600 to-cyan-400" />
            <ScoreBar label="Prestige"     value={score.prestige}     color="bg-gradient-to-r from-amber-600 to-amber-400" />
          </div>

          {score.evidence.length > 0 && (
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Evidence</p>
              <div className="flex flex-wrap gap-1.5">
                {score.evidence.map((ev, i) => (
                  <span key={i} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-full">{ev}</span>
                ))}
              </div>
            </div>
          )}

          {opp.eligibility && (
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-1.5">Eligibility</p>
              <p className="text-sm text-slate-300">{opp.eligibility}</p>
            </div>
          )}

          {opp.requiredDocs.length > 0 && (
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-1.5">Required Documents</p>
              <ul className="space-y-1">
                {opp.requiredDocs.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />{d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actionChecklist.length > 0 && (
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Action Checklist</p>
              <ul className="space-y-1.5">
                {actionChecklist.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckSquare size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {opp.applicationLink && (
              <a href={opp.applicationLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/25">
                Apply Now <ExternalLink size={13} />
              </a>
            )}
            <a
              href={buildCalendarUrl(opp)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <CalendarPlus size={13} /> Add to Calendar
            </a>
            {onCoverLetter && (
              <button onClick={(e) => { e.stopPropagation(); onCoverLetter(); }}
                className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                <FileText size={13} /> Draft Cover Letter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
