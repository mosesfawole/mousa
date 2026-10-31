export type Tone = "professional" | "casual" | "funny" | "educational";
export type ContentSource = "sample" | "live";
export type ContentType = "idea" | "tweet" | "analysis";
export interface Idea {
  id: string;
  content_id: string;
  idea: string;
  hook?: string;
  expanded?: string;
  hashtags?: string[];
  created_at: string;
}
export interface GenerateInput {
  niche: string;
  tone: Tone;
  topic?: string;
}
export interface ExpandInput {
  idea: string;
  niche: string;
  tone: Tone;
}
export interface AnalyzeInput {
  tweet: string;
  niche: string;
}
export interface ExpandResponse {
  tweet: string;
  hashtags: string[];
  tip: string;
  source?: ContentSource;
}
export interface AnalyzeResponse {
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  improved: string;
  hashtags: string[];
  source?: ContentSource;
}
export interface GenerateResponse {
  ideas: Idea[];
  contentId: string;
  source: ContentSource;
}
export interface Content {
  id: string;
  type: ContentType;
  niche?: string;
  tone?: Tone;
  prompt: string;
  output: string;
  platform: string;
  score?: number;
  created_at: string;
  ideas?: Idea[];
  hashtags?: string[];
  source?: ContentSource;
  brief?: GenerateInput;
  ideaId?: string;
}
export interface Draft {
  id: string;
  ideaId?: string;
  tweet: string;
  hashtags: string[];
  tip: string;
  source: ContentSource;
  brief?: GenerateInput;
  prompt?: string;
}
