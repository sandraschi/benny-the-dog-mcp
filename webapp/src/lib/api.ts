export const API_BASE = "http://127.0.0.1:11142";

export interface HealthInfo {
  status: string;
  server: string;
  version: string;
  uptime_seconds: number;
  tool_count: number;
}

export async function fetchHealth(): Promise<HealthInfo> {
  const r = await fetch(`${API_BASE}/api/health`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchTools() {
  const r = await fetch(`${API_BASE}/api/tools`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).tools as { name: string; description: string }[];
}

export async function fetchSkills() {
  const r = await fetch(`${API_BASE}/api/skills`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).skills as string[];
}
