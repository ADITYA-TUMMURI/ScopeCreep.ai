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
 *   • isAnalyzing                — loading state during backend LLM call
 *
 * The simulateBackendAnalysis function sends the PRD context and
 * developer message to the backend API at POST /api/analyze.
 * It validates that a PRD baseline exists before dispatching,
 * handles network/parse errors gracefully, and updates all
 * relevant state from the structured JSON response.
 *
 * Grid columns:
 *   1. PRD Input Hub         — scope baseline entry
 *   2. Dev Chat Simulator    — mock developer communication feed
 *   3. Watchdog Alerts Feed  — real-time creep alert stream
 */

const API_BASE = "http://localhost:3000";

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

    if (typeof pendo !== "undefined") {
      pendo.track("PRD Baseline Established", {
        charCount: prdText.length,
        wordCount: prdText.trim().split(/\s+/).length,
      });
    }

    console.log("[DashboardLayout] PRD baseline locked:", prdText.slice(0, 80) + "…");
  }, [prdText]);

  const handleClearBaseline = useCallback(() => {
    if (typeof pendo !== "undefined") {
      pendo.track("PRD Baseline Cleared", {
        previousCharCount: prdText.length,
        previousWordCount: prdText.trim() ? prdText.trim().split(/\s+/).length : 0,
        hadLockedBaseline: isBaselineLocked,
      });
    }

    setPrdText("");
    setIsBaselineLocked(false);
  }, [prdText, isBaselineLocked]);

  // ── Production API Call ──────────────────────────────────────
  const simulateBackendAnalysis = useCallback(async (developerMessage) => {
    // ── Guard: require PRD baseline before analysis ────────────
    if (!prdText.trim()) {
      alert("Please establish a PRD Baseline first!");
      return;
    }

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // 1. Append the developer message to chat logs immediately
    const devMsg = {
      id: `msg_${Date.now()}`,
      author: "developer",
      text: developerMessage,
      time: timeStr,
    };
    setChatLogs((prev) => [...prev, devMsg]);

    // 2. Show watchdog "processing" acknowledgement
    setIsAnalyzing(true);
    const ackMsg = {
      id: `ack_${Date.now()}`,
      author: "watchdog",
      text: "Message ingested. Running delta-evaluation against PRD baseline…",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatLogs((prev) => [...prev, ackMsg]);

    // 3. Call the backend API
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prdContext: prdText,
          chatInput: developerMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 4. Build the alert from the backend response
      const backendAlert = {
        id: data.alert_id || `alert_${Date.now()}`,
        timestamp: data.timestamp || new Date().toISOString(),
        severity: data.severity || "HIGH",
        source_channel: data.source_channel || "api:live-analysis",
        flagged_text: data.flagged_action || developerMessage,
        violation_explanation: data.prd_violation || "The backend flagged this action as unauthorized scope expansion.",
      };

      // Unshift to top of feed so newest alert appears first
      setAlerts((prev) => [backendAlert, ...prev]);

      if (typeof pendo !== "undefined") {
        pendo.track("Scope Analysis Completed", {
          is_scope_creep: Boolean(data.is_scope_creep),
          severity: backendAlert.severity,
          alert_id: backendAlert.id,
          prdContextLength: prdText.length,
          chatInputLength: developerMessage.length,
          source_channel: backendAlert.source_channel,
        });
      }

      // 5. Watchdog confirmation in chat
      const severityLabel = backendAlert.severity;
      const resultMsg = {
        id: `result_${Date.now()}`,
        author: "watchdog",
        text: data.is_scope_creep
          ? `⚠ SCOPE CREEP DETECTED — Severity: ${severityLabel}. ${data.recommendation || "Alert generated and pushed to the PM feed."}`
          : `✓ CLEAR — No scope deviation detected. The developer action appears to be within the approved PRD baseline.`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatLogs((prev) => [...prev, resultMsg]);

      console.log("[DashboardLayout] Backend analysis complete:", backendAlert.id);

    } catch (error) {
      // ── Graceful error handling ──────────────────────────────
      console.error("[DashboardLayout] API error:", error.message);

      if (typeof pendo !== "undefined") {
        pendo.track("Scope Analysis Failed", {
          error_message: (error.message || "").slice(0, 200),
          prdContextLength: prdText.length,
          chatInputLength: developerMessage.length,
        });
      }

      const errorMsg = {
        id: `err_${Date.now()}`,
        author: "system",
        text: `⚠ Connection failed: ${error.message}. The backend server at ${API_BASE} may not be running. Please start the backend or check your network.`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatLogs((prev) => [...prev, errorMsg]);

    } finally {
      setIsAnalyzing(false);
    }
  }, [prdText]);

  // ── Alert Action Handlers ────────────────────────────────────
  const handleDismissAlert = useCallback((alertId, severity) => {
    const alert = alerts.find((a) => a.id === alertId);

    if (typeof pendo !== "undefined") {
      pendo.track("Alert Dismissed", {
        alertId,
        severity,
        source_channel: alert?.source_channel,
        flagged_text: (alert?.flagged_text || "").slice(0, 100),
        alert_age_ms: alert?.timestamp
          ? Date.now() - new Date(alert.timestamp).getTime()
          : undefined,
      });
    }

    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    console.log("[DashboardLayout] Alert dismissed:", alertId, "severity:", severity);
  }, [alerts]);

  const handleEscalateAlert = useCallback((alertId, severity) => {
    const alert = alerts.find((a) => a.id === alertId);

    if (typeof pendo !== "undefined") {
      pendo.track("Alert Escalated", {
        alertId,
        severity,
        source_channel: alert?.source_channel,
        flagged_text: (alert?.flagged_text || "").slice(0, 100),
        duration_ms: alert?.timestamp
          ? Date.now() - new Date(alert.timestamp).getTime()
          : undefined,
      });
    }

    console.log("[DashboardLayout] Alert escalated to Slack:", alertId, "severity:", severity);
  }, [alerts]);

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
