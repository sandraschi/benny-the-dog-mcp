import {
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Settings as SettingsIcon,
  ShoppingCart,
  Store,
  Terminal,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { fetchHealth } from "./lib/api";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/skills", label: "Skills", icon: BookOpen },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/members", label: "Members", icon: Users },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/jobs", label: "Jobs", icon: CalendarClock },
  { to: "/logs", label: "Logs", icon: Terminal },
  { to: "/api-docs", label: "API Docs", icon: Code2 },
  { to: "/onboarding", label: "Onboarding", icon: Rocket },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
  { to: "/help", label: "Help", icon: HelpCircle },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    let delay = 1000;
    const MAX_DELAY = 16000;
    const poll = async () => {
      try {
        await fetchHealth();
        if (!cancelled) setBackendOk(true);
        delay = 1000;
      } catch {
        if (!cancelled) setBackendOk(false);
        delay = Math.min(delay * 2, MAX_DELAY);
      }
      if (!cancelled) timer = setTimeout(poll, delay);
    };
    let timer: ReturnType<typeof setTimeout>;
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100" data-testid="app-layout">
      <aside
        className={`flex flex-col border-r border-zinc-800 bg-zinc-900 transition-all ${
          collapsed ? "w-16" : "w-56"
        }`}
        data-testid="sidebar"
      >
        <div className="flex items-center justify-between p-3">
          {!collapsed && (
            <span className="font-bold text-amber-500" data-testid="app-logo">
              benny-the-dog-mcp
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 text-zinc-400 hover:text-white"
            aria-label="Toggle sidebar"
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2" data-testid="sidebar-nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              data-testid={`nav-${label.toLowerCase()}`}
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              title={label}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 backdrop-blur">
          <h1 className="text-sm font-medium text-zinc-200">benny-the-dog-mcp</h1>
          <div className="flex items-center gap-2">
            <span
              data-testid="backend-dot"
              className={`h-2 w-2 rounded-full ${
                backendOk === null ? "bg-zinc-500" : backendOk ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            />
            <span className="text-xs text-zinc-400">
              {backendOk === null ? "Connecting..." : backendOk ? "Connected" : "Offline"}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
