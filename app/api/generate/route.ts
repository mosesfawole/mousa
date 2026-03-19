import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { saveContent, saveIdeas } from "@/lib/db";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { niche, tone, topic } = await req.json();

    if (!niche) {
      return NextResponse.json({ error: "Niche is required" }, { status: 400 });
    }

    // Build the prompt
    // The more specific and structured the prompt the better Claude's output
    const prompt = `You are a Twitter/X content strategist helping a ${niche} creator.

Generate exactly 5 engaging Twitter post ideas${topic ? ` about: ${topic}` : ""}.

Tone: ${tone}

Rules:
- Each idea must be unique and specific — no generic advice
- Each must have a strong hook that makes people stop scrolling
- Ideas should be practical and relatable to the ${niche} audience
- Do NOT write full tweets — just the core idea and opening hook

Return ONLY valid JSON, no markdown, no explanation:
{
  "ideas": [
    {
      "idea": "the core concept in one sentence",
      "hook": "the opening line that grabs attention"
    }
  ]
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text from Claude's response
    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Save to Supabase
    const content = await saveContent({
      type: "idea",
      niche,
      tone,
      prompt: topic || niche,
      output: clean,
    });

    let ideas: any[] = [];
    if (content) {
      ideas = await saveIdeas(content.id, parsed.ideas);
    }

    return NextResponse.json({ ideas, contentId: content?.id });
  } catch (err: any) {
    console.error("[POST /api/generate]", err.message);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 },
    );
  }
}
