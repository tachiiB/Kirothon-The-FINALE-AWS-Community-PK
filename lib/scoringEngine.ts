import type { ExtractedOpportunity, StudentProfile, ScoreBreakdown, RankedOpportunity } from "./types";
import { parseDateString, daysFromNow } from "./dateParser";

const PRESTIGE_90 = ["fulbright", "rhodes", "daad", "chevening", "erasmus", "mit", "stanford", "harvard", "oxford"];
const PRESTIGE_70 = ["hec", "nust", "lums", "pieas", "google", "microsoft", "meta", "tintash"];

function scoreFit(opp: ExtractedOpportunity, profile: StudentProfile): { score: number; evidence: string[] } {
  let score = 0;
  const evidence: string[] = [];

  if (profile.preferredTypes.includes(opp.type)) {
    score += 30;
    evidence.push(`Matches your preferred type: ${opp.type}`);
  }

  const skillOverlap = opp.skills.filter(s =>
    profile.skills.some(ps => ps.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ps.toLowerCase()))
  );
  const skillBonus = Math.min(skillOverlap.length * 5, 20);
  if (skillBonus > 0) {
    score += skillBonus;
    evidence.push(`${skillOverlap.length} skill match(es): ${skillOverlap.slice(0, 3).join(", ")}`);
  }

  if (opp.minCGPA === null || profile.cgpa >= opp.minCGPA) {
    score += 15;
    evidence.push(opp.minCGPA ? `CGPA ${profile.cgpa} meets minimum ${opp.minCGPA}` : "No CGPA requirement");
  } else {
    evidence.push(`CGPA ${profile.cgpa} below required ${opp.minCGPA}`);
  }

  const loc = (opp.location || "").toLowerCase();
  if (loc === "" || loc.includes("remote") || loc.includes("any") || loc.includes(profile.location.toLowerCase())) {
    score += 10;
    evidence.push("Location compatible");
  }

  if (profile.financialNeed && opp.fundingMentioned) {
    score += 15;
    evidence.push("Funded opportunity matches your financial need");
  }

  if (opp.isStrictDegree && opp.degreeRequirement &&
    !profile.degree.toLowerCase().includes(opp.degreeRequirement.toLowerCase())) {
    score -= 40;
    evidence.push(`Degree mismatch: requires ${opp.degreeRequirement}`);
  }

  return { score: Math.max(0, Math.min(100, score)), evidence };
}

function scoreUrgency(opp: ExtractedOpportunity): { score: number; evidence: string[]; days: number | null } {
  const deadline = parseDateString(opp.deadline);
  const days = daysFromNow(deadline);

  if (days === null) return { score: 10, evidence: ["No deadline found — treat as low urgency"], days: null };
  if (days <= 0) return { score: 5, evidence: ["Deadline has passed"], days };
  if (days <= 3) return { score: 100, evidence: [`URGENT: ${days} day(s) left`], days };
  if (days <= 7) return { score: 80, evidence: [`${days} days left — act this week`], days };
  if (days <= 14) return { score: 60, evidence: [`${days} days left — 2 weeks window`], days };
  if (days <= 30) return { score: 40, evidence: [`${days} days left — this month`], days };
  if (days <= 60) return { score: 20, evidence: [`${days} days left — 2 months`], days };
  return { score: 10, evidence: [`${days} days left — not urgent`], days };
}

function scoreCompleteness(opp: ExtractedOpportunity): { score: number; evidence: string[] } {
  let score = 100;
  const evidence: string[] = [];
  const missing: string[] = [];

  if (!opp.deadline) { score -= 15; missing.push("deadline"); }
  if (!opp.applicationLink && !opp.contactEmail) { score -= 15; missing.push("application link"); }
  if (!opp.eligibility) { score -= 15; missing.push("eligibility info"); }
  if (!opp.requiredDocs || opp.requiredDocs.length === 0) { score -= 15; missing.push("required docs"); }

  if (missing.length > 0) {
    evidence.push(`Missing: ${missing.join(", ")}`);
  } else {
    evidence.push("All key fields extracted");
  }

  return { score: Math.max(0, score), evidence };
}

function scorePrestige(opp: ExtractedOpportunity): { score: number; evidence: string[] } {
  const text = `${opp.title} ${opp.organization}`.toLowerCase();
  for (const kw of PRESTIGE_90) {
    if (text.includes(kw)) return { score: 90, evidence: [`Top-tier prestige: ${opp.organization}`] };
  }
  for (const kw of PRESTIGE_70) {
    if (text.includes(kw)) return { score: 70, evidence: [`Well-known organization: ${opp.organization}`] };
  }
  return { score: 50, evidence: ["Standard organization prestige"] };
}

function buildChecklist(opp: ExtractedOpportunity): string[] {
  const list: string[] = [];
  if (opp.applicationLink) list.push(`Open application: ${opp.applicationLink}`);
  if (opp.requiredDocs?.length) opp.requiredDocs.forEach(d => list.push(`Prepare: ${d}`));
  if (opp.deadline) list.push(`Mark deadline: ${opp.deadline}`);
  if (opp.contactEmail) list.push(`Contact: ${opp.contactEmail}`);
  list.push("Tailor your CV/SOP for this opportunity");
  return list;
}

export function scoreOpportunities(
  opportunities: ExtractedOpportunity[],
  profile: StudentProfile
): RankedOpportunity[] {
  const real = opportunities.filter(o => {
    if (!o.isOpportunity) return false;
    if (profile.preferredTypes.length === 0) return true;
    return profile.preferredTypes.includes(o.type);
  });

  const ranked = real.map((opp) => {
    const fit = scoreFit(opp, profile);
    const urgency = scoreUrgency(opp);
    const completeness = scoreCompleteness(opp);
    const prestige = scorePrestige(opp);

    const total = Math.round(
      fit.score * 0.45 +
      urgency.score * 0.30 +
      completeness.score * 0.15 +
      prestige.score * 0.10
    );

    const score = {
      fit: fit.score,
      urgency: urgency.score,
      completeness: completeness.score,
      prestige: prestige.score,
      total,
      evidence: [...fit.evidence, ...urgency.evidence, ...completeness.evidence, ...prestige.evidence],
    };

    return {
      rank: 0,
      opportunity: opp,
      score,
      actionChecklist: buildChecklist(opp),
      daysUntilDeadline: urgency.days,
    };
  });

  ranked.sort((a, b) => b.score.total - a.score.total);
  ranked.forEach((r, i) => (r.rank = i + 1));

  return ranked;
}
