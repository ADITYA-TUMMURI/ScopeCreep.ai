/**
 * StatusBadge — Severity indicator pill.
 *
 * Renders a compact badge with color-coded styling:
 *   HIGH   → rose-500 text, rose-950/30 bg, rose-800/50 border
 *   MEDIUM → amber-500 text, amber-950/30 bg, amber-800/50 border
 *   LOW    → slate-400 text, slate-800/40 bg, slate-700/50 border
 */

const severityStyles = {
  HIGH: "text-rose-500 bg-rose-950/30 border-rose-800/50",
  MEDIUM: "text-amber-500 bg-amber-950/30 border-amber-800/50",
  LOW: "text-slate-400 bg-slate-800/40 border-slate-700/50",
};

export default function StatusBadge({ severity = "LOW" }) {
  const key = severity.toUpperCase();
  const classes = severityStyles[key] || severityStyles.LOW;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-[11px] font-semibold uppercase tracking-widest
        border rounded-full select-none
        transition-colors duration-200
        ${classes}
      `}
    >
      <span
        className={`
          inline-block w-1.5 h-1.5 rounded-full
          ${key === "HIGH" ? "bg-rose-500 animate-pulse" : ""}
          ${key === "MEDIUM" ? "bg-amber-500" : ""}
          ${key === "LOW" ? "bg-slate-500" : ""}
        `}
      />
      {key}
    </span>
  );
}
