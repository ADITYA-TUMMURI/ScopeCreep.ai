👥 The 4 Asynchronous Roles & Direct Action Items
1. The Prompt Engineer & AI Architect ("The Brains")

This role owns the foundational intelligence and analytical accuracy of the application. Because this workflow relies on raw text data, they work independently using playground environments without needing a functional server or interface.

    Exact Task Checklist:

        [x] Design, iterate, and optimize the system instructions prompt that commands an LLM to act as a strict product watchdog comparing a [PRD] to a [Chat/Commit Message].

        [x] Implement strict Output Parsing constraints inside the prompt to guarantee the AI responds only in valid, parsable JSON matching the Day 1 Contract.

        [x] Assemble a local testing dataset of 20 distinct developer conversation strings: 10 representing safe sprint questions (e.g., bug fixes, clarifications) and 10 representing clear, unauthorized scope creep.

        [x] Run benchmarking tests against the prompt to ensure consistency and prevent structural formatting failures.

2. The Backend & Integration Developer ("The Engine")

This role handles server creation, routing framework setup, and external API pipelines. They can program and test the entire server workflow using static placeholder objects matching the data contract before the final prompts are finished.

    Exact Task Checklist:

        [x] Initialize a clean Node.js (Express) or Python (FastAPI/Flask) application workspace.

        [x] Build out three explicit HTTP routes:

            POST /api/prd - To store active PRD contexts in memory.

            POST /api/chat-simulate - To receive mock text strings from the user interface.

            GET /api/alerts - To serve the list of processed system alerts back to the frontend dashboard.

        [x] Wire up the external LLM provider connection (OpenAI SDK, Anthropic SDK, etc.) within the simulation route.

        [x] Create a toggle switch in the code: Route text through a hardcoded mock JSON block initially, and flip to the live LLM API call once the Prompt Engineer signs off on the prompt string.

3. The Frontend & UX Engineer ("The Face")

This role builds the interactive single-page application dashboard. They work asynchronously by bypassing live backend integrations entirely on Day 1—populating the interface components with hardcoded mock arrays to mirror live functionality.

    Exact Task Checklist:

        [ ] Scaffolds a single-page React, Next.js, or Vue workspace using a clean component framework (such as Tailwind CSS).

        [ ] Program the PRD Upload panel to capture user inputs and update local text states.

        [ ] Build the interactive Live Dev Chat Log stream terminal box, enabling text entry and containing standard button triggers like "Simulate Code Push".

        [ ] Construct the "Creep Alerts" feed module, styling visual cards based on alert severity (HIGH, MEDIUM, LOW) using dummy data fields.

        [ ] Isolate all state updates and fetch commands inside clean API helper functions so that swapping out local mock variables for real fetch('/api/alerts') endpoints is plug-and-play.

4. The Telemetry & Product Validation Lead ("The Watchdog")

This role is responsible for project management, satisfying the specific hackathon constraints, managing user-behavior tracking, and compiling deployment assets.

    Exact Task Checklist:

        [ ] Register the project workspace within the Novus.ai console and acquire the application identification tracking snippet.

        [ ] Inject the Novus.ai telemetry script tag into the Frontend Engineer's main application wrapper layout.

        [ ] Program custom track event callbacks on the dashboard's primary call-to-action triggers:

            Bind novus.track("Alert Dismissed", { severity: alert.severity }) to the dismiss button.

            Bind novus.track("Alert Escalated", { duration_ms: timeDiff }) to the Slack notification button.

        [ ] Conduct end-to-end user acceptance testing across the merged prototype to ensure code text inputs output valid UI state changes dynamically.

        [ ] Coordinate final repository packaging, draft clear Devpost technical summaries, and produce the mandatory short runtime video demonstration for the hackathon judging panel.