import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import type { StudentProfile } from "@/lib/types";
import type { TargetRole, RoadmapResponse } from "@/lib/roadmap";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const body = await req.json() as { role: TargetRole; profile: StudentProfile };
    const { role } = body;
    const profile: StudentProfile = body.profile ?? {};
    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    const client = new OpenAI({ apiKey });

    const prompt = `You are a career advisor specializing in Pakistan's tech industry. Generate a detailed, realistic career roadmap for a Pakistani CS student targeting the role of "${role}".

Student profile:
- Degree: ${profile.degree ?? "Not specified"}, Semester ${profile.semester ?? "N/A"}
- CGPA: ${profile.cgpa ?? "Not specified"}
- Current skills: ${(profile.skills ?? []).join(", ") || "Not specified"}
- Location: ${profile.location ?? "Pakistan"}
- Experience: ${profile.experience || "None listed"}

Return ONLY valid JSON matching this exact structure:
{
  "role": "${role}",
  "totalDuration": "X months / Y years",
  "summary": "2-sentence summary of the path",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "e.g. 2-3 months",
      "skills": ["skill1", "skill2"],
      "actions": ["specific action 1", "specific action 2", "specific action 3"],
      "resources": ["resource 1", "resource 2"],
      "salaryRange": "PKR X–Y / month or USD X–Y / month (remote)",
      "milestone": "What success looks like at end of this phase"
    }
  ],
  "topCompanies": ["company1", "company2", "company3", "company4", "company5"],
  "globalOpportunities": ["opportunity1", "opportunity2", "opportunity3"]
}

Rules:
- Exactly 4 phases
- Be SPECIFIC to Pakistan — mention real Pakistani companies, real salary ranges in PKR, real programs (Ignite, ICSP, HEC, etc.)
- Include at least 1 remote/global opportunity track in phase 3 or 4
- Actions must be concrete and actionable, not generic
- Resources must be real (specific courses, platforms, certifications)
- topCompanies must be real Pakistani tech companies hiring for this role
- globalOpportunities must be real programs accessible from Pakistan`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "You are a precise JSON generator. Return only valid JSON, no markdown, no explanation." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content ?? "{}";
    const roadmap = JSON.parse(text) as RoadmapResponse;

    return NextResponse.json(roadmap);
  } catch (err) {
    console.error("[roadmap] error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
