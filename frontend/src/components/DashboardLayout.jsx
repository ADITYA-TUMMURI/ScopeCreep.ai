import { useState, useCallback } from "react";
import mockAlerts from "../data/mockAlerts.json";
import PrdInputHub from "./PrdInputHub";
import DevChatSimulator from "./DevChatSimulator";
import WatchdogAlertsFeed from "./WatchdogAlertsFeed";

/**
 * DashboardLayout — Master 3-column grid wrapper with lifted state.
 *
 * Owns the application-level state for all three panels:
 *   • prdText / isBaselineLocked — PRD baseline document
 *   • chatLogs                   — developer chat message history
 *   • alerts                     — scope creep alert feed
 *   • isAnalyzing                — loading state during simulated LLM call
 *
 * The simulateBackendAnalysis function fakes a 1500ms LLM network
 * round-trip: it appends the developer message to the chat log,
 * shows a "processing" watchdog acknowledgement, then generates a
 * dynamic HIGH-severity alert and unshifts it to the top of the feed.
 *
 * Grid columns:
 *   1. PRD Input Hub         — scope baseline entry
 *   2. Dev Chat Simulator    — mock developer communication feed
 *   3. Watchdog Alerts Feed  — real-time creep alert stream
 */

const SEED_MESSAGES = [
  {
    id: "seed_1",
    author: "system",
    text: "Watchdog channel initialized. Paste developer messages below and click 'Simulate Code Push' to test scope detection.",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function DashboardLayout() {
  // ── Lifted State ─────────────────────────────────────────────
  const [prdText, setPrdText] = useState("");
  const [isBaselineLocked, setIsBaselineLocked] = useState(false);
  const [chatLogs, setChatLogs] = useState(SEED_MESSAGES);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ── PRD Handlers ─────────────────────────────────────────────
  const handleLockBaseline = useCallback(() => {
    if (!prdText.trim()) return;
    setIsBaselineLocked(true);
    console.log("[DashboardLayout] PRD baseline locked:", prdText.slice(0, 80) + "…");
  }, [prdText]);

  const handleClearBaseline = useCallback(() => {
    setPrdText("");
    setIsBaselineLocked(false);
  }, []);

  // ── The Simulation Loop (Mock Backend) ───────────────────────
  const simulateBackendAnalysis = useCallback((developerMessage) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // 1. Append the developer message to chat logs
    const devMsg = {
      id: `msg_${Date.now()}`,
      author: "developer",
      text: developerMessage,
      time: timeStr,
    };
    setChatLogs((prev) => [...prev, devMsg]);

    // 2. Show watchdog "processing" acknowledgement after 400ms
    setIsAnalyzing(true);
    setTimeout(() => {
      const ackMsg = {
        id: `ack_${Date.now()}`,
        author: "watchdog",
        text: "Message ingested. Running delta-evaluation against PRD baseline…",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatLogs((prev) => [...prev, ackMsg]);
    }, 400);

    // 3. After 1500ms — simulate LLM response, generate a dynamic alert
    setTimeout(() => {
      const alertTimestamp = new Date().toISOString();
      const dynamicAlert = {
        id: `alert_${Date.now()}`,
        timestamp: alertTimestamp,
        severity: "HIGH",
        source_channel: "sim:live-input",
        flagged_text: developerMessage,
        violation_explanation:
          isBaselineLocked && prdText.trim()
            ? `The active PRD baseline does not authorize this work. Flagged developer action falls outside the locked scope: "${prdText.slice(0, 100)}…"`
            : "No PRD baseline has been established. All developer actions are flagged as potentially unauthorized scope expansion by default.",
      };

      // Unshift to top of feed so newest alert appears first
      setAlerts((prev) => [dynamicAlert, ...prev]);
      setIsAnalyzing(false);

      // Watchdog confirmation in chat
      const resultMsg = {
        id: `result_${Date.now()}`,
        author: "watchdog",
        text: `⚠ SCOPE CREEP DETECTED — Severity: HIGH. Alert generated and pushed to the PM feed.`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatLogs((prev) => [...prev, resultMsg]);

      console.log("[DashboardLayout] Dynamic alert generated:", dynamicAlert.id);
    }, 1500);
  }, [prdText, isBaselineLocked]);

  // ── Alert Action Handlers ────────────────────────────────────
  const handleDismissAlert = useCallback((alertId, severity) => {
    // ROLE 4: INJECT NOVUS.AI TELEMETRY TRACKING HERE
    // e.g., novus.track('Alert Dismissed', { severity })
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    console.log("[DashboardLayout] Alert dismissed:", alertId, "severity:", severity);
  }, []);

  const handleEscalateAlert = useCallback((alertId, severity) => {
    // ROLE 4: INJECT NOVUS.AI TELEMETRY TRACKING HERE
    // e.g., novus.track('Alert Escalated', { duration_ms: timeDiff })
    console.log("[DashboardLayout] Alert escalated to Slack:", alertId, "severity:", severity);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:p-6 h-[calc(100vh-65px)] overflow-hidden">
      <PrdInputHub
        prdText={prdText}
        setPrdText={setPrdText}
        isLocked={isBaselineLocked}
        onLockBaseline={handleLockBaseline}
        onClear={handleClearBaseline}
      />
      <DevChatSimulator
        chatLogs={chatLogs}
        onSimulateCodePush={simulateBackendAnalysis}
        isAnalyzing={isAnalyzing}
      />
      <WatchdogAlertsFeed
        alerts={alerts}
        onDismiss={handleDismissAlert}
        onEscalate={handleEscalateAlert}
      />
    </div>
  );
}
