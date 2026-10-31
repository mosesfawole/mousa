import type { AnalyzeResponse, ExpandResponse, GenerateInput } from "@/types";
export function sampleIdeas(input: GenerateInput) {
  const topic = input.topic?.trim() || "your latest project";
  return [
    {
      idea: `Share a small decision that changed your approach. Topic: “${topic}”.`,
      hook: "The smallest change made the biggest difference.",
    },
    {
      idea: `Tell your audience what you would do differently. Topic: “${topic}”.`,
      hook: "If I started again, this is what I’d change.",
    },
    {
      idea: `Walk through one surprising lesson. Topic: “${topic}”.`,
      hook: "I thought the hard part would be the code. It wasn’t.",
    },
    {
      idea: `Challenge a common assumption. Topic: “${topic}”.`,
      hook: "Something I used to believe—and no longer do.",
    },
    {
      idea: `Ask your audience about their own experience. Topic: “${topic}”.`,
      hook: "What’s one thing you wish you’d learned sooner?",
    },
  ];
}
export function sampleDraft(idea = ""): ExpandResponse {
  const examples = [
    "The smallest change made the biggest difference.\n\nI stopped adding features and watched someone use what I’d already built. Ten minutes of feedback changed my next week of work.\n\nWhat’s a small change that improved your process?",
    "If I started again, I’d share the first rough version sooner.\n\nI spent a week polishing a feature before asking if anyone needed it. One conversation would have saved that week.\n\nWhat would you do differently on your next project?",
    "I thought the hard part would be the code. It wasn’t.\n\nExplaining the project in one sentence made me rethink what it should do. Clarity shaped the build more than another library did.\n\nWhat surprised you while making something?",
    "I used to think a side project needed more features to feel finished.\n\nNow I look for one small thing it does well. A clear, useful experience is easier to share and improve.\n\nWhat’s a belief your last project changed?",
    "What’s one thing you wish you’d learned sooner?\n\nMine: ask someone to try the rough version. Their first question can reveal more than another evening spent polishing it alone.\n\nI’d love to hear your lesson from building something.",
  ];
  const index = idea.startsWith("Tell")
    ? 1
    : idea.startsWith("Walk")
      ? 2
      : idea.startsWith("Challenge")
        ? 3
        : idea.startsWith("Ask")
          ? 4
          : 0;
  return {
    tweet: examples[index],
    hashtags: ["BuildInPublic", "Learning"],
    tip: "This illustrative draft uses a specific moment and an open question. Replace the story with your own experience.",
    source: "sample",
  };
}
export function sampleAnalysis(tweet: string): AnalyzeResponse {
  return {
    score: 7,
    verdict:
      "An illustrative review: a clear starting point, with room for a more specific example.",
    strengths: [
      "The sample demonstrates feedback on the opening and structure.",
      "A concrete experience can make a post easier to relate to.",
    ],
    weaknesses: [
      "These are example notes, not an AI assessment of your text.",
      "Replace broad claims with a detail your audience can picture.",
    ],
    improved: tweet,
    hashtags: [],
    source: "sample",
  };
}
