import { Radar, ShieldAlert, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "./components/StatusBadge";
import ActionButton from "./components/ActionButton";
import mockAlerts from "./data/mockAlerts.json";

/**
 * App — Root layout wrapper for ScopeCreep.ai.
 *
 * Part 1 renders:
 *   • Top navigation bar with branding
 *   • A preview grid of mock alert cards demonstrating the
 *     StatusBadge and ActionButton primitives
 *
 * The bg-slate-950 global background is enforced in index.css.
 * This component adds the app-level chrome only.
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

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500 border border-slate-800 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Watchdog Active
          </span>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Section Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Creep Alert Feed
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mockAlerts.length} scope deviations detected this sprint
          </p>
        </div>

        {/* Alert Card Grid */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {mockAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35, ease: "easeOut" }}
                className="group relative rounded-xl border border-slate-800/70 bg-slate-900/50 p-5 hover:border-slate-700/80 transition-colors duration-300"
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge severity={alert.severity} />
                    <span className="text-xs font-mono text-slate-600">
                      {alert.source_channel}
                    </span>
                  </div>
                  <time className="text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                {/* Flagged Text */}
                <blockquote className="pl-3 border-l-2 border-slate-700 mb-3">
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{alert.flagged_text}"
                  </p>
                </blockquote>

                {/* Violation Explanation */}
                <div className="flex items-start gap-2 mb-4">
                  <ShieldAlert
                    size={14}
                    className="text-rose-500/70 mt-0.5 shrink-0"
                  />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {alert.violation_explanation}
                  </p>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/50">
                  <ActionButton
                    variant="secondary"
                    icon={X}
                    onClick={() =>
                      console.log("Dismissed:", alert.id)
                    }
                  >
                    Dismiss
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    icon={Send}
                    onClick={() =>
                      console.log("Escalated:", alert.id)
                    }
                  >
                    Escalate to Slack
                  </ActionButton>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-16 py-6 border-t border-slate-800/40 text-center">
        <p className="text-xs text-slate-600">
          ScopeCreep.ai &mdash; Mind the Product &quot;Everyone Ships Now&quot;
          Hackathon &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
