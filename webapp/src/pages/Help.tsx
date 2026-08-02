export default function Help() {
  return (
    <div data-testid="help-page" className="max-w-3xl space-y-4">
      <h2 className="text-xl font-semibold text-white">Help</h2>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300">Architecture</h3>
        <p className="mt-1 text-sm text-zinc-400">
          benny-the-dog-mcp is a fleet-standard fullstack app: FastMCP 3.4 backend (uvicorn),
          React + Vite + Tailwind frontend (Bun), optional Tauri 2.0 desktop wrapper.
        </p>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300">Ports</h3>
        <p className="mt-1 font-mono text-sm text-zinc-400">
          Backend: 11142 (API, docs at /docs) | Frontend: 11143
        </p>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300">Troubleshooting</h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-zinc-400">
          <li>Backend offline: run start.ps1 (clears port zombies first)</li>
          <li>Chat disabled: start Ollama (http://127.0.0.1:11434)</li>
          <li>Ports in use: check mcp-central-docs/operations/WEBAPP_PORTS.md</li>
        </ul>
      </section>
    </div>
  );
}