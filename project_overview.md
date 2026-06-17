# 🛰️ ScopeCreep.ai — Project Architecture & System Overview

## 1. Executive Summary & The Elevator Pitch
ScopeCreep.ai is an AI-powered sprint watchdog built for the Mind the Product "Everyone Ships Now" Hackathon. It protects a product's vision by passively monitoring engineering communication channels and code commits against the official Product Requirement Document (PRD). Its primary mandate is to catch unauthorized "gold-plating" and accidental scope expansion before it blows up a sprint or derails a release target.

## 2. The Operational Problem
In software development, Product Managers (PMs) frequently fall victim to "silent scope creep." This occurs when well-intentioned developers add "cool little extras," expand feature boundaries, or rewrite user flows spontaneously without consulting product leadership. 

By the time a PM manually reviews a feature or catches it during a sprint review, significant code has already been written, testing debt has increased, the sprint timeline is compromised, and the original launch goal is derailed. Catching this traditionally demands constant, manual oversight and tedious alignment meetings. ScopeCreep.ai automates this surveillance.

## 3. The Core System Workflow (Step-by-Step)
The application operates as a passive text-ingestion engine that pipelines workspace chatter into a Large Language Model (LLM) context engine via a 4-step workflow:

1. **The Baseline Setup:** At the beginning of a development cycle, the PM uploads the approved PRD or pastes a raw text description of an active Jira Epic into the ScopeCreep.ai interface. This establishes the absolute source of truth for allowed scope.
2. **The Passive Monitor:** The backend infrastructure establishes passive text listeners mimicking production webhooks. It ingests ongoing conversation data from developer communication channels (such as Slack or Discord) and code repository updates (GitHub commit messages).
3. **The AI Delta Engine:** A Python or Node.js backend passes the baseline PRD text and the incoming stream of developer chat logs into an optimized LLM prompt. The LLM continuously performs a delta-evaluation to flag whether the active chat indicates a task outside the scope of the PRD (e.g., *"Hey, I'm quickly adding a custom dark-mode toggle to this settings page while I'm in here fixing the layout"*).
4. **The Real-Time Alert:** If the AI flags a conversational delta as unapproved scope expansion, it generates a structured notification payload. This instantly updates the PM's live dashboard, pinpointing exactly what is being built versus what was originally agreed upon.

## 4. Prototype Architecture for Hackathon Delivery
To fulfill the hackathon mandate of shipping a fully functional, runnable workflow, the prototype bypasses deep third-party production auth systems and uses a high-fidelity interactive simulation environment:

* **Frontend Workspace (React / Next.js):** A single-page dashboard split into three clean UI panes:
  1. *PRD Input Hub:* Where a user can upload or paste a product requirement text block.
  2. *Live Developer Log Simulator:* An interactive terminal box where a judge can type or paste mock developer messages or commit logs.
  3. *Watchdog Alert Stream:* A UI feed that lights up with visual "Creep Alerts" when the backend catches unapproved work.
* **Backend API Layer (Node.js or Python):** A lean web server hosting API endpoints. It captures the PRD data and chat payloads, packages them into an engineering prompt context window, triggers the LLM API request, and returns a clean, structured JSON assessment back to the user interface.
* **The Live Judging Experience:** A standalone interface where a judge can paste an explicit PRD snippet, type an unauthorized feature adjustment into the mock chat box, click "Simulate Developer Update," and instantly see the system catch, evaluate, and display an alert flag in real time.

## 5. Mandatory Novus.ai Telemetry Architecture
To capture immediate real-world user validation data, the Novus.ai tracking script is embedded directly into the PM's alert feed. The system monitors two specific interactive touchpoints:
* **Acknowledge Speed:** Measures the exact milliseconds elapsed between an active alert populating the UI and the PM interacting with it.
* **Action Routing:** Logs specific custom events when a PM clicks **"Dismiss Alert"** (identifying a false positive and closing the ticket) or clicks **"Escalate to Slack"** (confirming true scope creep and triggering a re-alignment command).