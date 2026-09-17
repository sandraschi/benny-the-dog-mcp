# Build Log — benny-the-dog-mcp

Running record of Tauri/NSIS builds. See `mcp-central-docs/standards/rules/tauri_nsis_building.md`.

## 2026-09-17 — First NSIS build + CUA smoke test (post-assfix, commit fa34ee3)

**Result: PASS** (11/11 CUA smoke test phases, genuine GUI verification with real
window handle, screenshot, and OCR evidence — not a config false-pass).

**Installer**: `src-tauri\target\release\bundle\nsis\Benny The Dog MCP_0.1.0_x64-setup.exe`
(37.6 MB)

### Pre-flight config corrections made before building

The repo uses `src-tauri/` (not `native/`), but several files still referenced the
old `native/` path — a leftover from before the directory was renamed/scaffolded.
Fixed:

- `.gitignore`: `native/target|gen|resources|binaries` → `src-tauri/...` (the old
  rule meant `src-tauri/resources/*.exe` and `src-tauri/target/` were **not**
  actually gitignored — real risk of a 37 MB binary landing in git).
- `scripts/cua-nsis-config.json`: `nsis_glob` pointed at `native/target/...`, so
  the smoke test's installer-finder would never have matched anything under
  `src-tauri/`. Also fixed `install_dir` (`%LOCALAPPDATA%\benny-the-dog-mcp` →
  `%LOCALAPPDATA%\Benny The Dog MCP`, matching the real NSIS install dir which is
  keyed off `productName`, not the identifier slug), `window_title_re` (was the
  lowercase hyphenated slug; the actual Tauri window title is `"Benny The Dog MCP"`
  — pywinauto's `title_re` is case-sensitive so the old value could never match),
  `bridge_ok_text` (was the template's literal placeholder default `"REST bridge
  reachable"`, which never appears anywhere in this app's UI — changed to
  `"Connected"`, the actual text rendered by `Layout.tsx`'s backend-status badge),
  and `uninstall_registry_filter` (hyphenated slug → `*Benny*Dog*MCP*`, matching
  the real registry `DisplayName`).
- `justfile`: added `tauri-preflight` and composite `tauri` recipes per the
  fleet-standard pattern (checks pywinauto/pyinstaller are real deps before
  wasting time on a build).
- `scripts/cua-smoke.py`: was CUA_SMOKE_VERSION 3, fleet template is at version 7.
  Copied the template over. The version bump matters here: v3's `cua_find_window()`
  did a single immediate lookup right after the health check passed, which is a
  documented false-negative source (WebView2 window can still be initializing).
  v7 adds a 10s retry-poll loop. First smoke-test run (pre-upgrade) reported
  "Window matching ... not found" and every downstream GUI phase (screenshot,
  WebView OCR, nav click-through) silently no-op'd while the overall run still
  printed "ALL PHASES PASSED" — a real false pass. After upgrading, the window
  was found immediately (1942x1106) and screenshot/OCR/nav-click-through all ran
  for real.
- `src-tauri/src/backend.rs`: `free_port()` was a single `taskkill`-by-port call
  with no retry/poll and no return value (spawn_backend never checked whether
  the port actually freed). Upgraded to the fleet-standard multi-layer kill
  (image-name kill excluding own PID, port kill, 240s poll, re-kill at 5s,
  UAC-elevated kill at 15s) matching `tauri_nsis_building.md`'s reference impl.
  Also added an independent TCP-connect health-poll thread (belt-and-suspenders
  with the "Uvicorn running" log-line watcher) so `backend-status: ready` fires
  even if the log watcher misses the line.
- `src-tauri/src/backend.rs`: the Rust side was setting env vars `PORT`/`HOST`
  when spawning the backend, but `server.py`'s `main()` reads `WEB_PORT`/`WEB_HOST`.
  This coincidentally worked because both sides defaulted to port 11142, but any
  future port override from the Tauri side would have silently been ignored.
  Fixed to `WEB_PORT`/`WEB_HOST`.
- `src-tauri/tauri.conf.json`: attempted to null out the custom CSP per the fleet
  default (`"csp": null`), but this was **blocked by the permission system as a
  security-weakening action** and left as-is. The existing CSP is scoped to the
  actual backend port (`connect-src 'self' http://127.0.0.1:11142 ...`) and did
  not block anything during the build/test — left alone. Not a genuine gap, just
  a deviation from the generic fleet template default.

### Real app bug found and fixed (not a config issue)

First full CUA smoke test run genuinely failed at Phase 3 (Launch app): the
Tauri-spawned backend never opened port 11142 and the health check timed out
after 30 attempts. `backend-spawn.log` showed the frozen backend crashing at
import time:

```
LookupError: No trigger by the name "interval" was found
```

Root cause: `benny-the-dog-mcp-backend.spec`'s PyInstaller `.dist-info` stripping
step removes all `.dist-info` directories except an explicit preserve list
(`fastmcp-`, `mcp-`, `prefab_ui-`, `opentelemetry-`, `email_validator-`).
`apscheduler` was not on that list, so its own dist-info was stripped, which
breaks APScheduler's entry-point-based trigger-plugin registry (it looks up
`IntervalTrigger` etc. by name via `importlib.metadata` at runtime). This is the
same PyInstaller dist-info-stripping bug family hit on pdf-mcp/teleoperator-mcp
earlier tonight, just against a different package.

**Fix**: added `"apscheduler-"` to the `_keep_dist` preserve list in
`benny-the-dog-mcp-backend.spec`. Verified by running the frozen exe standalone
(`dist\benny-the-dog-mcp-backend.exe` with `WEB_PORT=11999`) before rebuilding
the full Tauri bundle — `/api/health` responded correctly. Rebuilt the full NSIS
installer and the CUA smoke test's Launch phase passed cleanly on retry (backend
healthy on attempt 4).

### CUA smoke test — final run (11/11 phases, genuine verification)

| # | Phase | Result |
|---|-------|--------|
| 1 | Kill stale processes | PASS |
| 2 | Install NSIS | PASS |
| 3 | Launch app (backend health) | PASS (healthy on attempt 4) |
| 4 | Verify window | PASS — window "Benny The Dog MCP" found, 1942x1106 |
| 5 | Screenshot | PASS — 172 KB PNG captured |
| 6 | Feature route (`/api/capabilities`) | PASS — HTTP 200 |
| 7 | Diagnostics (`/api/v1/diagnostics`) | PASS — 4 tools registered, no errors |
| 8 | WebView bridge (OCR) | PASS — "Connected" found in screenshot OCR |
| 9 | Nav click-through (14 pages) | PASS — 13/14 pages OCR-verified; Settings page flagged an OCR false positive (see below) |
| 10 | Analyze app logs | PASS — no errors |
| 11 | Uninstall | PASS — clean uninstall, no registry leftovers verified manually |

**Settings page OCR note**: the automated OCR check flagged the fail-keyword
"not found" on the Settings page. Manual review of the captured screenshot
(`cua-reports/nav/nav-settings-*.png`) confirms this is a false positive — the
page renders correctly (title, backend health card, nav) and "Not found" is
the app's own legitimate status text for absent optional local LLM providers
(Ollama/LM Studio/vLLM — none were running on this machine). Not a bug.

### Files touched this session

`.gitignore`, `scripts/cua-nsis-config.json`, `scripts/cua-smoke.py` (upgraded to
v7), `justfile`, `src-tauri/src/backend.rs`, `benny-the-dog-mcp-backend.spec`.
Timestamped `.bak` copies of each were made before editing per fleet policy.
