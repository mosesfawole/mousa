export type AIProvider = "anthropic" | "openai";
export const AI_PROVIDERS = {
  anthropic: {
    name: "Anthropic",
    label: "Anthropic · Claude",
    model: "claude-sonnet-5-5",
    modelName: "Claude Sonnet 5.5",
    keyUrl: "https://platform.claude.com/settings/keys",
  },
  openai: {
    name: "OpenAI",
    label: "OpenAI · GPT",
    model: "gpt-5.6-terra",
    modelName: "GPT-5.6 Terra",
    keyUrl: "https://platform.openai.com/api-keys",
  },
} as const;

export function isValidAPIKey(provider: AIProvider, key: string) {
  if (key.length < 20 || key.length > 512 || !/^[A-Za-z0-9_-]+$/.test(key))
    return false;
  return provider === "anthropic"
    ? key.startsWith("sk-ant-")
    : key.startsWith("sk-") && !key.startsWith("sk-ant-");
}
