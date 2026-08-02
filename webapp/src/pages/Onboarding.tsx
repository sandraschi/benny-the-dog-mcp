import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/api";

const ONBOARDED_KEY = "benny-the-dog-mcp-onboarded";

interface Profile {
  name: string;
  breed: string;
  age_years: number;
  weight_kg: number;
  bio: string;
  vet_name: string;
  vet_phone: string;
  allergies: string;
  medications: string;
  last_checkup: string;
  conditions: string;
  energy_level: string;
  temperament: string;
  barkiness: string;
  socialization: string;
  fears: string;
  walk_times: string;
  walk_duration_min: number;
  walk_route: string;
  onboarded: number;
}

interface Pic {
  id: number;
  name: string;
  mime: string;
  data_base64: string;
}

interface Track {
  id: number;
  track_type: string;
  name: string;
  lat: number;
  lon: number;
  notes: string;
}

const EMPTY: Profile = {
  name: "",
  breed: "",
  age_years: 0,
  weight_kg: 0,
  bio: "",
  vet_name: "",
  vet_phone: "",
  allergies: "",
  medications: "",
  last_checkup: "",
  conditions: "",
  energy_level: "medium",
  temperament: "",
  barkiness: "medium",
  socialization: "",
  fears: "",
  walk_times: "",
  walk_duration_min: 30,
  walk_route: "",
  onboarded: 0,
};

const STEPS = ["Bio", "Photos", "Vet & health", "Behaviour", "Walking", "Dogparks & fountains"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [pics, setPics] = useState<Pic[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [parkName, setParkName] = useState("");
  const [parkLat, setParkLat] = useState("");
  const [parkLon, setParkLon] = useState("");
  const [fountainName, setFountainName] = useState("");
  const [fountainLat, setFountainLat] = useState("");
  const [fountainLon, setFountainLon] = useState("");
  const [done, setDone] = useState(() => localStorage.getItem(ONBOARDED_KEY) === "1");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/dog/profile`)
      .then((r) => r.json())
      .then((j) => {
        if (j.profile) setProfile({ ...EMPTY, ...j.profile });
      })
      .catch(() => undefined);
    fetch(`${API_BASE}/api/dog/pics`)
      .then((r) => r.json())
      .then((j) => setPics(j.pics ?? []))
      .catch(() => undefined);
    fetch(`${API_BASE}/api/dog/tracks`)
      .then((r) => r.json())
      .then((j) => setTracks(j.tracks ?? []))
      .catch(() => undefined);
  }, []);

  const set = (k: keyof Profile, v: unknown) => setProfile((p) => ({ ...p, [k]: v }));

  const uploadPics = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files).slice(0, 5)) {
      const reader = new FileReader();
      reader.onload = async () => {
        const data = String(reader.result).split(",")[1] ?? "";
        await fetch(`${API_BASE}/api/dog/pics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, mime: file.type, data }),
        });
        const j = await (await fetch(`${API_BASE}/api/dog/pics`)).json();
        setPics(j.pics ?? []);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePic = async (id: number) => {
    await fetch(`${API_BASE}/api/dog/pics/${id}`, { method: "DELETE" });
    setPics((p) => p.filter((x) => x.id !== id));
  };

  const addTrack = async (trackType: string, name: string, lat: string, lon: string) => {
    if (!name.trim()) return;
    await fetch(`${API_BASE}/api/dog/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        track_type: trackType,
        name: name.trim(),
        lat: Number.parseFloat(lat) || 0,
        lon: Number.parseFloat(lon) || 0,
      }),
    });
    const j = await (await fetch(`${API_BASE}/api/dog/tracks`)).json();
    setTracks(j.tracks ?? []);
    if (trackType === "park") {
      setParkName("");
      setParkLat("");
      setParkLon("");
    } else {
      setFountainName("");
      setFountainLat("");
      setFountainLon("");
    }
  };

  const removeTrack = async (id: number) => {
    await fetch(`${API_BASE}/api/dog/tracks/${id}`, { method: "DELETE" });
    setTracks((t) => t.filter((x) => x.id !== id));
  };

  const finish = async () => {
    const saved = await (
      await fetch(`${API_BASE}/api/dog/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, onboarded: 1 }),
      })
    ).json();
    if (saved.success) {
      localStorage.setItem(ONBOARDED_KEY, "1");
      localStorage.setItem("benny-the-dog-mcp-member", profile.name || "friend");
      setDone(true);
    }
  };

  if (done) {
    return (
      <div data-testid="onboarding-page" className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Onboarding</h2>
        <div className="flex items-center gap-2 rounded-lg border border-green-800 bg-green-950/40 p-4 text-green-400">
          <CheckCircle2 size={18} /> All set, {profile.name || "friend"}. Walkies are logged.
        </div>
        {pics[0] && (
          <img
            src={`data:${pics[0].mime};base64,${pics[0].data_base64}`}
            alt={profile.name}
            className="h-40 w-40 rounded-lg border border-zinc-700 object-cover"
          />
        )}
      </div>
    );
  }

  const input =
    "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500";
  const label = "block text-xs uppercase tracking-wide text-zinc-500";

  return (
    <div data-testid="onboarding-page" className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-white">Benny&apos;s onboarding</h2>
      <div className="flex flex-wrap gap-1 text-xs">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 ${
              i === step
                ? "bg-amber-500 text-zinc-950"
                : i < step
                  ? "bg-green-900/50 text-green-400"
                  : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Who is the dog? The fleet needs a bio.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Name</span>
              <input
                data-testid="dog-name"
                value={profile.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Benny"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Breed</span>
              <input
                value={profile.breed}
                onChange={(e) => set("breed", e.target.value)}
                placeholder="Mischling / Beagle mix"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Age (years)</span>
              <input
                type="number"
                value={profile.age_years || ""}
                onChange={(e) => set("age_years", Number.parseFloat(e.target.value) || 0)}
                className={input}
              />
            </div>
            <div>
              <span className={label}>Weight (kg)</span>
              <input
                type="number"
                value={profile.weight_kg || ""}
                onChange={(e) => set("weight_kg", Number.parseFloat(e.target.value) || 0)}
                className={input}
              />
            </div>
          </div>
          <div>
            <span className={label}>Bio / description</span>
            <textarea
              value={profile.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
              placeholder="Good boy, patrol diplomat, sausage enthusiast..."
              className={input}
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">
            A few good pictures. Stored locally, base64 in SQLite.
          </p>
          <div className="flex flex-wrap gap-3">
            {pics.map((p) => (
              <div key={p.id} className="relative">
                <img
                  src={`data:${p.mime};base64,${p.data_base64}`}
                  alt={p.name}
                  className="h-28 w-28 rounded-lg border border-zinc-700 object-cover"
                />
                <button
                  onClick={() => removePic(p.id)}
                  className="absolute right-1 top-1 rounded bg-red-900/80 p-1 text-red-300"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:border-amber-500 hover:text-amber-400"
            >
              <Upload size={18} /> Add
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => uploadPics(e.target.files)}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Vet and health history - critical for the patrol.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Vet name</span>
              <input
                value={profile.vet_name}
                onChange={(e) => set("vet_name", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <span className={label}>Vet phone</span>
              <input
                value={profile.vet_phone}
                onChange={(e) => set("vet_phone", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <span className={label}>Allergies</span>
              <input
                value={profile.allergies}
                onChange={(e) => set("allergies", e.target.value)}
                placeholder="none"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Medications</span>
              <input
                value={profile.medications}
                onChange={(e) => set("medications", e.target.value)}
                placeholder="none"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Last checkup</span>
              <input
                value={profile.last_checkup}
                onChange={(e) => set("last_checkup", e.target.value)}
                placeholder="2026-05-01"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Conditions</span>
              <input
                value={profile.conditions}
                onChange={(e) => set("conditions", e.target.value)}
                placeholder="none"
                className={input}
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">
            Behaviour assessment - how the patrol should read him.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Energy level</span>
              <select
                value={profile.energy_level}
                onChange={(e) => set("energy_level", e.target.value)}
                className={input}
              >
                {["low", "medium", "high", "chaos"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>Barkiness</span>
              <select
                value={profile.barkiness}
                onChange={(e) => set("barkiness", e.target.value)}
                className={input}
              >
                {["low", "medium", "high", "opinionated"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>Temperament</span>
              <input
                value={profile.temperament}
                onChange={(e) => set("temperament", e.target.value)}
                placeholder="friendly, stubborn, noble"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Socialization</span>
              <input
                value={profile.socialization}
                onChange={(e) => set("socialization", e.target.value)}
                placeholder="great with robots, wary of cats"
                className={input}
              />
            </div>
            <div className="col-span-2">
              <span className={label}>Fears</span>
              <input
                value={profile.fears}
                onChange={(e) => set("fears", e.target.value)}
                placeholder="vacuums, thunder, the mailman"
                className={input}
              />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Walking schedule - the patrol can plan around it.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Walk times</span>
              <input
                value={profile.walk_times}
                onChange={(e) => set("walk_times", e.target.value)}
                placeholder="07:30, 13:00, 18:00, 22:00"
                className={input}
              />
            </div>
            <div>
              <span className={label}>Duration (min)</span>
              <input
                type="number"
                value={profile.walk_duration_min || ""}
                onChange={(e) => set("walk_duration_min", Number.parseInt(e.target.value) || 30)}
                className={input}
              />
            </div>
            <div className="col-span-2">
              <span className={label}>Preferred route</span>
              <input
                value={profile.walk_route}
                onChange={(e) => set("walk_route", e.target.value)}
                placeholder="canal loop, then the bakery corner"
                className={input}
              />
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">
            Dogparks and drinking fountains - coordinates for the patrol route.
          </p>
          <div className="space-y-3">
            <div className="rounded border border-zinc-800 p-3">
              <div className="mb-2 text-sm text-green-400">Dogpark</div>
              <div className="flex flex-wrap gap-2">
                <input
                  value={parkName}
                  onChange={(e) => setParkName(e.target.value)}
                  placeholder="Name"
                  className={`${input} !w-40`}
                />
                <input
                  value={parkLat}
                  onChange={(e) => setParkLat(e.target.value)}
                  placeholder="Lat"
                  className={`${input} !w-28`}
                />
                <input
                  value={parkLon}
                  onChange={(e) => setParkLon(e.target.value)}
                  placeholder="Lon"
                  className={`${input} !w-28`}
                />
                <button
                  onClick={() => addTrack("park", parkName, parkLat, parkLon)}
                  className="rounded bg-green-800 p-2 text-green-200 hover:bg-green-700"
                  title="Add park"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="rounded border border-zinc-800 p-3">
              <div className="mb-2 text-sm text-sky-400">Drinking fountain</div>
              <div className="flex flex-wrap gap-2">
                <input
                  value={fountainName}
                  onChange={(e) => setFountainName(e.target.value)}
                  placeholder="Name"
                  className={`${input} !w-40`}
                />
                <input
                  value={fountainLat}
                  onChange={(e) => setFountainLat(e.target.value)}
                  placeholder="Lat"
                  className={`${input} !w-28`}
                />
                <input
                  value={fountainLon}
                  onChange={(e) => setFountainLon(e.target.value)}
                  placeholder="Lon"
                  className={`${input} !w-28`}
                />
                <button
                  onClick={() => addTrack("fountain", fountainName, fountainLat, fountainLon)}
                  className="rounded bg-sky-900 p-2 text-sky-200 hover:bg-sky-800"
                  title="Add fountain"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {tracks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded bg-zinc-800/60 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-300">
                    {t.track_type === "park" ? "Park" : "Fountain"}: {t.name}{" "}
                    <span className="text-zinc-600">
                      ({t.lat}, {t.lon})
                    </span>
                  </span>
                  <button
                    onClick={() => removeTrack(t.id)}
                    className="text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {tracks.length === 0 && (
                <p className="text-xs text-zinc-600">
                  No tracks yet - the patrol has nothing to check.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
        >
          <ArrowLeft size={14} /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            data-testid="onboarding-finish"
            onClick={finish}
            className="flex items-center gap-1 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Finish <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
