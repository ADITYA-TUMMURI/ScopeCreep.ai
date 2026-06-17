import { useState } from "react";
import { ShieldAlert, X, Send, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "./StatusBadge";
import ActionButton from "./ActionButton";
import mockAlerts from "../data/mockAlerts.json";

/**
 * WatchdogAlertsFeed — Live scope creep alert feed.
 *
 * Renders alert cards from mockAlerts.json, with conditional
 * HIGH-severity styling (rose border glow + tinted background).
 * Each card exposes Dismiss and Escalate action buttons.
 */
export default function WatchdogAlertsFeed() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleDismiss = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    console.log("[WatchdogAlertsFeed] Alert dismissed:", alertId);
  };

  const handleEscalate = (alertId) => {
    console.log("[WatchdogAlertsFeed] Alert escalated to Slack:", alertId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full"
    >
      {/* ── Panel Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-rose-950/40 border border-rose-800/30">
            <Bell size={14} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
              Watchdog Alerts
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {alerts.length} active {alerts.length === 1 ? "deviation" : "deviations"}
            </p>
          </div>
        </div>

        {alerts.some((a) => a.severity === "HIGH") && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-500 bg-rose-950/30 border border-rose-800/40 rounded-full animate-pulse">
            Critical
          </span>
        )}
      </div>

      {/* ── Alert Card List ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            const isHigh = alert.severity === "HIGH";

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`
                  rounded-lg p-4 border transition-colors duration-300
                  ${isHigh
                    ? "border-rose-800/50 bg-rose-950/20 hover:border-rose-700/60"
                    : "border-slate-800/60 bg-slate-800/20 hover:border-slate-700/60"
                  }
                `}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge severity={alert.severity} />
                    <span className="text-[11px] font-mono text-slate-600 truncate">
                      {alert.source_channel}
                    </span>
                  </div>
                  <time className="text-[10px] text-slate-700 tabular-nums whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                {/* Flagged Text */}
                <blockquote
                  className={`
                    pl-3 mb-2.5 border-l-2
                    ${isHigh ? "border-rose-700/60" : "border-slate-700/50"}
                  `}
                >
                  <p className="text-[13px] text-slate-300 leading-relaxed italic">
                    &ldquo;{alert.flagged_text}&rdquo;
                  </p>
                </blockquote>

                {/* Violation Explanation */}
                <div className="flex items-start gap-2 mb-3">
                  <ShieldAlert
                    size={12}
                    className={`mt-0.5 shrink-0 ${
                      isHigh ? "text-rose-500/80" : "text-slate-600"
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {alert.violation_explanation}
                  </p>
                </div>

                {/* Action Tray */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-800/40">
                  <ActionButton
                    variant="secondary"
                    icon={X}
                    onClick={() => handleDismiss(alert.id)}
                    className="!px-2.5 !py-1 !text-[11px]"
                  >
                    Dismiss
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    icon={Send}
                    onClick={() => handleEscalate(alert.id)}
                    className="!px-2.5 !py-1 !text-[11px]"
                  >
                    Escalate
                  </ActionButton>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <ShieldAlert size={28} className="text-slate-700 mb-3" />
            <p className="text-sm text-slate-600 font-medium">
              All clear — no scope deviations
            </p>
            <p className="text-[11px] text-slate-700 mt-1">
              The watchdog is monitoring your sprint
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
