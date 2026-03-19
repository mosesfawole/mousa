import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { updateIdeaExpanded, saveContent } from "@/lib/db";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { idea, niche, tone, ideaId } = await req.json();

    if (!idea || !niche) {
      return NextResponse.json(
        { error: "Idea and niche are required" },
        { status: 400 },
      );
    }

    const prompt = `You are a Twitter/X copywriter helping a ${niche} creator.

Expand this idea into a complete, high-performing tweet:
"${idea}"

Tone: ${tone}

Rules:
- Maximum 280 characters for the tweet
- Start with the strongest possible hook
- Be specific, not generic
- End with either a question, call to action, or bold statement
- Suggest 3-5 relevant hashtags (do not include them in the tweet character count)
- Give one short tip explaining why this tweet will perform well

Return ONLY valid JSON:
{
  "tweet": "the complete tweet text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "tip": "one sentence explaining why this will perform well"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Update the idea record in Supabase with expanded content
    if (ideaId) {
      await updateIdeaExpanded(ideaId, parsed.tweet, parsed.hashtags);
    }

    // Also save as a separate tweet content record for history
    await saveContent({
      type: "tweet",
      niche,
      tone,
      prompt: idea,
      output: parsed.tweet,
    });

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("[POST /api/expand]", err.message);
    return NextResponse.json(
      { error: "Failed to expand idea" },
      { status: 500 },
    );
  }
}
