# Benny the Dog MCP — User Guide and Tutorials

This guide teaches you how to use benny-the-dog-mcp, from the very first
install to advanced care workflows involving the Boomy robot patrol. It is
written in plain language with many examples and full dialogues, so you can
read it top to bottom once, then return to specific chapters as needed.

## 1. What you are setting up

benny-the-dog-mcp is a small local server that keeps a diary of everything
that matters for Benny's wellbeing. Every event — a water bowl refill, a
detected movement, a bark, a sausage delivery, a movie on the projector, a
wake call — is written to a local SQLite database with a timestamp. The server
then lets you, the robot patrol, and AI assistants read that diary, reason
about Benny's state, and record new events.

The whole thing runs on your own machine. Nothing leaves your home network
unless you configure it to. The webapp is a dark-themed dashboard that shows
the same data as the tools, plus extras like a dog profile, a photo album, and
a map of dogparks and drinking fountains.

## 2. Installation

### 2.1 Requirements

- Windows 11 (or 10) with PowerShell.
- Python 3.11 or newer.
- uv (the fast Python package manager).
- Bun (for the webapp frontend).
- Git (only if you clone the repository).

### 2.2 Get the code

Clone the repository:

```
git clone https://github.com/sandraschi/benny-the-dog-mcp
cd benny-the-dog-mcp
```

If you received the MCPB bundle instead (from Claude Desktop), the package
contains the same server code plus the prompts you are reading now.

### 2.3 Install dependencies

```
uv sync
bun --prefix webapp install
```

The first command installs the Python backend (FastMCP, FastAPI, uvicorn,
APScheduler). The second installs the webapp (React, Vite, Tailwind, Zustand).

### 2.4 Configure

Copy the example environment file and adjust if needed:

```
copy .env.example .env
```

The defaults work out of the box: backend on port 11142, frontend on 11143,
scheduler enabled. The only variable you might want to set is OLLAMA_URL if
you run Ollama on a different machine or port, and the SMTP_* variables if you
plan to enable email features (see the chapter on optional features).

### 2.5 Start everything

Double-click `start.bat`, or run from PowerShell:

```
.\start.ps1
```

The script clears any stale processes on ports 11142 and 11143, starts the
backend, waits for the health endpoint to answer, starts the frontend, and
opens your browser at http://127.0.0.1:11143. You should see the dashboard
with a green "Connected" dot in the top bar.

## 3. First steps in the webapp

### 3.1 The dashboard

The dashboard greets you with a hero section explaining what the app does, a
welcome banner pointing to the onboarding wizard (until you finish it), a dog
card (once a profile exists), and four KPIs: server name, tool count, status,
and version.

### 3.2 The onboarding wizard

Click "Onboarding" in the sidebar (or the "Start" button in the welcome
banner). The wizard has six steps:

1. Bio — name, breed, age, weight, and a short description of Benny.
2. Photos — up to five pictures, stored locally as base64 in the database.
3. Vet and health — vet name and phone, allergies, medications, last checkup
   date, and any conditions.
4. Behaviour — energy level, barkiness, temperament, socialization, and fears.
5. Walking — walk times, duration in minutes, and the preferred route.
6. Dogparks and fountains — the places the patrol should check on its route.

Completing the wizard writes the profile to the server and clears the welcome
banner. From then on, the dashboard shows the dog card with the first photo.

### 3.3 The Tools page

The Tools page queries the server for the live tool list. It is not a static
list — it reflects whatever tools the server actually registered. You will see
dog_ops (the main care tool), app_info, and server_shutdown. This page is the
ground truth when you want to know what the assistant can do.

### 3.4 The Skills page

The Skills page fetches the server's SKILL.md and renders it as markdown. This
is the same document that AI assistants receive to learn how to operate the
server. Reading it is a good way to understand the care protocol.

### 3.5 The Chat page

The Chat page is a full LLM chat. It loads the server skill as the base system
prompt, lets you pick a personality (Assistant, Expert Reviewer, Quick
Summarizer, or Custom), detects your local LLM provider (Ollama, LM Studio, or
vLLM), and shows a provider status indicator. Chat history persists in your
browser (last 100 messages), and you can export it as a text file or clear it.

To use chat, start Ollama on the default port 11434. The status text will flip
to "Ollama on :11434" in green and the send button will enable. Ask questions
like "How is Benny doing?" — the assistant will call dog_ops(operation=
"status") and give you a natural-language summary.

### 3.6 Other pages

- Jobs — shows the patrol scheduler job, its next run time, and the last run
  result; you can trigger a patrol manually.
- Logs — the in-memory ring buffer of server events (source, level, message).
- ApiDocs — embeds the FastAPI Swagger UI for the REST surface.
- Members — the household roster (name, email, role).
- Shop and Cart — the playful merch store (stickers, keycaps, mugs,
  t-shirts). No real payments.
- Settings — backend health and local LLM provider detection.
- Help — this documentation in-app.

## 4. Using the assistant for daily care

The quickest way to interact with the system is to ask the assistant in plain
language. Here are example dialogues.

### 4.1 Morning check

You: "How is Benny this morning?"

Assistant: dog_ops(operation="status") returns the event history. It answers
something like:

"Benny is fine. Water was topped up at 08:10. He moved at 08:30 and 09:15.
No barks overnight. Next walk is scheduled for 13:00 per his profile."

### 4.2 Logging a water refill

You: "I just topped up his bowl."

Assistant: dog_ops(operation="water_refill", detail="bowl topped up, 2L")
returns "Water bowl topped up." The event is now in the diary with a
timestamp.

### 4.3 Reporting a bark

You: "He barked a lot just now."

Assistant: dog_ops(operation="bark_event", detail="sustained barking, ~10
minutes") returns "Bark logged - check on Benny." If the patrol job or a
status check then finds no movement after the bark, the assistant will flag
possible loneliness and offer options: a sausage delivery, a wake call, movie
time, or a walk.

### 4.4 Emergency sausage

You: "Boomy, drop him a sausage." (or you deliver it yourself)

Assistant: dog_ops(operation="sausage_delivery", actor="boomy", detail=
"emergency sausage dropped") returns "Sausage delivered. Good boy points
awarded."

### 4.5 Movie time

You: "Put on White Fang for him."

Assistant: dog_ops(operation="movie_time", detail="White Fang") returns
"Playing White Fang on the projector" with a host command hint. The actual
playback happens on the machine that hosts the media.

### 4.6 Wake call

You: "Wake him up gently."

Assistant: dog_ops(operation="wake", detail="gentle chime") returns "Wake call
issued."

## 5. Understanding the status answer

When you ask for status, the assistant reads a structured payload. Here is
what each part means:

- water_refills — how many times the bowl was topped up in the recent window.
- barks — how many barks were logged.
- movements — how many times movement was detected.
- sausage_deliveries — how many emergency sausages were delivered.
- last_movement — the timestamp of the most recent movement, or nothing if the
  dog has been still.
- loneliness_flag — true when there are barks and no movement after them. This
  is a heuristic, not a diagnosis.
- events — the ten most recent diary entries.

You can always ask for more detail: "When exactly did he last move?" or "How
many sausages did Boomy deliver this week?" — the assistant will query the log
and answer with timestamps.

## 6. The patrol job

Every five minutes the server runs a background job called "patrol". It reads
the event diary and decides whether Benny needs attention:

- Normal case: the patrol logs "patrol completed - Benny checked".
- Concern case: if there is a bark and no movement after it, the patrol logs a
  warning: "patrol: Benny barked with no recent movement - loneliness flag,
  consider sausage".

You can see patrol runs on the Jobs page (last run time, status, message) and
trigger a run on demand with the Run button. The patrol is the robot-ready
heartbeat of the system — when Boomy is wired in, the robot uses the same
logic to decide when to intervene.

## 7. The Boomy robot integration

The server was designed with a robot patrol in mind. The actor field on every
event accepts "boomy". The intended data flow:

1. Boomy's camera detects motion in Benny's room. It calls
   dog_ops(operation="movement", actor="boomy", detail="camera: motion in
   living room").
2. Boomy's sound sensor detects barking. It calls
   dog_ops(operation="bark_event", actor="boomy").
3. The patrol logic (or you, via the assistant) reads the events and decides:
   if bark with no movement after it, Boomy delivers a sausage:
   dog_ops(operation="sausage_delivery", actor="boomy").
4. In the morning, the human reads the diary and sees exactly what the robot
   did overnight, with timestamps.

Nothing about the server needs to change when Boomy comes online — the tools
and the actor field are ready.

## 8. The dog profile in detail

The profile is the context every care decision should be made against. The
fields matter in practice:

- allergies and medications — tell the assistant what Benny cannot eat or
  must receive. Check before recommending any treat.
- walk_times and walk_duration_min — the schedule the patrol and the
  assistant use to suggest walks.
- energy_level and temperament — calibrate expectations. "high" plus constant
  movement is normal; "low" plus no movement may need a vet.
- fears — never suggest an activity that triggers a known fear.
- vet_name and vet_phone — who to call when something is wrong.
- last_checkup — how long ago the vet saw him.

You can edit the profile any time by reopening the onboarding wizard — it
loads the saved values.

## 9. Managing the roster

The Members page (or the /api/members endpoints) keeps the household roster.
Add the humans involved in Benny's care with their email and role. This is
useful for routing care questions and for knowing who is on duty.

## 10. The webshop

The Shop page lists seeded products: a robot patrol sticker, a fleet keycap,
an MCP mug, and a scheduler t-shirt. Add items to the cart (Zustand store in
your browser), and checkout posts an order to the server (stored in SQLite).
No payment is processed and nothing ships — it is a demo surface that proves
the full CRUD stack works. The assistant should be honest about this when
asked.

## 11. Optional features

Three optional surfaces are disabled by default via environment variables:

- ENABLE_EMAIL=1 enables POST /api/contact. Configure SMTP_HOST, SMTP_PORT,
  SMTP_USER, SMTP_PASS first. Without a real SMTP relay, the endpoint only
  validates input and returns "email queued" — it does not send anything.
- ENABLE_UPLOAD=1 enables a multipart upload endpoint. The webapp uploads
  photos as base64 JSON instead, so you rarely need it.
- ENABLE_REALTIME=1 enables a /ws echo WebSocket for experimentation.

Set them in .env and restart the backend to activate.

## 12. Backing up and resetting

All data lives in one file: data/benny_the_dog_mcp.sqlite3 (the data folder is
gitignored). To back up, copy that file while the server is stopped (or use
the SQLite backup command). To reset everything, delete the file and restart —
the products table re-seeds, and the profile, events, orders, and roster start
empty.

## 13. Troubleshooting common situations

### 13.1 The browser shows "Offline"

The backend did not start or is unreachable. Check in PowerShell:

```
Invoke-WebRequest http://127.0.0.1:11142/api/health
```

Expected: {"status":"ok",...}. If it fails, look at the start.ps1 console for
errors, then rerun .\start.ps1 (it clears ports first).

### 13.2 Chat is disabled

The chat send button is disabled until a local LLM provider answers. Start
Ollama (ollama serve) and check Settings — the provider row should flip to
"Detected". If Ollama runs on a non-default port, set OLLAMA_URL in .env.

### 13.3 The Jobs page is empty

ENABLE_SCHEDULER is set to 0 in .env. Set it back to 1 and restart, or keep it
disabled if you do not want the patrol.

### 13.4 My changes are gone after restart

The SQLite file lives under data/. If you deleted it, or if you are running
from a different working directory, the server starts a fresh database.
Check that data/benny_the_dog_mcp.sqlite3 exists and is being written to.

### 13.5 Port conflicts

If something else already occupies 11142 or 11143, start.ps1 kills the
process holding the port. If that is not what you want, pick free ports,
update .env (WEB_PORT), webapp/src/lib/api.ts, and webapp/vite.config.ts to
match, and re-register in the fleet port registry.

## 14. Testing your installation

From the repository root:

```
uv run pytest tests/        # backend tests (needs 60%+ coverage)
bun --prefix webapp run e2e # Playwright end-to-end tests
```

The backend tests exercise the health endpoint, the tools endpoint, dog
profile round-trips, dog track CRUD, capabilities, diagnostics, skills,
members, products and orders, logs and jobs, and dog pictures. The e2e tests
boot the webapp, assert the dashboard renders without console errors, and
click through the sidebar.

## 15. Where things live in the code

- src/benny_the_dog_mcp/server.py — the server: MCP tools, FastAPI routes,
  CORS, the patrol scheduler, and the log ring buffer.
- src/benny_the_dog_mcp/db.py — all SQLite access.
- src/benny_the_dog_mcp/skills/benny_the_dog_mcp/SKILL.md — the care skill.
- webapp/src/pages/ — the React pages.
- webapp/src/store/ — Zustand stores (llm, cart).
- webapp/src/lib/ — API base and provider probing.
- tests/ — pytest suite.
- assets/prompts/ — this documentation set for AI assistants.

## 16. Getting help

- In-app Help page and the /docs Swagger UI.
- The server log ring buffer at /api/logs (webapp Logs page).
- Fleet standards live in the mcp-central-docs repository; the port registry
  documents 11142/11143 for this server.
- For anything about Benny himself: ask the assistant — it reads the diary,
  consults the profile, and gives you an evidence-based answer.

## 17. Full example dialogues

### 17.1 A complete morning routine

You: "Good morning, how did the night go?"

Assistant calls dog_ops(operation="status") and reads the last ten events.

Assistant: "Quiet night. Last water refill 22:40, no barks, no movement
detected after 23:05. Loneliness flag is clear. His first walk is scheduled
for 07:30 per the profile - due right now. Want me to log anything?"

You: "Yes, I topped up the water."

Assistant: dog_ops(operation="water_refill", detail="morning refill, 2L").

Assistant: "Logged at 07:32. Water bowl topped up, 2L."

### 17.2 Handling a loneliness alarm

You: "Benny keeps barking, it's been 20 minutes."

Assistant: dog_ops(operation="bark_event", detail="continuous barking, 20 min")
then dog_ops(operation="status").

Assistant: "Logged the bark. The status check confirms a loneliness flag:
bark at 15:40, no movement since 13:12. Options: 1) sausage delivery now,
2) wake call to break the cycle, 3) put on White Fang, 4) take him for the
16:00 walk early. Which do you want?"

You: "Sausage first, then we walk."

Assistant: dog_ops(operation="sausage_delivery", actor="human", detail=
"one emergency sausage").

Assistant: "Done - sausage delivered at 15:44. I'll keep an eye on the next
status check; if the flag clears, we are good."

### 17.3 Using the robot for a delivery

You: "Ask Boomy to drop a sausage, I am in a meeting."

Assistant: dog_ops(operation="sausage_delivery", actor="boomy", detail=
"robot delivery, kitchen door").

Assistant: "Logged as a Boomy delivery. When the robot confirms physically,
the patrol will see it in the diary."

### 17.4 Scheduling awareness

You: "When is his next walk due?"

Assistant reads the profile (walk_times) and the diary.

Assistant: "Profile says 07:30, 13:00, 18:00, 22:00. The 13:00 walk has not
been logged as movement yet - he is due now."

## 18. Webapp walkthrough, page by page

### 18.1 Dashboard

Layout: welcome banner (until onboarding is done), dog card with photo and
bio, hero section with the product pitch and a "Explore tools" button, and
four KPI cards (server, tools, status, version). The top bar shows a live
connection dot that turns green when the backend answers the health endpoint.
The health polling uses exponential backoff, so after a backend restart the
dot recovers within about thirty seconds without a page reload.

### 18.2 Tools

Fetches /api/tools live. Each card shows the tool name in monospace and the
first line of its description. Empty state ("No tools discovered. Is the
backend running?") appears when the backend is down.

### 18.3 Skills

Fetches /api/skills, renders skill buttons, and loads the selected skill's
markdown from /skill/{name}. The default skill is benny_the_dog_mcp.

### 18.4 Chat

Controls bar: personality selector, LLM provider selector, model selector,
provider status text, skill indicator, export button, clear button. When the
Custom personality is chosen, a text input appears for your own system prompt
(persisted in localStorage). Messages persist across reloads (last 100) under
the key benny-the-dog-mcp-chat-history. Enter sends; the send button is
disabled while busy or when no provider is detected. Errors render as
assistant messages.

### 18.5 Jobs

Lists scheduler jobs with next run time and a Run Now button. Below each job,
the last run result (timestamp, status, message) is shown. The patrol job
updates every five minutes; triggering it manually runs the same logic
immediately.

### 18.6 Logs

Reads /api/logs (limit adjustable). Each entry shows timestamp, source,
level, and message. The buffer holds the last 200 entries.

### 18.7 ApiDocs

Embeds the FastAPI Swagger UI in an iframe with the fleet dark theme. Use it
to explore the full REST surface interactively. There is also an "Open in
browser" link to http://127.0.0.1:11142/docs.

### 18.8 Members

Simple roster table: add a member (name + email), list members, delete a
member. Roles default to "member".

### 18.9 Shop and Cart

Products load from /api/products (seeded). Add to cart via Zustand; the cart
icon shows the count. The cart page lists items with quantities and total in
EUR, and checkout POSTs an order to /api/orders. After checkout, the cart
clears and a confirmation appears.

### 18.10 Settings

Backend health card (server, version, tool count) and the Local LLM providers
card: each provider (Ollama, LM Studio, vLLM) shows a probing/detected/not
found status, plus provider and model selectors persisted in localStorage. If
no provider is detected, an amber hint suggests installing Ollama or LM
Studio.

### 18.11 Onboarding

The six-step wizard described in chapter 3.2. Step buttons allow jumping
between steps; the finish button writes the profile with onboarded=1 and sets
the localStorage flag that clears the dashboard banner.

## 19. The REST API for power users

Everything the webapp does is available over HTTP. The Swagger UI at /docs
documents it interactively. Key endpoints:

- GET /api/health - liveness probe (used by the dashboard dot).
- GET /api/v1/diagnostics - tool list plus system info; used by installer
  smoke tests.
- GET /api/capabilities - feature flags and tool count.
- GET /api/tools - live tool list.
- GET /api/skills and GET /skill/{name} - skill discovery and content.
- GET /api/logs?limit=N - recent ring-buffer entries.
- GET /api/jobs and POST /api/jobs/{id}/run - scheduler control.
- GET/POST /api/members and DELETE /api/members/{id} - roster CRUD.
- GET /api/products and POST /api/orders - webshop.
- GET/PUT /api/dog/profile - read/write the dog profile.
- GET/POST /api/dog/pics and DELETE /api/dog/pics/{id} - photo CRUD (base64).
- GET/POST /api/dog/tracks and DELETE /api/dog/tracks/{id} - parks/fountains.
- /mcp - the MCP streamable HTTP endpoint for MCP clients.
- /ws - echo WebSocket when ENABLE_REALTIME=1.

Power users can script the whole care diary:

```
Invoke-RestMethod http://127.0.0.1:11142/api/health
Invoke-RestMethod http://127.0.0.1:11142/api/dog/profile
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:11142/api/dog/tracks `
  -Body '{"track_type":"park","name":"Augarten","lat":48.225,"lon":16.371}'
```

## 20. Extending the system

### 20.1 Adding a care operation

The dog_ops portmanteau is the single extension point for care events. To add
an operation (say "brush" for grooming sessions): add the literal to the
operation enum in server.py, implement the branch (log the event via
db.log_dog_event with a ring_log line), and update the docstring operations
list, the SKILL.md, this user guide, and docs/TOOLS.md. The webapp does not
need changes - status payloads are dynamic.

### 20.2 Adding webhooks

The server currently exposes no inbound webhook endpoint. If Boomy's cloud
hub needs to push events, add a POST /api/webhooks/benny route that validates
a shared secret (env var BENNY_WEBHOOK_SECRET) and logs the event. Document it
in docs/TOOLS.md.

### 20.3 Connecting the chat to a hosted model

The chat targets local providers by default. To use a hosted OpenAI-compatible
endpoint, extend webapp/src/lib/provider.ts with a provider entry pointing at
the hosted base URL and port, and keep the key out of the bundle by proxying
through the backend.

## 21. Security notes

- The server binds to 127.0.0.1 by default. Do not expose it to the internet
  without authentication; there is none built in.
- CORS allows localhost, tauri origins, Tailscale hosts, and LAN addresses
  per the fleet standard. LAN exposure is convenient for tablets but keep it
  inside your trusted network.
- The .env file contains SMTP credentials if you enable email. It is
  gitignored; never commit it. The repository ships only .env.example.
- Dog photos are stored as base64 in SQLite in the local data folder. They
  are not encrypted; treat the data folder like a private document.
- The webshop processes no payments and stores no card data.

## 22. Frequently asked questions

Q: Does the server need an internet connection? A: No. Everything runs
locally. The only optional network dependency is your local LLM provider for
the chat page.

Q: Can I run the webapp on another machine on my network? A: Yes. Run the
backend with WEB_HOST=0.0.0.0 (or a LAN IP) and open
http://<machine-ip>:11143 from the other device; CORS covers LAN origins.

Q: What happens to events when I restart? A: They persist in SQLite. Only
deleting the database file removes them.

Q: How do I know the patrol ran? A: The Jobs page shows the last run
timestamp and message. The log ring also records scheduler entries.

Q: Can multiple people use it at once? A: Yes for reads and webapp use. The
SQLite database is WAL-mode; concurrent writes are serialized safely.

Q: Why does the chat sometimes say "no response"? A: The provider answered
with an empty completion. Retry, or check the provider's model list in
Settings - the selected model must exist.

Q: Is the loneliness flag reliable? A: It is a heuristic: barks with no
movement after them. Use it as a prompt to check on Benny, not as a verdict.

## 23. Glossary

- actor - who performed a care event: human, boomy, or sensor.
- care event - one diary entry: water refill, bark, movement, sausage
  delivery, movie, wake.
- dog_ops - the main care portmanteau tool.
- loneliness flag - heuristic true when barks exist without later movement.
- patrol - the five-minute scheduler job that reviews the diary.
- ring buffer - the in-memory 200-entry log served at /api/logs.
- skill - the markdown care protocol served to AI assistants.
- Boomy - the robot patrol that will integrate with this server.

## 24. Final words

Benny is the fleet dog, and this system is his voice in the machines. Keep
the diary honest, keep the water fresh, keep the sausages emergency-only, and
let the patrol do its rounds. If you take care of the records, the records
will take care of Benny.

## 25. Quick reference card

One paragraph per tool, for the impatient reader.

- dog_ops: the care portmanteau. Operations: status (read the diary and the
  loneliness flag), water_refill (log a bowl top-up), bark_event (log a
  bark), movement (log motion detection), sausage_delivery (log an emergency
  treat), movie_time (log projector enrichment), wake (log a wake call).
  Parameters: operation (required), detail (free text), actor (human, boomy,
  or sensor).
- app_info: name, version, tool count. Use it to confirm which server you are
  talking to.
- server_shutdown: stop the server gracefully. Requires confirm=True.

Start every care conversation with dog_ops(operation="status"). Log events
with honest actors and useful details. Let the patrol and the assistant do
the worrying; you do the walking.
