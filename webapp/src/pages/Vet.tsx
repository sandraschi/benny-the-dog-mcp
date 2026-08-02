import {
  AlertTriangle,
  CalendarClock,
  Phone,
  Pill,
  Plus,
  Shield,
  Stethoscope,
  Syringe,
  Trash2,
} from "lucide-react";
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

interface Vaccination {
  id: number;
  name: string;
  administered_date: string;
  next_due_date: string;
  notes: string;
}

interface VetVisit {
  id: number;
  visit_date: string;
  reason: string;
  findings: string;
  cost_cents: number;
}

const EVENT_LABELS: Record<string, string> = {
  water_refill: "Water refill",
  bark_event: "Bark",
  movement: "Movement",
  sausage_delivery: "Sausage delivery",
  movie_time: "Movie time",
  wake: "Wake call",
};

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function dueBadge(dateStr: string) {
  const days = daysUntil(dateStr);
  if (days === null) return { label: "No due date", cls: "text-zinc-500" };
  if (days < 0) return { label: `Overdue ${-days}d`, cls: "text-red-400" };
  if (days <= 30) return { label: `Due in ${days}d`, cls: "text-amber-400" };
  return { label: `Due ${days}d`, cls: "text-zinc-400" };
}

const input =
  "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500";

export default function Vet() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [visits, setVisits] = useState<VetVisit[]>([]);

  // vaccination form state
  const [vaccName, setVaccName] = useState("");
  const [vaccDate, setVaccDate] = useState("");
  const [vaccDue, setVaccDue] = useState("");
  const [vaccNotes, setVaccNotes] = useState("");

  // visit form state
  const [visitDate, setVisitDate] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [visitFindings, setVisitFindings] = useState("");
  const [visitCost, setVisitCost] = useState("");

  const loadVaccinations = () => {
    fetch(`${API_BASE}/api/dog/vaccinations`)
      .then((r) => r.json())
      .then((j) => setVaccinations(j.vaccinations ?? []))
      .catch(() => setVaccinations([]));
  };

  const loadVisits = () => {
    fetch(`${API_BASE}/api/dog/vet-visits`)
      .then((r) => r.json())
      .then((j) => setVisits(j.visits ?? []))
      .catch(() => setVisits([]));
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/dog/profile`)
      .then((r) => r.json())
      .then((j) => setProfile(j.profile))
      .catch(() => setProfile(null));
    fetch(`${API_BASE}/api/dog/events?limit=30`)
      .then((r) => r.json())
      .then((j) => setEvents(j.events ?? []))
      .catch(() => setEvents([]));
    loadVaccinations();
    loadVisits();
  }, []);

  const addVaccination = async () => {
    if (!vaccName.trim() || !vaccDate) return;
    await fetch(`${API_BASE}/api/dog/vaccinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: vaccName.trim(),
        administered_date: vaccDate,
        next_due_date: vaccDue,
        notes: vaccNotes.trim(),
      }),
    });
    setVaccName("");
    setVaccDate("");
    setVaccDue("");
    setVaccNotes("");
    loadVaccinations();
  };

  const removeVaccination = async (id: number) => {
    await fetch(`${API_BASE}/api/dog/vaccinations/${id}`, { method: "DELETE" });
    loadVaccinations();
  };

  const addVisit = async () => {
    if (!visitDate || !visitReason.trim()) return;
    await fetch(`${API_BASE}/api/dog/vet-visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visit_date: visitDate,
        reason: visitReason.trim(),
        findings: visitFindings.trim(),
        cost_cents: Number.parseInt(visitCost, 10) || 0,
      }),
    });
    setVisitDate("");
    setVisitReason("");
    setVisitFindings("");
    setVisitCost("");
    loadVisits();
  };

  const removeVisit = async (id: number) => {
    await fetch(`${API_BASE}/api/dog/vet-visits/${id}`, { method: "DELETE" });
    loadVisits();
  };

  const info: Array<{ label: string; value: string; icon: typeof Stethoscope }> = [
    { label: "Breed", value: profile?.breed || "—", icon: Stethoscope },
    {
      label: "Age",
      value: profile?.age_years ? `${profile.age_years} years` : "—",
      icon: Stethoscope,
    },
    {
      label: "Weight",
      value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—",
      icon: Stethoscope,
    },
    { label: "Last checkup", value: profile?.last_checkup || "—", icon: CalendarClock },
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
          <span className="text-sm text-zinc-200">
            {profile?.vet_name || "No vet recorded (onboarding)"}
          </span>
          {profile?.vet_phone && (
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

      {(profile?.allergies || profile?.medications || profile?.conditions) && (
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
        data-testid="vet-vaccinations"
      >
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Syringe size={16} className="text-amber-500" /> Vaccination schedule
        </h3>
        {vaccinations.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No vaccinations recorded yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {vaccinations.map((v) => {
              const due = dueBadge(v.next_due_date);
              return (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded bg-zinc-800/60 px-3 py-2"
                  data-testid={`vaccination-${v.id}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm text-zinc-100">
                      <Shield size={13} className="shrink-0 text-emerald-400" />
                      {v.name}
                      {v.next_due_date && <span className={`text-xs ${due.cls}`}>{due.label}</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      Administered {v.administered_date}
                      {v.next_due_date ? ` · next due ${v.next_due_date}` : ""}
                      {v.notes ? ` · ${v.notes}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => removeVaccination(v.id)}
                    className="shrink-0 text-zinc-600 hover:text-red-400"
                    title="Remove vaccination"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input
            data-testid="vaccination-name"
            value={vaccName}
            onChange={(e) => setVaccName(e.target.value)}
            placeholder="Vaccine (e.g. Rabies)"
            className={input}
          />
          <input
            data-testid="vaccination-date"
            type="date"
            value={vaccDate}
            onChange={(e) => setVaccDate(e.target.value)}
            className={input}
          />
          <input
            data-testid="vaccination-due"
            type="date"
            value={vaccDue}
            onChange={(e) => setVaccDue(e.target.value)}
            placeholder="Next due"
            className={input}
          />
          <div className="flex gap-2">
            <input
              data-testid="vaccination-notes"
              value={vaccNotes}
              onChange={(e) => setVaccNotes(e.target.value)}
              placeholder="Notes"
              className={input}
            />
            <button
              data-testid="vaccination-add"
              onClick={addVaccination}
              disabled={!vaccName.trim() || !vaccDate}
              className="shrink-0 rounded bg-amber-500 px-3 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
              title="Add vaccination"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </section>

      <section
        className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
        data-testid="vet-visits"
      >
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Stethoscope size={16} className="text-amber-500" /> Vet visit log
        </h3>
        {visits.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No vet visits recorded yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {visits.map((v) => (
              <li
                key={v.id}
                className="rounded bg-zinc-800/60 px-3 py-2"
                data-testid={`vet-visit-${v.id}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-100">{v.reason}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">{v.visit_date}</span>
                    <button
                      onClick={() => removeVisit(v.id)}
                      className="text-zinc-600 hover:text-red-400"
                      title="Remove visit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {v.findings && <div className="mt-1 text-xs text-zinc-400">{v.findings}</div>}
                {v.cost_cents > 0 && (
                  <div className="mt-1 text-xs text-zinc-500">
                    Cost: {(v.cost_cents / 100).toFixed(2)} EUR
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input
            data-testid="visit-date"
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className={input}
          />
          <input
            data-testid="visit-reason"
            value={visitReason}
            onChange={(e) => setVisitReason(e.target.value)}
            placeholder="Reason (e.g. annual checkup)"
            className={input}
          />
          <input
            data-testid="visit-findings"
            value={visitFindings}
            onChange={(e) => setVisitFindings(e.target.value)}
            placeholder="Findings"
            className={input}
          />
          <div className="flex gap-2">
            <input
              data-testid="visit-cost"
              value={visitCost}
              onChange={(e) => setVisitCost(e.target.value)}
              placeholder="Cost EUR"
              className={input}
            />
            <button
              data-testid="visit-add"
              onClick={addVisit}
              disabled={!visitDate || !visitReason.trim()}
              className="shrink-0 rounded bg-amber-500 px-3 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
              title="Add visit"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </section>

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
