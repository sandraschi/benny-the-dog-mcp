export interface Provider {
  name: string;
  port: number;
  base: string;
}

export const PROVIDERS: Provider[] = [
  { name: "Ollama", port: 11434, base: "http://127.0.0.1:11434" },
  { name: "LM Studio", port: 1234, base: "http://127.0.0.1:1234" },
  { name: "vLLM", port: 8000, base: "http://127.0.0.1:8000" },
];

export async function probeProvider(p: Provider): Promise<boolean> {
  try {
    const url = p.name === "Ollama" ? `${p.base}/api/tags` : `${p.base}/v1/models`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

export async function listModels(p: Provider): Promise<string[]> {
  try {
    const url = p.name === "Ollama" ? `${p.base}/api/tags` : `${p.base}/v1/models`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return [];
    const j = await r.json();
    if (p.name === "Ollama") return (j.models ?? []).map((m: { name: string }) => m.name);
    return (j.data ?? []).map((m: { id: string }) => m.id);
  } catch {
    return [];
  }
}