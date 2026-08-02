import { create } from "zustand";

interface LlmState {
  provider: string;
  model: string;
  setProvider: (p: string) => void;
  setModel: (m: string) => void;
}

const KEY = "benny-the-dog-mcp-llm";

function load(): { provider: string; model: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { provider: "Ollama", model: "" };
}

export const useLlm = create<LlmState>((set) => ({
  ...load(),
  setProvider: (provider) =>
    set((s) => {
      const next = { ...s, provider, model: "" };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    }),
  setModel: (model) =>
    set((s) => {
      const next = { ...s, model };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    }),
}));
