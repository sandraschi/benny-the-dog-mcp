import { useEffect, useRef, useState } from "react";
import { Send, Download, Eraser } from "lucide-react";
import { useLlm } from "../store/llm";
import { listModels, PROVIDERS, probeProvider } from "../lib/provider";
import { API_BASE, fetchSkills } from "../lib/api";

interface Msg {
  role: "user" | "assistant";
  content: string;
  ts?: string;
}

const HISTORY_KEY = "benny-the-dog-mcp-chat-history";
const PERSONALITIES = [
  { id: "assistant", name: "Assistant", prompt: "You are a helpful assistant." },
  { id: "expert", name: "Expert Reviewer", prompt: "You are a rigorous expert reviewer. Be concise and critical." },
  { id: "summarizer", name: "Quick Summarizer", prompt: "You summarize content into clear, short bullet points." },
];

const EXAMPLES = [
  { group: "General", items: ["What can this app do?", "How is the backend health?"] },
  { group: "Roster", items: ["How do I add a member?", "Summarize the membership roster"] },
  { group: "Operations", items: ["Check the last patrol run", "Explain the scheduler jobs"] },
];

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [personality, setPersonality] = useState("assistant");
  const [providerOk, setProviderOk] = useState<boolean | null>(null);
  const { provider, model, setProvider, setModel } = useLlm();
  const [models, setModels] = useState<string[]>([]);
  const [skillName, setSkillName] = useState<string | null>(null);
  const [skillContent, setSkillContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-100)));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let alive = true;
    probeProvider(PROVIDERS[0]).then((ok) => {
      if (alive) setProviderOk(ok);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const p = PROVIDERS.find((x) => x.name === provider);
    if (!p) return;
    listModels(p).then((m) => {
      setModels(m);
      if (!model && m.length > 0) setModel(m[0]);
    });
  }, [provider, model, setModel]);

  useEffect(() => {
    fetchSkills()
      .then(async (names) => {
        if (names.length > 0) {
          setSkillName(names[0]);
          const r = await fetch(`${API_BASE}/skill/${names[0]}`);
          if (r.ok) setSkillContent(await r.text());
        }
      })
      .catch(() => undefined);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const p = PROVIDERS.find((x) => x.name === provider);
    if (!p) return;
    const next: Msg[] = [...messages, { role: "user", content: text, ts: new Date().toISOString() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const persona = PERSONALITIES.find((x) => x.id === personality);
      const role = persona?.prompt ?? "";
      const system = skillContent ? `${skillContent}\n\n---\n\n## Role\n${role}` : role;
      const r = await fetch(`${p.base}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            ...next.map(({ role: rl, content }) => ({ role: rl, content })),
          ],
        }),
      });
      const j = await r.json();
      const reply = j?.choices?.[0]?.message?.content ?? "(no response)";
      setMessages((m) => [...m, { role: "assistant", content: reply, ts: new Date().toISOString() }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "network"}`, ts: new Date().toISOString() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const exportChat = () => {
    const body = messages.map((m) => `[${m.ts ?? ""}] ${m.role}: ${m.content}`).join("\n");
    const blob = new Blob([body], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `benny-the-dog-mcp-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div data-testid="chat-page" className="flex h-full flex-col space-y-3">
      <div data-testid="chat-controls" className="flex flex-wrap items-center gap-2">
        <select
          data-testid="personality-select"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
        >
          {PERSONALITIES.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          data-testid="llm-provider-select"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
        >
          {PROVIDERS.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select
          data-testid="llm-model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
        >
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span
          data-testid="llm-status"
          className={`text-xs ${providerOk ? "text-green-500" : "text-red-500"}`}
        >
          {providerOk === null ? "Detecting..." : providerOk ? "Ollama on :11434" : "Not detected"}
        </span>
        {skillName && (
          <span className="rounded bg-zinc-900 px-2 py-1 text-xs text-amber-500" data-testid="skill-indicator">
            skill:{skillName}
          </span>
        )}
        <div className="ml-auto flex gap-1">
          <button
            data-testid="chat-export"
            onClick={exportChat}
            disabled={messages.length === 0}
            className="rounded bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
            title="Export chat"
          >
            <Download size={16} />
          </button>
          <button
            data-testid="chat-clear"
            onClick={clearChat}
            disabled={messages.length === 0}
            className="rounded bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
            title="Clear chat"
          >
            <Eraser size={16} />
          </button>
        </div>
      </div>
      <div data-testid="chat-messages" className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-amber-500 text-zinc-950"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm text-zinc-500">Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div data-testid="example-prompts" className="flex flex-wrap gap-2">
        {EXAMPLES.map((g) => (
          <div key={g.group} className="flex items-center gap-1">
            <span className="text-xs text-zinc-600">{g.group}:</span>
            {g.items.map((e) => (
              <button
                key={e}
                onClick={() => setInput(e)}
                className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:border-amber-500 hover:text-amber-400"
              >
                {e}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          data-testid="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Ask something..."
          className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
        />
        <button
          data-testid="chat-send"
          onClick={send}
          disabled={busy || !providerOk}
          className="rounded bg-amber-500 px-4 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}