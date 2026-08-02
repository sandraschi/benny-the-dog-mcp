import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

interface LogEntry {
  ts: string;
  source: string;
  level: string;
  message: string;
}

export default function Logs() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState("all");

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`${API_BASE}/api/logs?limit=100`)
        .then((r) => r.json())
        .then((j) => {
          if (alive) setEntries(j.entries ?? []);
        })
        .catch(() => undefined);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const shown = level === "all" ? entries : entries.filter((e) => e.level === level);

  return (
    <div data-testid="logs-page" className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-white">Logs</h2>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="ml-auto rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
        >
          {["all", "INFO", "WARNING", "ERROR"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-black/40 p-3 font-mono text-xs text-zinc-300">
        {shown.map((e, i) => (
          <div key={i} className={`flex gap-2 ${e.level === "ERROR" ? "text-red-400" : ""}`}>
            <span className="text-zinc-600">{e.ts}</span>
            <span className="text-zinc-500">{e.source}</span>
            <span className="text-amber-500">{e.level}</span>
            <span className="break-all">{e.message}</span>
          </div>
        ))}
        {shown.length === 0 && <div className="text-zinc-600">No log entries yet.</div>}
      </div>
    </div>
  );
}