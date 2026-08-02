import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const ONBOARDED_KEY = "benny-the-dog-mcp-onboarded";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [done, setDone] = useState(() => localStorage.getItem(ONBOARDED_KEY) === "1");

  const finish = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    localStorage.setItem("benny-the-dog-mcp-member", name);
    setDone(true);
  };

  if (done) {
    return (
      <div data-testid="onboarding-page" className="max-w-xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Onboarding</h2>
        <div className="flex items-center gap-2 rounded-lg border border-green-800 bg-green-950/40 p-4 text-green-400">
          <CheckCircle2 size={18} /> All set, {name || "friend"}. Welcome aboard!
        </div>
      </div>
    );
  }

  return (
    <div data-testid="onboarding-page" className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold text-white">Welcome to benny-the-dog-mcp</h2>
      {step === 0 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-300">Step 1 of 3 - Tell us who you are.</p>
          <input
            data-testid="onboarding-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
          />
          <button
            onClick={() => setStep(1)}
            disabled={!name.trim()}
            className="flex items-center gap-1 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-300">
            Step 2 of 3 - The app lives at http://127.0.0.1:11143 (frontend) and
            http://127.0.0.1:11142 (API + Swagger).
          </p>
          <button
            onClick={() => setStep(2)}
            className="rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-300">
            Step 3 of 3 - Start Ollama for the AI chat, or browse Tools, Jobs, Members and the Shop.
          </p>
          <button
            data-testid="onboarding-finish"
            onClick={finish}
            className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Finish
          </button>
        </div>
      )}
    </div>
  );
}