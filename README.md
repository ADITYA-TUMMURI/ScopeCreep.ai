# 🛰️ ScopeCreep.ai

**AI-powered sprint watchdog that catches silent scope creep before it derails your release.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Hackathon](https://img.shields.io/badge/Mind%20the%20Product-Everyone%20Ships%20Now-blueviolet?style=flat-square)](https://www.mindtheproduct.com/)
[![Telemetry](https://img.shields.io/badge/Telemetry-Novus.ai-0099ff?style=flat-square)](https://novus.ai)

---

## The Problem

Developers routinely slip unauthorized work into active sprints — a dark-mode toggle during a layout fix, a UX overhaul during a copy change, an OAuth integration during a validation bugfix. None of it is malicious, but by the time the PM catches it at sprint review, testing debt has compounded and the launch target is blown.

**ScopeCreep.ai automates the surveillance.** It ingests a Product Requirement Document, monitors developer communication in real time, and uses an LLM to flag any work that falls outside the approved scope — instantly.

---

## How It Works

```
PRD Baseline ──→ Passive Monitor ──→ AI Delta Engine ──→ Real-Time Alert
     │                  │                    │                   │
 PM pastes the    Ingests dev chat     LLM compares chat    Dashboard lights
 approved scope   & commit messages    against PRD scope    up with severity-
 document         from Slack/GitHub    to detect drift      coded creep alerts
```

The PM then **Dismisses** (false positive) or **Escalates to Slack** (confirmed creep).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React · Vite · Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Node.js (Express) / Python (FastAPI) |
| **AI Engine** | OpenAI / Anthropic Claude SDK |
| **Telemetry** | Novus.ai |

---

## Quick Start

```bash
# Clone
git clone https://github.com/ADITYA-TUMMURI/ScopeCreep.ai.git
cd ScopeCreep.ai

# Install & run the frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

> The frontend runs standalone with mock data. No backend required to demo the full UI.

---

## Project Structure

```
ScopeCreep.ai/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root shell — navbar + dashboard
│   │   ├── main.jsx                   # Entry point
│   │   ├── index.css                  # Design tokens (Slate & Crimson)
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx    # 3-column grid + state management
│   │   │   ├── PrdInputHub.jsx        # PRD baseline input panel
│   │   │   ├── DevChatSimulator.jsx   # Developer chat simulator
│   │   │   ├── WatchdogAlertsFeed.jsx # Alert feed with dismiss/escalate
│   │   │   ├── StatusBadge.jsx        # Severity pill (HIGH/MEDIUM/LOW)
│   │   │   └── ActionButton.jsx       # Animated button primitive
│   │   └── data/
│   │       └── mockAlerts.json        # 3 realistic scope creep scenarios
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── project_overview.md            # System architecture spec
│   └── roles_mind_the_product.md      # 4 async development roles
├── LICENSE
└── README.md
```

---

## API Contract

The frontend is wired to `POST /api/analyze` with the following schema:

**Request:**
```json
{
  "prdContext": "Only email/password validation fixes are authorized for Sprint 14.",
  "chatInput": "Adding OAuth2 support for Google while I'm in the auth module."
}
```

**Response:**
```json
{
  "alert_id": "alert_20260617_001",
  "is_scope_creep": true,
  "severity": "HIGH",
  "flagged_action": "Adding OAuth2 support for Google.",
  "prd_violation": "PRD scopes auth work to email/password validation only.",
  "recommendation": "Pause OAuth2 work. Raise a new ticket for PM review."
}
```

---

## Telemetry (Novus.ai)

Two behavioral events are instrumented on the alert action buttons:

| Event | Trigger | Payload |
|---|---|---|
| `Alert Dismissed` | PM closes a false positive | `{ severity }` |
| `Alert Escalated` | PM confirms real scope creep | `{ duration_ms }` |

> The **Dismiss vs. Escalate ratio** is the north-star product metric for prompt tuning.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

Built for the **Mind the Product "Everyone Ships Now" Hackathon** © 2026.
