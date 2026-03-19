import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { saveContent } from "@/lib/db";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { tweet, niche } = await req.json();

    if (!tweet) {
      return NextResponse.json({ error: "Tweet is required" }, { status: 400 });
    }

    const prompt = `You are a Twitter/X growth expert analyzing content performance.

Analyze this tweet from a ${niche || "general"} creator:

"${tweet}"

Be honest and specific. Generic feedback is useless.

Return ONLY valid JSON:
{
  "score": <number 1-10>,
  "verdict": "one sentence summary of the tweet's potential",
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "improved": "a rewritten version that would perform better",
  "hashtags": ["suggested hashtag 1", "suggested hashtag 2", "suggested hashtag 3"]
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Save analysis to Supabase
    await saveContent({
      type: "analysis",
      niche,
      prompt: tweet,
      output: clean,
      score: parsed.score,
    });

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("[POST /api/analyze]", err.message);
    return NextResponse.json(
      { error: "Failed to analyze tweet" },
      { status: 500 },
    );
  }
}
