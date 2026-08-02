import { useEffect, useState } from "react";
import { fetchTools } from "../lib/api";

export default function Tools() {
  const [tools, setTools] = useState<{ name: string; description: string }[]>([]);

  useEffect(() => {
    fetchTools().then(setTools).catch(() => setTools([]));
  }, []);

  return (
    <div data-testid="tools-page" className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Tools</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tools.map((t) => (
          <div key={t.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="font-mono text-sm text-amber-500">{t.name}</div>
            <div className="mt-1 text-sm text-zinc-400">{t.description}</div>
          </div>
        ))}
      </div>
      {tools.length === 0 && (
        <p className="text-zinc-500">No tools discovered. Is the backend running?</p>
      )}
    </div>
  );
}