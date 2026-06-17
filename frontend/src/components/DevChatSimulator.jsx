import { useState, useRef, useEffect } from "react";
import { Terminal, ArrowUp, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "./ActionButton";

/**
 * DevChatSimulator — Developer terminal / chat log simulator (prop-driven).
 *
 * Receives from DashboardLayout:
 *   • chatLogs                     — array of message objects to render
 *   • onSimulateCodePush(message)  — triggers the simulation loop in the parent
 *   • isAnalyzing                  — loading state while "LLM" is processing
 *
 * The input text and send logic remain local — only the actual
 * simulation trigger is delegated upward.
 */
export default function DevChatSimulator({
  chatLogs,
  onSimulateCodePush,
  isAnalyzing,
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLogs]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Delegate to parent simulation loop
    onSimulateCodePush(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full"
    >
      {/* ── Panel Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-slate-700/50">
            <Terminal size={14} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
              Dev Chat Simulator
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Mock developer channel feed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500 bg-amber-950/30 border border-amber-800/40 rounded-full">
              <Loader2 size={10} className="animate-spin" />
              Analyzing
            </span>
          )}
          <span className="text-[11px] tabular-nums text-slate-600">
            {chatLogs.length - 1} messages
          </span>
        </div>
      </div>

      {/* ── Scrollable Message History ────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
      >
        <AnimatePresence>
          {chatLogs.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${
                msg.author === "developer" ? "" : "opacity-70"
              }`}
            >
              {/* Avatar */}
              <div
                className={`
                  flex items-center justify-center w-6 h-6 rounded-md shrink-0 mt-0.5
                  ${msg.author === "developer"
                    ? "bg-sky-950/50 border border-sky-800/40"
                    : msg.author === "watchdog"
                    ? "bg-rose-950/40 border border-rose-800/30"
                    : "bg-slate-800 border border-slate-700/50"
                  }
                `}
              >
                {msg.author === "developer" ? (
                  <User size={12} className="text-sky-400" />
                ) : msg.author === "watchdog" ? (
                  <Bot size={12} className="text-rose-400" />
                ) : (
                  <Terminal size={12} className="text-slate-500" />
                )}
              </div>

              {/* Bubble */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[11px] font-semibold tracking-wide uppercase ${
                      msg.author === "developer"
                        ? "text-sky-400"
                        : msg.author === "watchdog"
                        ? "text-rose-400"
                        : "text-slate-500"
                    }`}
                  >
                    {msg.author === "developer"
                      ? "dev_user"
                      : msg.author === "watchdog"
                      ? "watchdog"
                      : "system"}
                  </span>
                  <span className="text-[10px] text-slate-700 tabular-nums">
                    {msg.time}
                  </span>
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Input Bar ─────────────────────────────────────────── */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-slate-800/50 bg-slate-950/60">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isAnalyzing}
          placeholder="Type a mock developer message or commit log…"
          className="
            flex-1 resize-none
            bg-slate-800/50 border border-slate-700/50 rounded-lg
            px-3 py-2 text-sm text-slate-300
            placeholder:text-slate-600
            outline-none
            focus:border-slate-600
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
        <ActionButton
          variant="primary"
          icon={ArrowUp}
          onClick={handleSend}
          disabled={!input.trim() || isAnalyzing}
          className="!px-3 !py-2 shrink-0"
        >
          Simulate Code Push
        </ActionButton>
      </div>
    </motion.div>
  );
}
