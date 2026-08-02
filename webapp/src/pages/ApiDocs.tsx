import { API_BASE } from "../lib/api";

export default function ApiDocs() {
  return (
    <div data-testid="api-docs-page" className="flex h-full flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">API Docs</h2>
        <a
          href={`${API_BASE}/docs`}
          target="_blank"
          rel="noreferrer"
          className="rounded bg-zinc-800 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Open in browser
        </a>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {["GET /api/health", "GET /api/v1/diagnostics", "GET /api/tools", "GET /api/skills", "GET /api/logs", "GET /api/jobs", "POST /api/jobs/{id}/run", "/mcp"].map(
          (ep) => (
            <span key={ep} className="rounded bg-zinc-900 px-2 py-1 font-mono text-amber-500">
              {ep}
            </span>
          ),
        )}
      </div>
      <iframe
        src={`${API_BASE}/docs`}
        title="Swagger UI"
        className="min-h-0 flex-1 rounded-lg border border-zinc-800 bg-white"
      />
    </div>
  );
}