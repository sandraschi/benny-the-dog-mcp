import { useEffect, useState } from "react";
import { Activity, Cpu, Server, Wrench } from "lucide-react";
import { fetchHealth, type HealthInfo } from "../lib/api";

const API_BASE = "http://127.0.0.1:11142";

interface DogCard {
  name: string;
  breed: string;
  bio: string;
  energy_level: string;
}

function Kpi({
  testid,
  label,
  value,
  icon: Icon,
}: {
  testid: string;
  label: string;
  value: string;
  icon: typeof Server;
}) {
  return (
    <div
      data-testid={testid}
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
    >
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={16} />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-amber-500">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [dog, setDog] = useState<DogCard | null>(null);
  const [dogPic, setDogPic] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
    fetch(`${API_BASE}/api/dog/profile`)
      .then((r) => r.json())
      .then((j) => {
        if (j.profile) setDog(j.profile);
      })
      .catch(() => undefined);
    fetch(`${API_BASE}/api/dog/pics`)
      .then((r) => r.json())
      .then((j) => {
        const first = j.pics?.[0];
        if (first) setDogPic(`data:${first.mime};base64,${first.data_base64}`);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div data-testid="dashboard" className="space-y-6">
      {localStorage.getItem("benny-the-dog-mcp-onboarded") !== "1" && (
        <div className="flex items-center justify-between rounded-lg border border-amber-800/50 bg-amber-950/30 p-4">
          <span className="text-sm text-amber-300">
            Welcome! Finish the dog onboarding to get the most out of benny-the-dog-mcp.
          </span>
          <a
            href="/onboarding"
            className="rounded bg-amber-500 px-3 py-1 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Start
          </a>
        </div>
      )}
      {dog && (
        <section
          className="flex items-center gap-4 rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/40 to-zinc-900 p-6"
          data-testid="dog-card"
        >
          {dogPic && (
            <img
              src={dogPic}
              alt={dog.name}
              className="h-20 w-20 rounded-full border-2 border-amber-700 object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-amber-400">{dog.name}</h3>
            <p className="text-sm text-zinc-400">
              {dog.breed || "mystery breed"} · energy: {dog.energy_level}
            </p>
            <p className="mt-1 max-w-xl text-xs text-zinc-500">{dog.bio}</p>
            <a href="/onboarding" className="mt-2 inline-block text-xs text-amber-500 hover:underline">
              Edit profile
            </a>
          </div>
        </section>
      )}
      <section className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <h2 className="text-3xl font-bold text-white">benny-the-dog-mcp</h2>
        <p className="mt-2 max-w-xl text-zinc-400">
          Benny the dog health and care monitor - water bowls, movement, loneliness detection, sausage deliveries, projector movie time, wake calls. Boomy-robot patrol integration ready.
        </p>
        <div className="mt-4 flex gap-2">
          <a
            href="/tools"
            className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Explore tools
          </a>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi testid="kpi-server" label="Server" value={health?.server ?? "..."} icon={Server} />
        <Kpi testid="kpi-tools" label="Tools" value={String(health?.tool_count ?? "-")} icon={Wrench} />
        <Kpi testid="kpi-status" label="Status" value={health?.status ?? "..."} icon={Activity} />
        <Kpi testid="kpi-version" label="Version" value={health?.version ?? "..."} icon={Cpu} />
      </section>
    </div>
  );
}
