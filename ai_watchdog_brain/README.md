# AI Watchdog Brain (Role 1: Prompt Engineering & AI Architecture)

This folder contains the core intelligence assets for **ScopeCreep.ai**, designed and developed to fulfill the exact checklist for **Role 1 (The Prompt Engineer & AI Architect)**.

## 📂 Deliverables

1. **`system_prompt.txt`**: Optimized system instructions that direct an LLM to evaluate a developer message against a PRD baseline, classify scope creep severity (HIGH, MEDIUM, LOW, NONE), and produce clean JSON outputs.
2. **`test_dataset.json`**: Structured dataset containing 20 distinct developer chat/commit logs (10 safe sprint questions/clarifications, 10 clear unauthorized scope creep messages).
3. **`benchmark.py`**: A python script that loads the system prompt and test dataset, validates JSON output formatting against the API contract, and runs local simulations or live Gemini API queries.
4. **`test_results.json`**: Output report containing results of the benchmarking test execution.

---

## 🚀 Running the Benchmarks

To execute the verification validation suite:

### Option 1: Simulation Mode (No API keys needed)
Runs formatting checks and validation logic against simulated outputs:
```bash
python3 benchmark.py
```

### Option 2: Live API Mode (Uses Google Gemini 2.5 Flash API)
Checks prompt effectiveness and JSON parsing conformity against the live LLM model:
```bash
# Set environment variable
export GEMINI_API_KEY="your_api_key_here"

# Execute
python3 benchmark.py --api
```
*(Alternatively, pass the key via parameter: `python3 benchmark.py --api --key <YOUR_API_KEY>`)*

---

## 📏 Token Budget & Context Guidelines

To ensure the AI Watchdog remains performant, fast, and does not truncate data, the following token constraints must be enforced when passing text from the UI to the API:

* **PRD Baseline Window (`prdContext`)**: Maximum **8,000 tokens** (approx. 6,000 words). If the PRD is longer, it should be summarized by the PM before locking the baseline.
* **Developer Chat Input (`chatInput`)**: Maximum **1,000 tokens** (approx. 750 words). Extremely long chat logs or massive Git diffs should be truncated to the most recent changes before submission.
* **Max Output Tokens**: The system is locked to `responseMimeType: "application/json"`. The JSON response payload will consistently consume fewer than **250 tokens**.
