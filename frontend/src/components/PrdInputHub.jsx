import { FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import ActionButton from "./ActionButton";

/**
 * PrdInputHub — PRD Baseline Context panel (prop-driven).
 *
 * All state is owned by DashboardLayout. This component receives:
 *   • prdText / setPrdText   — controlled textarea value
 *   • isLocked               — whether the baseline has been established
 *   • onLockBaseline()       — called when PM clicks "Establish Scope Baseline"
 *   • onClear()              — called when PM clicks "Clear"
 */
export default function PrdInputHub({
  prdText,
  setPrdText,
  isLocked,
  onLockBaseline,
  onClear,
}) {
  const charCount = prdText.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full"
    >
      {/* ── Panel Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-slate-700/50">
            <FileText size={14} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
              PRD Baseline Context
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Paste the approved scope document
            </p>
          </div>
        </div>

        {isLocked && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-500 bg-emerald-950/30 border border-emerald-800/40 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Locked
          </span>
        )}
      </div>

      {/* ── Text Area ─────────────────────────────────────────── */}
      <div className="flex-1 p-5">
        <textarea
          value={prdText}
          onChange={(e) => setPrdText(e.target.value)}
          disabled={isLocked}
          placeholder="The settings page will allow users to update their email address and password. No other user preferences or UI toggles will be available in Sprint 14…"
          className={`
            w-full h-full min-h-[180px] resize-none
            bg-transparent text-sm text-slate-300 leading-relaxed
            placeholder:text-slate-700 placeholder:leading-relaxed
            border-none outline-none
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        />
      </div>

      {/* ── Footer Actions ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800/50 bg-slate-950/40">
        <span className="text-[11px] tabular-nums text-slate-600">
          {charCount.toLocaleString()} chars
        </span>

        <div className="flex items-center gap-2">
          {(prdText || isLocked) && (
            <ActionButton
              variant="secondary"
              icon={Trash2}
              onClick={onClear}
              className="!px-3 !py-1.5 !text-xs"
            >
              Clear
            </ActionButton>
          )}
          <ActionButton
            variant="primary"
            icon={FileText}
            onClick={onLockBaseline}
            disabled={!prdText.trim() || isLocked}
            className="!px-3 !py-1.5 !text-xs"
          >
            Establish Scope Baseline
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
}
