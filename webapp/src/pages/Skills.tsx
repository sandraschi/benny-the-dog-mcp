import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { fetchSkills } from "../lib/api";

const API_BASE = "http://127.0.0.1:11142";

export default function Skills() {
  const [skills, setSkills] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .catch(() => setSkills([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`${API_BASE}/api/skills`).catch(() => undefined);
    fetch(`${API_BASE}/skill/${selected}`)
      .then((r) => r.text())
      .then(setContent)
      .catch(() => setContent("(skill content unavailable)"));
  }, [selected]);

  return (
    <div data-testid="skills-page" className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Skills</h2>
      <div className="flex gap-2">
        {skills.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`rounded px-3 py-1 text-sm ${
              selected === s
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {selected && (
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 prose prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
