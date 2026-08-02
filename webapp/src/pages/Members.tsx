import { useEffect, useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { API_BASE } from "../lib/api";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const load = () => {
    fetch(`${API_BASE}/api/members`)
      .then((r) => r.json())
      .then((j) => setMembers(j.members ?? []))
      .catch(() => setMembers([]));
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim() || !email.trim()) return;
    await fetch(`${API_BASE}/api/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });
    setName("");
    setEmail("");
    load();
  };

  const remove = async (id: number) => {
    await fetch(`${API_BASE}/api/members/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div data-testid="members-page" className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Members</h2>
      <div className="flex gap-2">
        <input
          data-testid="member-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
        />
        <input
          data-testid="member-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
        />
        <button
          data-testid="member-add"
          onClick={add}
          disabled={!name.trim() || !email.trim()}
          className="rounded bg-amber-500 px-3 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
          title="Add member"
        >
          <UserPlus size={16} />
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2">Name</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Role</th>
            <th className="pb-2">Joined</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-t border-zinc-800">
              <td className="py-2 text-zinc-200">{m.name}</td>
              <td className="text-zinc-400">{m.email}</td>
              <td className="text-zinc-400">{m.role}</td>
              <td className="text-zinc-500">{m.created_at}</td>
              <td>
                <button
                  onClick={() => remove(m.id)}
                  className="text-zinc-600 hover:text-red-400"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {members.length === 0 && (
        <p className="text-zinc-500">No members yet. Add the first one above.</p>
      )}
    </div>
  );
}