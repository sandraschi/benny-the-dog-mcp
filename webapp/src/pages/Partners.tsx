import { PawPrint, Tag, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

interface Partner {
  id: number;
  name: string;
  email: string;
  role: string;
  tags: string;
  created_at: string;
}

const SUGGESTED_TAGS = ["dog walker", "dog homestay", "sitter", "boomy handler", "vet contact"];

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");

  const load = () => {
    fetch(`${API_BASE}/api/partners`)
      .then((r) => r.json())
      .then((j) => setPartners(j.partners ?? []))
      .catch(() => setPartners([]));
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim() || !email.trim()) return;
    await fetch(`${API_BASE}/api/partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), tags }),
    });
    setName("");
    setEmail("");
    setTags("");
    load();
  };

  const remove = async (id: number) => {
    await fetch(`${API_BASE}/api/partners/${id}`, { method: "DELETE" });
    load();
  };

  const toggleSuggestion = (t: string) => {
    const current = tags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    setTags(
      current.includes(t) ? current.filter((x) => x !== t).join(", ") : [...current, t].join(", "),
    );
  };

  return (
    <div data-testid="partners-page" className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Dog partners</h2>
      <p className="text-sm text-zinc-400">
        The people who help care for Benny - walkers, homestay hosts, sitters, the vet, and the
        Boomy handler.
      </p>
      <div className="flex gap-2">
        <input
          data-testid="partner-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
        />
        <input
          data-testid="partner-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
        />
        <input
          data-testid="partner-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags: dog walker, dog homestay"
          className="w-64 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
        />
        <button
          data-testid="partner-add"
          onClick={add}
          disabled={!name.trim() || !email.trim()}
          className="rounded bg-amber-500 px-3 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
          title="Add partner"
        >
          <UserPlus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-zinc-500">
          <Tag size={12} className="mr-1 inline" />
          Quick tags:
        </span>
        {SUGGESTED_TAGS.map((t) => {
          const active = tags
            .split(",")
            .map((x) => x.trim())
            .includes(t);
          return (
            <button
              key={t}
              onClick={() => toggleSuggestion(t)}
              className={`rounded-full border px-2 py-0.5 text-xs ${
                active
                  ? "border-amber-500 bg-amber-500/20 text-amber-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-amber-500 hover:text-amber-400"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2">Name</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Tags</th>
            <th className="pb-2">Role</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {partners.map((m) => (
            <tr key={m.id} className="border-t border-zinc-800">
              <td className="py-2 text-zinc-200">{m.name}</td>
              <td className="text-zinc-400">{m.email}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {(m.tags || "")
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400"
                      >
                        <PawPrint size={10} /> {t}
                      </span>
                    ))}
                  {!m.tags && <span className="text-zinc-600">—</span>}
                </div>
              </td>
              <td className="text-zinc-500">{m.role}</td>
              <td>
                <button
                  onClick={() => remove(m.id)}
                  className="text-zinc-600 hover:text-red-400"
                  title="Remove partner"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {partners.length === 0 && (
        <p className="text-zinc-500">No dog partners yet. Add the first one above.</p>
      )}
    </div>
  );
}
