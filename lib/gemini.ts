import OpenAI from "openai";
import type { ExtractedOpportunity } from "./types";
import { truncateEmail } from "./utils";

const PROMPT_TEMPLATE = (emails: string[], count: number) => `You are an expert at parsing student opportunity emails. Analyze these ${count} emails and return a JSON object with key "opportunities" containing an array.

Each item must have these exact fields:
- emailIndex (integer): index from 0
- isOpportunity (boolean): false for spam/promotional/course-registration
- title (string): short title
- type (string): one of scholarship|internship|fellowship|competition|research|admission|course|spam|unknown
- organization (string): sending organization
- deadline (string|null): ISO date YYYY-MM-DD or null
- deadlineRaw (string|null): original deadline text or null
- eligibility (string|null): eligibility summary or null
- minCGPA (number|null): minimum CGPA or null
- requiredDocs (array): required documents, empty array if none
- skills (array): required skills, empty array if none
- applicationLink (string|null): application URL or null — only if literally present
- contactEmail (string|null): contact email or null — only if literally present
- fundingMentioned (boolean): true if stipend/scholarship/prize money mentioned
- location (string|null): location or null
- degreeRequirement (string|null): required degree or null
- isStrictDegree (boolean): true only if degree is a hard disqualifying requirement
- summary (string): 1-2 sentence summary
- rawSnippet (string): first 120 chars of email body

Rules:
- NEVER hallucinate links or emails — only extract what is literally present in the text
- Return null for missing fields, never empty string
- Respond with ONLY valid JSON: {"opportunities": [...]}

Emails:
${emails.join("\n\n")}`;

function repairJson(raw: string): string {
  // Strip markdown code fences
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function extractOpportunities(emailsText: string): Promise<ExtractedOpportunity[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const client = new OpenAI({ apiKey });

  const emails = emailsText
    .split(/\n---+\n/)
    .map((e, i) => `[EMAIL ${i}]\n${truncateEmail(e.trim())}`)
    .filter(e => e.length > 20);

  if (emails.length === 0) return [];

  const prompt = PROMPT_TEMPLATE(emails, emails.length);

  async function callModel(strict: boolean): Promise<string> {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: strict
            ? "You must return ONLY valid JSON. No markdown, no explanation, no code fences. Start your response with { and end with }."
            : "You are a precise JSON extractor.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    return response.choices[0].message.content ?? '{"opportunities":[]}';
  }

  // Attempt 1: direct parse
  try {
    const text = await callModel(false);
    const parsed = JSON.parse(text) as { opportunities: ExtractedOpportunity[] };
    return parsed.opportunities ?? [];
  } catch {
    // Attempt 2: strip fences and retry parse
    try {
      const text = await callModel(false);
      const repaired = repairJson(text);
      const parsed = JSON.parse(repaired) as { opportunities: ExtractedOpportunity[] };
      return parsed.opportunities ?? [];
    } catch {
      // Attempt 3: strict system prompt retry
      try {
        const text = await callModel(true);
        const repaired = repairJson(text);
        const parsed = JSON.parse(repaired) as { opportunities: ExtractedOpportunity[] };
        return parsed.opportunities ?? [];
      } catch {
        // Final fallback: return empty — analyze route will serve demo result
        console.error("[gemini] all parse attempts failed");
        return [];
      }
    }
  }
}
