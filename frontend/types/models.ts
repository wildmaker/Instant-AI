export interface LLMModel {
  id: string
  name: string
  provider: "openai" | "anthropic" | "google" | "deepseek"
  contextWindow: string
  icon?: string
  features: {
    vision?: boolean
    streaming?: boolean
    blocked?: boolean
  }
}

export const availableModels: LLMModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    contextWindow: "128K",
    features: {
      vision: true,
      streaming: true,
    },
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: "128K",
    features: {
      vision: true,
      streaming: true,
    },
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
    contextWindow: "200K",
    features: {
      vision: true,
      streaming: true,
    },
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: "2M",
    features: {
      vision: true,
      streaming: true,
    },
  },
]

