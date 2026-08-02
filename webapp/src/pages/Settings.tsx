import { useEffect, useState } from "react";
import { fetchHealth } from "../lib/api";
import { PROVIDERS, listModels, probeProvider } from "../lib/provider";
import { useLlm } from "../store/llm";

export default function Settings() {
  const [providerStatus, setProviderStatus] = useState<Record<string, string>>({});
  const [models, setModels] = useState<string[]>([]);
  const { provider, model, setProvider, setModel } = useLlm();
  const [health, setHealth] = useState<string>("checking");

  useEffect(() => {
    fetchHealth()
      .then((h) => setHealth(`${h.server} ${h.version} (${h.tool_count} tools)`))
      .catch(() => setHealth("backend unreachable"));

    const checks: Record<string, string> = {};
    PROVIDERS.forEach((p) => {
      checks[p.name] = "probing";
      probeProvider(p).then((ok) => {
        setProviderStatus((s) => ({ ...s, [p.name]: ok ? "detected" : "not_found" }));
      });
    });
    setProviderStatus(checks);
  }, []);

  useEffect(() => {
    const p = PROVIDERS.find((x) => x.name === provider);
    if (!p) return;
    listModels(p).then((m) => {
      setModels(m);
      if (!model && m.length > 0) setModel(m[0]);
    });
  }, [provider, model, setModel]);

  return (
    <div data-testid="settings-page" className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-white">Settings</h2>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300">Backend health</h3>
        <p className="mt-1 text-sm text-zinc-400">{health}</p>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300">Local LLM providers</h3>
        <div className="mt-3 space-y-2">
          {PROVIDERS.map((p) => {
            const st = providerStatus[p.name] ?? "probing";
            const ok = st === "detected";
            return (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-zinc-200">
                  {p.name} (:{(p as { port: number }).port})
                </span>
                <span className={ok ? "text-green-500" : "text-zinc-500"}>
                  {st === "probing" ? "Probing..." : ok ? "Detected" : "Not found"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <select
            data-testid="llm-provider-select"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
          >
            {PROVIDERS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            data-testid="llm-model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        {Object.values(providerStatus).every((s) => s === "not_found") && (
          <p className="mt-3 text-sm text-amber-500">
            No local LLM detected. Install Ollama or LM Studio to enable AI features.
          </p>
        )}
      </section>
    </div>
  );
}
