import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { API_BASE } from "../lib/api";

export default function Jobs() {
  const [jobs, setJobs] = useState<{ id: string; next_run: string; enabled: boolean }[]>([]);
  const [runs, setRuns] = useState<Record<string, Record<string, string>>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    fetch(`${API_BASE}/api/jobs`)
      .then((r) => r.json())
      .then((j) => {
        setJobs(j.jobs ?? []);
        setRuns(j.runs ?? {});
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  const run = async (id: string) => {
    setBusy(id);
    try {
      await fetch(`${API_BASE}/api/jobs/${id}/run`, { method: "POST" });
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div data-testid="jobs-page" className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Jobs</h2>
      {jobs.length === 0 && (
        <p className="text-zinc-500">Scheduler disabled. Set ENABLE_SCHEDULER=1 and restart the backend.</p>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-amber-500">{j.id}</span>
              <button
                onClick={() => run(j.id)}
                disabled={busy !== null}
                className="rounded bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                title="Run now"
              >
                <Play size={14} />
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              next run: {j.next_run || "disabled"}
            </div>
            {runs[j.id] && (
              <div className="mt-2 text-xs text-zinc-500">
                last: {runs[j.id].last_run} - {runs[j.id].status} - {runs[j.id].message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}