# ARCHITECT_TODO — Migraine
_Head Architect review 2026-07-02. Full context: `Code/_ARCHITECT_REVIEW_2026-07-02/`._
_Worker rules: NEVER delete source code (only venv/node_modules/target/.build/__pycache__/dist and compiled artifacts). Move whole projects to `Code/Archived_Projects/<name>/` with WHY_ARCHIVED.md. Before moving a folder, run: grep -rl "Migraine" ~/Library/LaunchAgents/ "$HOME/Library/Application Support/BatesAI/" — if anything matches, STOP and report. Secrets (*.p8, *.p12, .env, keys) go to ~/Library/Application Support/BatesAI/keys/ chmod 600. Do ONE step at a time; verify; report._

**Verdict:** ACTIVE — fix dead fallback
**What this is:** Migraine Watch: Apple Watch app predicting migraine risk from HealthKit + WeatherKit; Deepseek free tier with Groq fallback. THE GROQ KEY IS DEAD (archived 2026-06-11).

## Steps
1. Grep this folder for `groq` and `gsk_`; list every file referencing Groq. REPORT ONLY — change nothing yet.
2. Write `PROJECT.md` documenting actual build/ship status: search for .xcodeproj, TestFlight refs, package.json scripts; state what exists.
3. After Daniel approves: replace the Groq fallback with a live provider (route via provider_bridge / OpenRouter GLM key from CREDENTIALS.md — never hardcode the key).
4. GUI roadmap: watch complication = colored risk ring (green→red); one-tap 'log symptom now'; morning summary notification; phone app max 3 screens (Today / History calendar heatmap / Settings).

## CODE REVIEW FINDINGS (2026-07-02, actual source read)
**VERDICT REVISED: the watch app is a SKELETON, not a working product.** The README oversells it.
1. `WatchApp/RemoteLLMClient.swift` — `predict()` is a TODO that returns the base prediction unchanged. There is NO AI prediction.
2. `WatchApp/HealthKitProvider.swift` — `fetchLatestHealthSnapshot()` returns hardcoded mock data (HR 70, HRV 50, 7h sleep). No real HealthKit reads.
3. `MigrainePredictionEngine` base prediction is hardcoded 'low risk, 0.2'. WeatherKitProvider is a 16-line stub.
4. **Folder contamination:** `server.js` + `engine/` + `web/` are an UNRELATED app ('Justice' — legal conditions parser with OCR, runs on port 3000). Split it out to its own folder `Justice_Conditions_Parser/` (or archive it).
5. Two divergent copies of the watch app exist (`WatchApp/` vs `MigraineApp/MigraineApp Watch App/` — ContentView and MigraineCore differ). Diff them, keep the newer (the one inside the xcodeproj), delete the loose one.
6. Groq references: moot until 1–3 are implemented; the real task is implementing RemoteLLMClient against a backend at all.
Realistic status: good data-model scaffolding, zero working prediction pipeline. Treat as early prototype.
