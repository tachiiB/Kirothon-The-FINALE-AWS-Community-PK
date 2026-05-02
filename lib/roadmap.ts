export const ROLES = [
  "AI/ML Engineer",
  "Full-Stack Developer",
  "DevOps / Cloud Engineer",
  "Data Scientist",
  "Cybersecurity Analyst",
  "Mobile Developer (Flutter/React Native)",
  "Backend Engineer",
  "Frontend Engineer",
] as const;

export type TargetRole = typeof ROLES[number];

export interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  skills: string[];
  actions: string[];
  resources: string[];
  salaryRange: string;
  milestone: string;
}

export interface RoadmapResponse {
  role: string;
  totalDuration: string;
  summary: string;
  phases: RoadmapPhase[];
  topCompanies: string[];
  globalOpportunities: string[];
}
