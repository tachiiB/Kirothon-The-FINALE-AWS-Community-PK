import { NextRequest, NextResponse } from "next/server";
import { extractOpportunities } from "@/lib/gemini";
import { scoreOpportunities } from "@/lib/scoringEngine";
import { withTimeout } from "@/lib/utils";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";
import demoResult from "@/lib/demoResult.json";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();

    if (req.nextUrl.searchParams.get("demo") === "true") {
      return NextResponse.json(demoResult);
    }

    if (!body.emails?.trim()) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    const extracted = await withTimeout(
      extractOpportunities(body.emails),
      55000
    );

    const ranked = scoreOpportunities(extracted, body.profile);
    const spamCount = extracted.filter(e => !e.isOpportunity).length;

    const response: AnalyzeResponse = {
      results: ranked,
      spamCount,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[analyze] error — serving demo fallback:", err);
    return NextResponse.json({ ...demoResult, isFallback: true });
  }
}
