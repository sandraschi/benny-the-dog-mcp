import { AlertTriangle, CalendarClock, Phone, Pill, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

interface Profile {
  name: string;
  breed: string;
  age_years: number;
  weight_kg: number;
  vet_name: string;
  vet_phone: string;
  allergies: string;
  medications: string;
  last_checkup: string;
  conditions: string;
}

interface CareEvent {
  id: number;
  event_type: string;
  payload: Record<string, string>;
  created_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  water_refill: "Water refill",
  bark_event: "Bark",
  movement: "Movement",
  sausage_delivery: "Sausage delivery",
  movie_time: "Movie time",
  wake: "Wake call",
};

export default function Vet() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CareEvent[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/dog/profile`)
      .then((r) => r.json())
      .then((j) => setProfile(j.profile))
      .catch(() => setProfile(null));
    fetch(`${API_BASE}/api/dog/events?limit=30`)
      .then((r) => r.json())
      .then((j) => setEvents(j.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  if (!profile) {
    return (
      <div data-testid="vet-page" className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Vet &amp; health</h2>
        <p className="text-zinc-500">
          No dog profile yet. Complete the onboarding wizard to record vet and health data.
        </p>
      </div>
    );
  }

  const info: Array<{ label: string; value: string; icon: typeof Stethoscope }> = [
    { label: "Breed", value: profile.breed || "—", icon: Stethoscope },
    {
      label: "Age",
      value: profile.age_years ? `${profile.age_years} years` : "—",
      icon: Stethoscope,
    },
    {
      label: "Weight",
      value: profile.weight_kg ? `${profile.weight_kg} kg` : "—",
      icon: Stethoscope,
    },
    { label: "Last checkup", value: profile.last_checkup || "—", icon: CalendarClock },
  ];

  return (
    <div data-testid="vet-page" className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Vet &amp; health</h2>

      <section
        className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
        data-testid="vet-contact"
      >
        <h3 className="text-sm font-medium text-zinc-300">Vet contact</h3>
        <div className="mt-2 flex items-center gap-3">
          <Stethoscope size={18} className="text-amber-500" />
          <span className="text-sm text-zinc-200">{profile.vet_name || "No vet recorded"}</span>
          {profile.vet_phone && (
            <a
              href={`tel:${profile.vet_phone}`}
              className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
              data-testid="vet-phone"
            >
              <Phone size={14} /> {profile.vet_phone}
            </a>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {info.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
            data-testid={`vet-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <Icon size={14} />
              <span className="text-xs uppercase tracking-wide">{label}</span>
            </div>
            <div className="mt-1 text-sm font-medium text-zinc-100">{value}</div>
          </div>
        ))}
      </section>

      {(profile.allergies || profile.medications || profile.conditions) && (
        <section className="space-y-3">
          {profile.allergies && (
            <div
              className="flex items-start gap-3 rounded-lg border border-amber-900/50 bg-amber-950/30 p-4"
              data-testid="vet-allergies"
            >
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <div className="text-sm font-medium text-amber-400">Allergies</div>
                <div className="mt-0.5 text-sm text-zinc-300">{profile.allergies}</div>
              </div>
            </div>
          )}
          {profile.medications && (
            <div
              className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              data-testid="vet-medications"
            >
              <Pill size={18} className="mt-0.5 shrink-0 text-sky-400" />
              <div>
                <div className="text-sm font-medium text-zinc-200">Medications</div>
                <div className="mt-0.5 text-sm text-zinc-300">{profile.medications}</div>
              </div>
            </div>
          )}
          {profile.conditions && (
            <div
              className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              data-testid="vet-conditions"
            >
              <Stethoscope size={18} className="mt-0.5 shrink-0 text-zinc-400" />
              <div>
                <div className="text-sm font-medium text-zinc-200">Conditions</div>
                <div className="mt-0.5 text-sm text-zinc-300">{profile.conditions}</div>
              </div>
            </div>
          )}
        </section>
      )}

      <section
        className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
        data-testid="vet-timeline"
      >
        <h3 className="text-sm font-medium text-zinc-300">Recent care events</h3>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No care events recorded yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-200">{EVENT_LABELS[e.event_type] ?? e.event_type}</span>
                <span className="text-xs text-zinc-500">{e.created_at}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
