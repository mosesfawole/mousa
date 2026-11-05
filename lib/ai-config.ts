export type AIProvider =
  "anthropic" | "openai" | "groq" | "openrouter" | "fortytwo";
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
  groq: {
    name: "Groq",
    label: "Groq · GPT OSS",
    model: "openai/gpt-oss-20b",
    modelName: "GPT OSS 20B",
    keyUrl: "https://console.groq.com/keys",
  },
  openrouter: {
    name: "OpenRouter",
    label: "OpenRouter · Free models",
    model: "openrouter/free",
    modelName: "OpenRouter’s available free models",
    keyUrl: "https://openrouter.ai/settings/keys",
  },
  fortytwo: {
    name: "FortyTwo",
    label: "FortyTwo · Qwen",
    model: "qwen/qwen3.8-27b",
    modelName: "Qwen3.8 27B",
    keyUrl: "https://platform.fortytwo.network",
  },
} as const;

export function isAIProvider(value: string): value is AIProvider {
  return Object.hasOwn(AI_PROVIDERS, value);
}

export function isValidAPIKey(provider: AIProvider, key: string) {
  if (provider === "fortytwo")
    return (
      key.length >= 20 && key.length <= 512 && /^[A-Za-z0-9_.~+/=-]+$/.test(key)
    );
  if (key.length < 20 || key.length > 512 || !/^[A-Za-z0-9_-]+$/.test(key))
    return false;
  switch (provider) {
    case "anthropic":
      return key.startsWith("sk-ant-");
    case "openai":
      return (
        key.startsWith("sk-") &&
        !key.startsWith("sk-ant-") &&
        !key.startsWith("sk-or-")
      );
    case "groq":
      return key.startsWith("gsk_");
    case "openrouter":
      return key.startsWith("sk-or-");
  }
}
