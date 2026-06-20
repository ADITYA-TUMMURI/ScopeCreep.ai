import { useState, useCallback, useRef, useEffect } from "react";
import mockAlerts from "../data/mockAlerts.json";
import PrdInputHub from "./PrdInputHub";
import DevChatSimulator from "./DevChatSimulator";
import WatchdogAlertsFeed from "./WatchdogAlertsFeed";
import { Server, Key, RefreshCw } from "lucide-react";
import { trackEvent, trackAgent } from "../utils/telemetry";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const SEED_MESSAGES = [
  {
    id: "seed_1",
    author: "system",
    text: "Watchdog channel initialized. Paste developer messages below and click 'Simulate Code Push' to test scope detection.",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function DashboardLayout() {
  const conversationId = useRef(crypto.randomUUID());

  // ── Persistent States loaded from LocalStorage ────────────────
  const [prdText, setPrdText] = useState(() => {
    return localStorage.getItem("scopecreep_prd_text") || "";
  });
  const [isBaselineLocked, setIsBaselineLocked] = useState(() => {
    return localStorage.getItem("scopecreep_baseline_locked") === "true";
  });
  const [chatLogs, setChatLogs] = useState(() => {
    const saved = localStorage.getItem("scopecreep_chat_logs");
    return saved ? JSON.parse(saved) : SEED_MESSAGES;
  });
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem("scopecreep_alerts");
    return saved ? JSON.parse(saved) : mockAlerts.map((a) => ({
      ...a,
      createdAt: a.createdAt || Date.now(),
    }));
  });
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem("scopecreep_custom_api_key") || "";
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ── Sync to LocalStorage ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("scopecreep_prd_text", prdText);
  }, [prdText]);

  useEffect(() => {
    localStorage.setItem("scopecreep_baseline_locked", isBaselineLocked);
  }, [isBaselineLocked]);

  useEffect(() => {
    localStorage.setItem("scopecreep_chat_logs", JSON.stringify(chatLogs));
  }, [chatLogs]);

  useEffect(() => {
    localStorage.setItem("scopecreep_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("scopecreep_custom_api_key", customApiKey);
  }, [customApiKey]);

  // ── Settings Reset Handler ───────────────────────────────────
  const handleResetDashboard = useCallback(() => {
    localStorage.removeItem("scopecreep_prd_text");
    localStorage.removeItem("scopecreep_baseline_locked");
    localStorage.removeItem("scopecreep_chat_logs");
    localStorage.removeItem("scopecreep_alerts");
    setPrdText("");
    setIsBaselineLocked(false);
    setChatLogs(SEED_MESSAGES);
    setAlerts(mockAlerts.map((a) => ({ ...a, createdAt: a.createdAt || Date.now() })));
    trackEvent("Watchdog State Reset", { conversationId: conversationId.current });
  }, []);

  // ── PRD Handlers ─────────────────────────────────────────────
  const handleLockBaseline = useCallback(() => {
    if (!prdText.trim()) return;
    setIsBaselineLocked(true);

    trackEvent("PRD Baseline Established", {
      charCount: prdText.length,
      wordCount: prdText.trim().split(/\s+/).length,
    });

    console.log("[DashboardLayout] PRD baseline locked:", prdText.slice(0, 80) + "…");
  }, [prdText]);

  const handleClearBaseline = useCallback(() => {
    trackEvent("PRD Baseline Cleared", {
      previousCharCount: prdText.length,
      previousWordCount: prdText.trim() ? prdText.trim().split(/\s+/).length : 0,
      hadLockedBaseline: isBaselineLocked,
    });

    setPrdText("");
    setIsBaselineLocked(false);
  }, [prdText, isBaselineLocked]);

  // ── Production API Call ──────────────────────────────────────
  const simulateBackendAnalysis = useCallback(async (developerMessage) => {
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

    // Track user prompt
    trackAgent("prompt", {
      agentId: "CqPhJuhssAZT4VV7gAbJ9_DlUpU",
      conversationId: conversationId.current,
      messageId: devMsg.id,
      content: developerMessage,
    });

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
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-api-key": customApiKey
        },
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
        createdAt: Date.now(),
        severity: data.severity || "HIGH",
        source_channel: data.source_channel || "api:live-analysis",
        flagged_text: data.flagged_action || developerMessage,
        violation_explanation: data.prd_violation || "The backend flagged this action as unauthorized scope expansion.",
      };

      // Unshift to top of feed so newest alert appears first
      setAlerts((prev) => [backendAlert, ...prev]);

      trackEvent("Scope Analysis Completed", {
        is_scope_creep: Boolean(data.is_scope_creep),
        severity: backendAlert.severity,
        alert_id: backendAlert.id,
        prdContextLength: prdText.length,
        chatInputLength: developerMessage.length,
        source_channel: backendAlert.source_channel,
      });

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

      // Track agent response
      trackAgent("agent_response", {
        agentId: "CqPhJuhssAZT4VV7gAbJ9_DlUpU",
        conversationId: conversationId.current,
        messageId: backendAlert.id,
        content: resultMsg.text,
      });

      console.log("[DashboardLayout] Backend analysis complete:", backendAlert.id);

    } catch (error) {
      console.error("[DashboardLayout] API error:", error.message);

      trackEvent("Scope Analysis Failed", {
        error_message: (error.message || "").slice(0, 200),
        prdContextLength: prdText.length,
        chatInputLength: developerMessage.length,
      });

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
  }, [prdText, customApiKey]);

  // ── Alert Action Handlers ────────────────────────────────────
  const handleDismissAlert = useCallback((alertId, severity) => {
    const alert = alerts.find((a) => a.id === alertId) || { id: alertId, severity };

    trackEvent("Alert Dismissed", { 
      severity: alert.severity,
      alertId,
      source_channel: alert?.source_channel,
      flagged_text: (alert?.flagged_text || "").slice(0, 100),
      alert_age_ms: alert?.timestamp
        ? Date.now() - new Date(alert.timestamp).getTime()
        : undefined,
    });

    trackAgent("user_reaction", {
      agentId: "CqPhJuhssAZT4VV7gAbJ9_DlUpU",
      conversationId: conversationId.current,
      messageId: alertId,
      content: "negative",
    });

    setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id));
    console.log("[DashboardLayout] Alert dismissed:", alertId, "severity:", severity);
  }, [alerts]);

  const handleEscalateAlert = useCallback((alertId, severity) => {
    const alert = alerts.find((a) => a.id === alertId) || { id: alertId, severity };
    const timeDiff = Date.now() - (alert.createdAt || Date.now());

    trackEvent("Alert Escalated", { 
      duration_ms: timeDiff,
      alertId,
      severity,
      source_channel: alert?.source_channel,
      flagged_text: (alert?.flagged_text || "").slice(0, 100),
    });

    trackAgent("user_reaction", {
      agentId: "CqPhJuhssAZT4VV7gAbJ9_DlUpU",
      conversationId: conversationId.current,
      messageId: alertId,
      content: "positive",
    });

    setChatLogs((prev) => [
      ...prev,
      {
        id: `escalated_${Date.now()}`,
        author: "system",
        text: `[System Alert Escalated]: Ticket dispatched for mitigation.`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    console.log("[DashboardLayout] Alert escalated to Slack:", alertId, "severity:", severity);
  }, [alerts]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden">
      {/* ── Settings Sub-Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2.5 bg-slate-900 border-b border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-6">
          {/* Active Model */}
          <div className="flex items-center gap-1.5">
            <Server size={12} className="text-slate-500" />
            <span>Active Model:</span>
            <span className="font-semibold text-rose-400 bg-rose-950/30 border border-rose-900/30 px-1.5 py-0.5 rounded">
              Gemini 3.5 Flash
            </span>
          </div>

          {/* Custom API Key Input */}
          <div className="flex items-center gap-2">
            <Key size={12} className="text-slate-500" />
            <span>Custom Gemini API Key:</span>
            <div className="relative flex items-center">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Paste key to bypass daily quota..."
                className="w-48 bg-slate-950 border border-slate-800 focus:border-slate-700/80 text-slate-200 placeholder:text-slate-700 px-2 py-0.5 rounded outline-none transition-all"
              />
              {customApiKey && (
                <span className="absolute right-2 text-emerald-500 font-bold">✓</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-600 tracking-wider uppercase font-medium">
            State: Persistent (LocalStorage)
          </span>
          <button
            onClick={handleResetDashboard}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer font-medium"
          >
            <RefreshCw size={11} className="text-slate-400" />
            Reset Watchdog
          </button>
        </div>
      </div>

      {/* ── Main 3-Column Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:p-6 flex-1 overflow-hidden">
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
    </div>
  );
}
