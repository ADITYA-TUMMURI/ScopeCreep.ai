# 🛰️ ScopeCreep.ai

**Your AI sprint watchdog — catching silent scope creep before it torches your release.**
**Passive. Intelligent. Real-time. Built for the PMs who ship on time.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/ADITYA-TUMMURI/ScopeCreep.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Hackathon](https://img.shields.io/badge/Hackathon-Mind%20the%20Product%20%22Everyone%20Ships%20Now%22-blueviolet?style=flat-square)](https://www.mindtheproduct.com/)
[![Telemetry](https://img.shields.io/badge/Telemetry-Novus.ai-0099ff?style=flat-square)](https://novus.ai)

---

## 🔥 The Problem Space

> **"Silent scope creep is the #1 invisible sprint killer — and no PM catches it until it's already too late."**

In every active software team, well-intentioned developers routinely do this:

- They fix a layout bug *and* spontaneously add a custom dark-mode toggle.
- They refactor a settings component *and* quietly introduce a new user preference flow.
- They push a commit *and* expand a feature boundary that was never in the approved PRD.

None of this is malicious. **All of it is catastrophic to a sprint.**

By the time a Product Manager catches unauthorized work — usually during a sprint review or a demo — the damage is already locked in: testing debt has compounded, the timeline is compromised, and the original launch goal is derailed. Catching this traditionally requires **constant manual oversight, tedious alignment meetings, and reactive damage control.**

**ScopeCreep.ai automates this surveillance entirely.**

---

## ⚙️ How It Works — The 4-Step Pipeline

The application operates as a **passive text-ingestion engine** that pipelines workspace communication into an LLM context engine through a structured, sequential workflow.

### Step 1 — 📋 The Baseline Setup
At the start of a development cycle, the PM **uploads the approved PRD** or pastes a raw text description of an active Jira Epic into the ScopeCreep.ai interface. This document becomes the **absolute, immutable source of truth** for what is allowed to be built.

### Step 2 — 👁️ The Passive Monitor
The backend infrastructure establishes **passive text listeners** that mimic production webhooks. The system continuously ingests:
- Developer communication from channels such as **Slack or Discord**
- Code repository activity via **GitHub commit messages**

No active intervention from the PM is required after initialization.

### Step 3 — 🧠 The AI Delta Engine
A Python or Node.js backend **packages the baseline PRD alongside the live stream of developer chat logs** into an optimized LLM prompt. The model continuously performs a **delta-evaluation** — comparing incoming communication against the approved scope and flagging unauthorized divergence.

> **Example trigger:** `"Hey, I'm quickly adding a custom dark-mode toggle to this settings page while I'm in here fixing the layout"` → **SCOPE CREEP DETECTED. Severity: HIGH.**

### Step 4 — 🚨 The Real-Time Alert
When the AI flags a conversational delta as unapproved scope expansion, it generates a **structured JSON notification payload**. This instantly updates the PM's live dashboard, pinpointing exactly:
- **What is being built** (the flagged developer action)
- **What was agreed upon** (the relevant PRD clause)
- **The severity level** (`HIGH`, `MEDIUM`, or `LOW`)

The PM then has two options: **Dismiss Alert** (false positive) or **Escalate to Slack** (confirmed creep, triggers re-alignment).

---

## 🏗️ Hackathon Execution Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React / Next.js | Single-page dashboard with three interactive UI panes |
| **Styling** | Tailwind CSS | Utility-first, component-level responsive styling |
| **Backend** | Node.js (Express) *or* Python (FastAPI / Flask) | API routing, LLM orchestration, alert management |
| **AI Engine** | OpenAI API / Anthropic Claude SDK | LLM delta-evaluation and structured JSON output |
| **Telemetry** | Novus.ai tracking script | Live event capture on PM alert interactions |
| **Simulation** | Hardcoded mock data arrays | Day 1 async decoupling — no live backend dependency |
| **Deployment** | Vercel (Frontend) / Railway or Render (Backend) | Zero-config cloud delivery for judging |

---

## 📦 API Data Contract — Day 1

This is the **canonical JSON schema** agreed upon by the entire team on Day 1. All four roles build against this contract asynchronously, without blocking each other.

### `POST /api/prd`
Stores the active PRD context in backend memory.

**Request Body:**
```json
{
  "prd_text": "The settings page will allow users to update their email address and password. No other preferences will be available in this sprint."
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "PRD context set successfully."
}
```

---

### `POST /api/chat-simulate`
Receives a mock developer message string and triggers the AI delta evaluation.

**Request Body:**
```json
{
  "message": "Hey, I'm quickly adding a custom dark-mode toggle to this settings page while I'm in here fixing the layout.",
  "author": "dev_user_01",
  "source": "slack",
  "timestamp": "2026-06-17T10:45:00Z"
}
```

**Response — The Core Alert Payload:**
```json
{
  "alert_id": "alert_20260617_001",
  "is_scope_creep": true,
  "severity": "HIGH",
  "flagged_action": "Adding a custom dark-mode toggle to the settings page.",
  "prd_violation": "PRD specifies only email/password updates. No UI preference toggles are in scope.",
  "recommendation": "Pause work on the dark-mode toggle. Raise a new Jira ticket for PM review.",
  "timestamp": "2026-06-17T10:45:03Z"
}
```

---

### `GET /api/alerts`
Returns the full list of processed alerts for the PM's dashboard feed.

**Response:**
```json
{
  "alerts": [
    {
      "alert_id": "alert_20260617_001",
      "is_scope_creep": true,
      "severity": "HIGH",
      "flagged_action": "Adding a custom dark-mode toggle.",
      "prd_violation": "No UI preference toggles in scope.",
      "timestamp": "2026-06-17T10:45:03Z"
    }
  ]
}
```

> **Contract Rule:** The `severity` field is always one of three string literals: `"HIGH"`, `"MEDIUM"`, or `"LOW"`. The frontend renders card color and priority rank from this field only. No other severity values are valid.

---

## 📊 Telemetry & Validation Metrics (Novus.ai)

To capture **immediate, real-world user validation data**, the Novus.ai tracking script is embedded directly into the PM's alert feed in the frontend application wrapper.

The system measures two critical behavioral touchpoints:

| Metric | Description | Novus.ai Event |
|---|---|---|
| **Acknowledge Speed** | Milliseconds elapsed between an alert appearing in the UI and the PM first interacting with it | Captured as event metadata on both actions |
| **Dismiss Alert** | PM confirms a false positive and closes the ticket — identifies prompt tuning opportunities | `novus.track("Alert Dismissed", { severity: alert.severity })` |
| **Escalate to Slack** | PM confirms true scope creep and triggers a re-alignment notification | `novus.track("Alert Escalated", { duration_ms: timeDiff })` |

> **Why this matters for the hackathon:** The Dismiss vs. Escalate ratio is the **north-star product metric**. A high Dismiss rate signals prompt over-sensitivity. A high Escalate rate with low `duration_ms` validates that the watchdog is surfacing real, actionable intelligence fast.

---

## 👥 The 4 Asynchronous Development Roles

The team executes in **parallel tracks** from Day 1. Each role has a fully independent workstream that does not block any other. Integration happens at the final merge point. A hackathon judge reviewing this repo can verify execution progress against the checklist below.

---

### 🧠 Role 1 — Prompt Engineer & AI Architect *(The Brains)*

**Primary Mandate:** Own the foundational intelligence and analytical accuracy of the application. This role works independently using LLM playground environments — no functional server or UI is required.

- [ ] Design, iterate, and optimize the **system instructions prompt** that commands the LLM to act as a strict product watchdog, comparing a `[PRD]` to an incoming `[Chat/Commit Message]`.
- [ ] Implement strict **Output Parsing constraints** inside the prompt to guarantee the AI responds *only* in valid, parsable JSON matching the Day 1 Data Contract.
- [ ] Assemble a **local testing dataset of 20 distinct developer conversation strings:** 10 representing safe sprint questions (bug fixes, clarifications) and 10 representing clear, unauthorized scope creep.
- [ ] Run **benchmarking tests** against the prompt to ensure consistency and prevent structural formatting failures across model temperature variations.

---

### ⚙️ Role 2 — Backend & Integration Developer *(The Engine)*

**Primary Mandate:** Handle server creation, routing framework setup, and external LLM API pipelines. The entire server workflow can be built and tested using **static placeholder objects** matching the data contract — the final prompts do not need to be finished first.

- [ ] Initialize a clean **Node.js (Express)** or **Python (FastAPI / Flask)** application workspace with a proper project structure.
- [ ] Build out three explicit HTTP routes:
  - `POST /api/prd` — To store active PRD context strings in memory.
  - `POST /api/chat-simulate` — To receive mock text strings from the user interface.
  - `GET /api/alerts` — To serve the processed alert list back to the frontend dashboard.
- [ ] Wire up the **external LLM provider connection** (OpenAI SDK, Anthropic SDK, etc.) within the simulation route handler.
- [ ] Create a **mock/live toggle switch** in code: route text through a hardcoded mock JSON block initially, then flip to the live LLM API call once the Prompt Engineer signs off on the final prompt string.

---

### 🎨 Role 3 — Frontend & UX Engineer *(The Face)*

**Primary Mandate:** Build the interactive single-page application dashboard. On Day 1, **bypass all live backend integrations** — populate interface components with hardcoded mock arrays that mirror live functionality to unblock development.

- [ ] Scaffold a **single-page React / Next.js** workspace using a clean component framework (Tailwind CSS).
- [ ] Build the **PRD Input Hub** panel — captures user text input and updates local state; includes a character count and a clear-field button.
- [ ] Build the **Live Developer Log Simulator** — an interactive terminal-style text box that accepts developer message input and exposes a `"Simulate Code Push"` button trigger.
- [ ] Construct the **Creep Alerts feed module** — renders visual severity cards (`HIGH`, `MEDIUM`, `LOW`) with distinct color coding, alert body text, and two action buttons: `"Dismiss Alert"` and `"Escalate to Slack"`.
- [ ] Isolate **all state updates and fetch calls** inside clean API helper functions — swapping mock local arrays for real `fetch('/api/alerts')` calls must be a single-line change per function.

---

### 📡 Role 4 — Telemetry & Product Validation Lead *(The Watchdog)*

**Primary Mandate:** Own project management, hackathon constraint compliance, user-behavior tracking instrumentation, and final submission packaging.

- [ ] Register the project workspace within the **Novus.ai console** and acquire the application identification tracking snippet.
- [ ] **Inject the Novus.ai telemetry script tag** into the Frontend Engineer's main application wrapper layout (`_app.tsx` or `layout.jsx`).
- [ ] Bind the `"Alert Dismissed"` custom track event callback:
  ```js
  novus.track("Alert Dismissed", { severity: alert.severity });
  ```
- [ ] Bind the `"Alert Escalated"` custom track event callback:
  ```js
  novus.track("Alert Escalated", { duration_ms: timeDiff });
  ```
- [ ] Conduct **end-to-end user acceptance testing (UAT)** across the merged prototype — verify that all text inputs produce valid, dynamic UI state changes with no console errors.
- [ ] Coordinate **final repository packaging:** draft the Devpost technical write-up and produce the mandatory short runtime video demonstration for the hackathon judging panel.

---

## 🚀 Running the Prototype Locally

```bash
# 1. Clone the repository
git clone https://github.com/ADITYA-TUMMURI/ScopeCreep.ai.git
cd ScopeCreep.ai

# 2. Install backend dependencies
cd backend
npm install        # or: pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# → Add your LLM API key: OPENAI_API_KEY=sk-...

# 4. Start the backend server
npm run dev        # or: uvicorn main:app --reload

# 5. Install and start the frontend (new terminal)
cd ../frontend
npm install
npm run dev

# 6. Open the dashboard
# → http://localhost:3000
```

---

## 📁 Repository Structure

```
ScopeCreep.ai/
├── backend/
│   ├── routes/
│   │   ├── prd.js          # POST /api/prd
│   │   ├── simulate.js     # POST /api/chat-simulate
│   │   └── alerts.js       # GET /api/alerts
│   ├── prompts/
│   │   └── watchdog.txt    # The master LLM system prompt
│   └── server.js
├── frontend/
│   ├── components/
│   │   ├── PrdInputHub.jsx
│   │   ├── DevLogSimulator.jsx
│   │   └── AlertFeed.jsx
│   ├── lib/
│   │   └── api.js          # All fetch helpers — mock/live toggle
│   └── pages/
│       └── index.jsx
├── project_overview.md
├── roles_mind_the_product.md
├── LICENSE
└── README.md
```

---

## 📜 License

> This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.
> Copyright © 2026 Aditya. Built for the **Mind the Product "Everyone Ships Now" Hackathon.**
