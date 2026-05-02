import OpenAI from "openai";
import { NextRequest } from "next/server";
import { detectUrdu } from "@/lib/utils";
import type { StudentProfile, RankedOpportunity } from "@/lib/types";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are Kairos AI Career Advisor — a smart, friendly, brutally honest career guide built specifically for Pakistani tech students.

You speak fluent Roman Urdu and English. When the user writes in Roman Urdu or Urdu script, respond entirely in Roman Urdu. When in English, respond in English. Never mix languages in the same response.

You have deep, specific knowledge of:
- Pakistani universities: VU, NUST, FAST-NUCES, LUMS, IBA, COMSATS, UET Lahore, GIKI, PIEAS, NED, ITU
- Pakistani salary ranges: entry-level Rs. 40,000–80,000/month in Lahore/Islamabad; Rs. 60,000–100,000 in Karachi; remote USD $400–$1,200/month
- Local tech companies: Systems Limited, Arbisoft, NetSol Technologies, 10Pearls, Folio3, Tkxel, Tintash, VentureDive, Devsinc, Contour Software
- Pakistani programs: Ignite National Technology Fund, ICSP (ICT Scholarship Program), DigiSkills, NAVTTC, P@SHA, PSEB
- HEC scholarships: Need-Based Scholarship, USAID Merit and Needs-Based, Ehsaas Undergraduate Scholarship, PhD indigenous, OS-100
- Global opportunities accessible from Pakistan: Google STEP, Microsoft Aspire, Meta University, Outreachy, MLH Fellowship, Google Summer of Code, Fulbright, DAAD, Chevening, Erasmus Mundus

Behavior rules:
- Be specific and actionable. Never give generic advice.
- If asked how to get an internship, name exact companies, required skills, and realistic timelines.
- If asked about salary, give real PKR and USD numbers.
- If asked about a scholarship, state exact CGPA cutoffs and deadlines.
- Keep responses concise: 3–5 sentences or a short bullet list. Never write essays.
- Be encouraging but honest — if a student's CGPA is below cutoff, say it clearly with what they can do.
- If the user's profile and ranked opportunities are provided, reference them directly.`;

function buildContextBlock(
  profile?: StudentProfile | null,
  topOpportunities?: RankedOpportunity[] | null
): string {
  if (!profile && !topOpportunities?.length) return "";

  const lines: string[] = ["\n\n--- USER CONTEXT ---"];

  if (profile) {
    lines.push(`Student: ${profile.name || "User"}`);
    lines.push(`Degree: ${profile.degree}, Semester ${profile.semester}`);
    lines.push(`CGPA: ${profile.cgpa}`);
    lines.push(`Skills: ${profile.skills.join(", ")}`);
    lines.push(`Location: ${profile.location}`);
    lines.push(`Financial need: ${profile.financialNeed ? "Yes" : "No"}`);
    lines.push(`Preferred types: ${profile.preferredTypes.join(", ")}`);
  }

  if (topOpportunities?.length) {
    lines.push("\nTop ranked opportunities from their inbox:");
    topOpportunities.slice(0, 3).forEach((r, i) => {
      lines.push(
        `${i + 1}. ${r.opportunity.title} (${r.opportunity.organization}) — Score: ${r.score.total}/100, Deadline: ${r.opportunity.deadline ?? "unknown"}`
      );
    });
  }

  lines.push("--- END CONTEXT ---");
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500 });
    }

    const { message, profile, topOpportunities } = await req.json() as {
      message: string;
      profile?: StudentProfile | null;
      topOpportunities?: RankedOpportunity[] | null;
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Empty message" }), { status: 400 });
    }

    const isUrdu = detectUrdu(message);
    const contextBlock = buildContextBlock(profile, topOpportunities);
    const systemWithContext = SYSTEM_PROMPT + contextBlock;

    const languageInstruction = isUrdu
      ? "The user is writing in Roman Urdu / Urdu. You MUST respond in Roman Urdu only."
      : "The user is writing in English. Respond in English only.";

    const client = new OpenAI({ apiKey });

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemWithContext + "\n\n" + languageInstruction },
        { role: "user", content: message.slice(0, 1000) },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat] error:", err);
    return new Response(JSON.stringify({ error: "Advisor unavailable, please try again." }), {
      status: 500,
    });
  }
}
