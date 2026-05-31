"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, User, FileText } from "lucide-react";
import FileUpload from "./FileUpload";
import type { StudentProfile, OpportunityType } from "@/lib/types";

interface ProfileFormProps {
  profile: StudentProfile;
  onChange: (p: StudentProfile) => void;
}

const DEGREES = [
  // Computer Science & Software
  "BS Computer Science",
  "BS Software Engineering",
  "BS Artificial Intelligence",
  "BS Data Science",
  "BS Information Technology",
  "BS Cyber Security",
  "BS Computer Engineering",
  "BS Information Systems",
  "BS Game Development",
  "BS Cloud Computing",
  "BS Network Engineering",
  // Electrical & Electronic
  "BS Electrical Engineering",
  "BS Electronic Engineering",
  "BS Telecom Engineering",
  "BS Mechatronics Engineering",
  // Other Engineering
  "BS Mechanical Engineering",
  "BS Civil Engineering",
  "BS Chemical Engineering",
  "BS Biomedical Engineering",
  "BS Industrial Engineering",
  "BS Petroleum Engineering",
  // Quantitative Sciences
  "BS Mathematics",
  "BS Applied Mathematics",
  "BS Statistics",
  "BS Physics",
  "BS Bioinformatics",
];

const OPP_TYPES: OpportunityType[] = ["scholarship", "internship", "fellowship", "competition", "research", "admission"];

const inputCls = "w-full bg-[#0A0F1E] border border-violet-500/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors";
const labelCls = "text-xs font-medium text-slate-400 mb-1.5 block";

export default function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const [open, setOpen] = useState(true);

  // Local raw strings to avoid controlled-input clamping quirks
  const [semesterRaw, setSemesterRaw] = useState(String(profile.semester));
  const [skillsRaw, setSkillsRaw] = useState(profile.skills.join(", "));
  const [cgpaRaw, setCgpaRaw] = useState(String(profile.cgpa));

  // Keep local skills string in sync when parent resets (e.g. CV upload)
  const skillsKey = profile.skills.join(",");
  useEffect(() => {
    setSkillsRaw(profile.skills.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsKey]);

  const set = <K extends keyof StudentProfile>(k: K, v: StudentProfile[K]) =>
    onChange({ ...profile, [k]: v });

  const toggleType = (t: OpportunityType) => {
    const cur = profile.preferredTypes;
    set("preferredTypes", cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]);
  };

  const commitSemester = (raw: string) => {
    const n = parseInt(raw);
    const clamped = isNaN(n) || n < 1 ? 1 : n > 8 ? 8 : n;
    setSemesterRaw(String(clamped));
    set("semester", clamped);
  };

  const commitCgpa = (raw: string) => {
    const v = parseFloat(raw);
    const clamped = isNaN(v) || v < 0 ? 0 : v > 4 ? 4 : Math.round(v * 100) / 100;
    setCgpaRaw(clamped.toFixed(2));
    set("cgpa", clamped);
  };

  const commitSkills = (raw: string) => {
    const parsed = raw.split(",").map(s => s.trim()).filter(Boolean);
    set("skills", parsed);
  };

  return (
    <div className="glass border border-violet-500/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-violet-500/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <User size={14} className="text-violet-400" />
          </div>
          <span className="font-semibold text-sm">Step 2: Your Profile</span>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-violet-500/10">
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                className={inputCls}
                value={profile.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Taha Jamshed"
              />
            </div>
            <div>
              <label className={labelCls}>Degree / Program</label>
              <select
                className={inputCls}
                value={profile.degree}
                onChange={e => set("degree", e.target.value)}
              >
                {DEGREES.map(d => <option key={d} value={d} className="bg-[#0A0F1E]">{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Semester (1–8)</label>
              <input
                className={inputCls}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={semesterRaw}
                onChange={e => {
                  const val = e.target.value.replace(/[^1-8]/g, "").slice(0, 1);
                  setSemesterRaw(val);
                  if (val) set("semester", parseInt(val));
                }}
                onBlur={e => commitSemester(e.target.value)}
                placeholder="e.g. 6"
              />
            </div>
            <div>
              <label className={labelCls}>CGPA (0.00–4.00)</label>
              <input
                className={inputCls}
                type="text"
                inputMode="decimal"
                value={cgpaRaw}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9.]/g, "");
                  // allow only one decimal point
                  const parts = val.split(".");
                  if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
                  // max 4 chars: X.XX
                  if (val.length > 4) val = val.slice(0, 4);
                  setCgpaRaw(val);
                }}
                onBlur={e => commitCgpa(e.target.value)}
                placeholder="e.g. 3.20"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Skills (type and separate with commas)</label>
            <input
              className={inputCls}
              value={skillsRaw}
              onChange={e => setSkillsRaw(e.target.value)}
              onBlur={e => commitSkills(e.target.value)}
              placeholder="Python, React, Machine Learning"
            />
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.skills.map((s, i) => (
                  <span key={i} className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} value={profile.location} onChange={e => set("location", e.target.value)} placeholder="Lahore" />
            </div>
            <div>
              <label className={labelCls}>Experience</label>
              <input className={inputCls} value={profile.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. GDG member, freelancing" />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Preferred Opportunity Types
              {profile.preferredTypes.length === 0 && (
                <span className="ml-2 text-amber-400/80 font-normal">— select at least one to analyze</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {OPP_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                    profile.preferredTypes.includes(t)
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "bg-[#0A0F1E] border border-violet-500/20 text-slate-400 hover:border-violet-500/40"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls + " flex items-center gap-1.5"}><FileText size={11} />CV / Resume (PDF)</label>
            <FileUpload
              label="Drop your CV here"
              hint="PDF only — helps match your skills to opportunities"
              compact
              onTextExtracted={(text, name) => {
                const skills = text.match(/\b(Python|Java|React|Node\.js|TypeScript|C\+\+|ML|Machine Learning|Deep Learning|NLP|SQL|AWS|Docker|Git|Flutter|Django|FastAPI|TensorFlow|PyTorch|Kubernetes|Firebase)\b/gi) ?? [];
                const unique = [...new Set(skills.map(s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())))];
                if (unique.length) {
                  const merged = [...new Set([...profile.skills, ...unique])];
                  set("skills", merged);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button onClick={() => set("financialNeed", !profile.financialNeed)}
              className={`relative w-10 h-5 rounded-full transition-colors ${profile.financialNeed ? "bg-violet-600" : "bg-slate-700"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.financialNeed ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm text-slate-300">Financial need — boosts funded opportunities</span>
          </div>
        </div>
      )}
    </div>
  );
}
