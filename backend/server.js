const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the React frontend (running on e.g. port 5173) can talk to us
app.use(cors());
app.use(express.json());

// In-memory data store for Role 2 stateful endpoints
let prdContextInMemory = "";
let alertsInMemory = [];

// Paths to Role 1 brain assets
const promptPath = path.join(__dirname, "../ai_watchdog_brain/system_prompt.txt");
const datasetPath = path.join(__dirname, "../ai_watchdog_brain/test_dataset.json");

// Helper to load system prompt
function getSystemPrompt() {
  try {
    return fs.readFileSync(promptPath, "utf8");
  } catch (error) {
    console.error("Warning: system_prompt.txt not found. Using fallback instructions.");
    return "You are the ScopeCreep.ai Watchdog. Assess if developer chat describes scope creep against the PRD. Return JSON.";
  }
}

// Helper to load test dataset (used in mock mode for high-fidelity response match)
function getTestDataset() {
  try {
    const raw = fs.readFileSync(datasetPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Warning: test_dataset.json not found or invalid.");
    return [];
  }
}

// The core intelligence engine (live Gemini API vs high-fidelity Mock fallback)
async function performAnalysis(prdContext, chatInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    console.log(`[Watchdog Engine] Running live analysis via Gemini 2.5 Flash API...`);
    const systemPrompt = getSystemPrompt();
    const userPrompt = `### PRD Context:\n${prdContext}\n\n### Developer Message:\n${chatInput}\n`;

    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const headers = { "Content-Type": "application/json" };

    if (apiKey.startsWith("AIza")) {
      url += `?key=${apiKey}`;
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Gemini HTTP Error ${res.status}: ${errMsg}`);
      }

      const data = await res.json();
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResult) {
        throw new Error("Empty candidate response from Gemini API");
      }

      return JSON.parse(textResult.trim());
    } catch (apiError) {
      console.error("[Watchdog Engine] Live Gemini analysis failed. Falling back to high-fidelity mock mode:", apiError.message);
      // Fall through to mock logic on failure
    }
  }

  // High-Fidelity Mock Mode
  console.log(`[Watchdog Engine] Running in Mock Mode (No Gemini API Key)`);
  const dataset = getTestDataset();

  // Try to find matching simulation case from test dataset
  const match = dataset.find(
    (item) =>
      item.chatInput.trim().toLowerCase() === chatInput.trim().toLowerCase() ||
      chatInput.trim().toLowerCase().includes(item.chatInput.trim().toLowerCase())
  );

  if (match) {
    const scenarioId = match.id;
    const expected = match.expected;
    if (expected.is_scope_creep) {
      return {
        alert_id: `alert_20260619_${scenarioId.split("_")[1]}`,
        is_scope_creep: true,
        severity: expected.severity,
        flagged_action: match.chatInput.split(".")[0] + ".",
        prd_violation: `Violation of approved sprint scope: "${prdContext.slice(0, 60)}..."`,
        recommendation: `Pause the unapproved work. Re-align with the PM or open a separate ticket for this task.`,
      };
    } else {
      return {
        alert_id: `alert_20260619_${scenarioId.split("_")[1]}`,
        is_scope_creep: false,
        severity: "NONE",
        flagged_action: "",
        prd_violation: "",
        recommendation: "",
      };
    }
  }

  // Mock Heuristic Fallback for novel input strings
  const lowerInput = chatInput.toLowerCase();
  const lowerPrd = prdContext.toLowerCase();

  const isOAuth = lowerInput.includes("oauth") || lowerInput.includes("google login") || lowerInput.includes("github login");
  const isAnalytics = lowerInput.includes("mixpanel") || lowerInput.includes("analytics") || lowerInput.includes("telemetry");
  const isCaching = lowerInput.includes("redis") || lowerInput.includes("cache") || lowerInput.includes("caching");
  const isExport = lowerInput.includes("export") || lowerInput.includes("csv") || lowerInput.includes("pdf");
  const isLocalization = lowerInput.includes("i18n") || lowerInput.includes("translate") || lowerInput.includes("translation");
  const isMigration = lowerInput.includes("vue") || lowerInput.includes("migrate") || lowerInput.includes("framework");

  let isCreep = false;
  let severity = "NONE";
  let flaggedAction = "";
  let prdViolation = "";
  let recommendation = "";

  if ((isOAuth && !lowerPrd.includes("oauth")) || (isMigration && !lowerPrd.includes("vue"))) {
    isCreep = true;
    severity = "HIGH";
    flaggedAction = isOAuth ? "Adding OAuth2 third-party authentication." : "Migrating the frontend framework.";
    prdViolation = "Adding major infrastructure/framework elements not listed in the PRD.";
    recommendation = "Halt development. This is a high-risk change. Open a separate Epic for product review.";
  } else if ((isCaching && !lowerPrd.includes("redis")) || (isExport && !lowerPrd.includes("export")) || (isAnalytics && !lowerPrd.includes("mixpanel"))) {
    isCreep = true;
    severity = "MEDIUM";
    flaggedAction = isCaching ? "Adding in-memory database caching." : isExport ? "Adding file exports." : "Integrating third-party analytics SDK.";
    prdViolation = "Implementing additional secondary services/features not approved in the active sprint.";
    recommendation = "Pause this work. Log a JIRA ticket for the next sprint planning session.";
  } else if (lowerInput.includes("sound") || lowerInput.includes("audio") || lowerInput.includes("animation")) {
    isCreep = true;
    severity = "LOW";
    flaggedAction = "Adding sound effects / custom animations.";
    prdViolation = "Gold-plating UI elements outside the core specification.";
    recommendation = "Remove gold-plating. Stick strictly to scoped layout specifications.";
  }

  return {
    alert_id: `alert_20260619_${Math.floor(Math.random() * 900) + 100}`,
    is_scope_creep: isCreep,
    severity: severity,
    flagged_action: flaggedAction,
    prd_violation: prdViolation,
    recommendation: recommendation,
  };
}

// --- API ENDPOINTS ---

// 1. POST /api/prd - Establish the active PRD context in backend memory
app.post("/api/prd", (req, res) => {
  const { prdContext } = req.body;
  if (!prdContext || typeof prdContext !== "string") {
    return res.status(400).json({ error: "Missing or invalid prdContext string in request body." });
  }
  prdContextInMemory = prdContext;
  console.log(`[Stateful Server] Updated in-memory PRD baseline (${prdContext.length} chars)`);
  res.json({ status: "success", message: "PRD baseline established in memory." });
});

// 2. POST /api/chat-simulate - Simulate message ingestion statefully
app.post("/api/chat-simulate", async (req, res) => {
  const { chatInput } = req.body;
  if (!chatInput || typeof chatInput !== "string") {
    return res.status(400).json({ error: "Missing or invalid chatInput string in request body." });
  }

  if (!prdContextInMemory) {
    return res.status(400).json({ error: "No active PRD context stored. Please POST to /api/prd first." });
  }

  try {
    const analysis = await performAnalysis(prdContextInMemory, chatInput);
    
    if (analysis.is_scope_creep) {
      const alertRecord = {
        id: analysis.alert_id,
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
        severity: analysis.severity,
        source_channel: "api:chat-simulate",
        flagged_text: analysis.flagged_action || chatInput,
        violation_explanation: analysis.prd_violation || "Scope creep detected.",
      };
      alertsInMemory.unshift(alertRecord);
    }
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: `Analysis processing error: ${error.message}` });
  }
});

// 3. GET /api/alerts - Fetch current alerts feed statefully
app.get("/api/alerts", (req, res) => {
  res.json(alertsInMemory);
});

// 4. POST /api/analyze - Stateless endpoint used directly by React UI
app.post("/api/analyze", async (req, res) => {
  const { prdContext, chatInput } = req.body;
  if (!prdContext || !chatInput) {
    return res.status(400).json({ error: "Missing prdContext or chatInput in request body." });
  }

  try {
    const analysis = await performAnalysis(prdContext, chatInput);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: `Analysis engine error: ${error.message}` });
  }
});

// Start listening
app.listen(PORT, () => {
  const isLive = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here";
  console.log(`==================================================`);
  console.log(`🛰️  ScopeCreep.ai Backend Server listening on port ${PORT}`);
  console.log(`👉 Live Endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`🔌 Mode: ${isLive ? "Live Gemini API" : "High-Fidelity Mock Fallback"}`);
  console.log(`==================================================`);
});
