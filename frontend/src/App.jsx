import { Radar } from "lucide-react";
import DashboardLayout from "./components/DashboardLayout";

/**
 * App — Root application shell for ScopeCreep.ai.
 *
 * Renders:
 *   1. Sticky top navigation bar with branding and status beacon
 *   2. DashboardLayout — the 3-column interface engine (PRD, Chat, Alerts)
 *
 * The bg-slate-950 global background is enforced in index.css.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      {/* ── Top Navigation Bar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600/15 border border-rose-800/40">
            <Radar size={18} className="text-rose-500" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-100">
            ScopeCreep<span className="text-rose-500">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500 border border-slate-800 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Watchdog Active
          </span>
          <span className="hidden md:inline text-[11px] text-slate-700 tabular-nums">
            Sprint 14 &middot; {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </nav>

      {/* ── 3-Column Dashboard Engine ──────────────────────────── */}
      <DashboardLayout />
    </div>
  );
}
