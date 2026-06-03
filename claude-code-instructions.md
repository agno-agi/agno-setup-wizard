# Agno Setup Wizard — Claude Code Project Instructions

## Context

This project maintains and ships an **Agno Setup Wizard**: a copyable prompt that users paste into an AI coding assistant (Claude Code, Codex, Cursor, etc.) to get a guided, intent-routed setup experience for building agents with the Agno framework and AgentOS.

There are two existing files (treat as inputs, see "Inputs" below):
- `agno-setup-wizard-prompt.md` — the wizard prompt itself. This is the product.
- `AgnoSetupWizardCTA.jsx` — a React marketing component that wraps the prompt. **Design reference only. Do not ship this. Do not treat its embedded `PROMPT` string as canonical.**

The content is a few months old and must be brought current with live Agno documentation before anything ships.

## Source of truth

`agno-setup-wizard-prompt.md` in this repo is the **single canonical source** for all prompt text. Every downstream artifact is generated from or manually synced from this file. Sync direction is **always repo → everywhere else, never the reverse.**

---

## Goals, in order

### 1. Content refresh (blocks everything else)

Bring the canonical `.md` fully current with live Agno docs.

- Fetch the documentation index at `https://docs.agno.com/llms.txt` and walk it to find the relevant pages.
- Fact-check **every** version-sensitive or factual claim against current docs. Known claims to verify (non-exhaustive):
  - "120+ pre-built toolkits" / "120+ tools"
  - "50+ API endpoints"
  - Supported models list (Anthropic, OpenAI, Google, Bedrock, Azure, Groq, Ollama, …)
  - Supported databases list (PostgreSQL, SQLite, MongoDB, MySQL, Redis, DynamoDB, Firestore, Supabase, SingleStore, SurrealDB, …)
  - Example agent names referenced in the prompt (Pal, Dash, Scout, Gcode, Investment Team) — confirm these still exist and are named correctly
  - The control plane URL (`os.agno.com`) and docs URLs
- Verify **every code block actually works** against the current API:
  - Install commands (`uv pip install -U agno`, provider installs, AgentOS deps)
  - Import paths (`from agno.os import AgentOS`, `from agno.db.sqlite import SqliteDb`)
  - API names and arguments (`enable_agentic_memory`, `update_memory_on_run`, `add_history_to_context`, `agent_os.serve(...)`, `agent_os.get_app()`)
  - **Resolve the run-instruction inconsistency:** the current doc shows both a `__main__` block calling `agent_os.serve(app="main:app", reload=True)` AND a separate instruction to run `fastapi dev main.py`. Determine the current correct way to run AgentOS and make the doc internally consistent.
- **Verification depth:** Where feasible, actually run the environment setup and the AgentOS bootstrap to confirm the code executes — don't fact-check by reading alone. If a step can't be run in this environment, note that explicitly and flag it for manual verification.
- Update the `.md` in place. Preserve the existing structure, four-path routing, readiness branching, and teaching-tone guidance unless a doc change makes something factually wrong. **This is a refresh, not a redesign** — do not restructure the wizard flow.
- Keep a running list of every change made (this feeds the Cowork changelog).

### 2. MVP deliverable — full prompt for Webflow hard-code

The MVP is a single static copy button on the marketing site. The prompt is hard-coded into Webflow manually, but **this repo's `.md` is the source of truth.**

- Produce a clean, copy-paste-ready block of the corrected full prompt — exactly the text that should be pasted into Webflow. No commentary, no markdown fences wrapping the whole thing, ready to drop into a Webflow rich-text or code element.
- Save it as a separate file in the repo (e.g., `dist/mvp-prompt.txt`) so the paste source is unambiguous and version-controlled.
- Document the sync rule plainly at the top of that file: *this is generated from `agno-setup-wizard-prompt.md`; when the canonical file changes, regenerate this and re-paste into Webflow.*

### 3. Repo plumbing — generate downstream artifacts from canonical `.md`

Set up the repo so the `.md` is the single source and downstream artifacts are generated, never hand-edited.

- Build a small, dependency-light build step (Node script is fine) that reads `agno-setup-wizard-prompt.md` and emits:
  - `dist/mvp-prompt.txt` (the MVP paste block above)
  - `dist/prompt-data.js` (for V2 — see below): a base prompt plus per-path assembly logic, so the V2 embed can produce a *tailored* prompt per path selection.
- The build should be runnable with one command and documented in the repo README.
- Publish `dist/` via GitHub Pages or be jsDelivr-compatible so the V2 embed can load `prompt-data.js` from a URL.

### 4. V2 deliverable — Webflow-ready instrumented embed

V2 escalates the MVP to something resembling `AgnoSetupWizardCTA.jsx`, but it must run in Webflow. **Webflow does not run React.** Reimplement the behavior as a **self-contained HTML embed**: markup + `<style>` + vanilla `<script>` in one block, no framework, no build dependency at runtime.

Requirements:
- **Visual + interaction model:** use `AgnoSetupWizardCTA.jsx` as the design reference (dark gradient card, four path cards, feature grid, copy button, optional terminal preview). Match the look and feel; re-express it in plain HTML/CSS/JS.
- **Tailored prompt:** clicking a path selects it; the copied prompt is **pre-routed to that path** (the way the wizard already tailors the experience from the opening questions). Pull base prompt + per-path assembly from the published `dist/prompt-data.js`. Do **not** hard-code prompt strings in the embed — it loads them from the canonical-derived published file.
- **Analytics hooks (critical):** the site is already tracked by PostHog, and event tracking will be added *after launch* via PostHog **Actions** (no-code, defined from clicks on existing elements). Therefore the embed must **NOT** call `posthog.capture()`. Instead, every clickable element must carry **stable, predictable, human-readable hooks** so Actions can target them:
  - Use both an `id` and a `data-*` attribute on each interactive element.
  - Naming must be consistent and self-describing, e.g. `data-agno-action="select-path"` plus `data-agno-path="building-a-product"`, and on the copy button `data-agno-action="copy-prompt"` plus `data-agno-path="<currently-selected>"`.
  - Document the full list of element IDs / data attributes in a comment block at the top of the embed AND in a separate `dist/analytics-hooks.md` file (this feeds the Cowork PostHog spec).
  - Hooks must be deterministic and not change between renders, so Actions stay stable.
- **Self-contained / portable:** the embed must drop into either a Webflow Embed element or a page-level custom-code block without restructuring. Assume the most portable form.
- Save as `dist/webflow-embed.html`.

---

## Inputs

- `agno-setup-wizard-prompt.md` — current canonical prompt (needs refresh). Becomes the source of truth.
- `AgnoSetupWizardCTA.jsx` — **design reference only.** Do not ship. Do not trust its embedded prompt string; regenerate from the refreshed `.md`.

## Explicit non-goals

- Do not ship the `.jsx` or any React.
- Do not redesign the wizard flow, paths, or readiness branching. Refresh facts and code only.
- Do not add `posthog.capture()` calls or any analytics SDK code — analytics is handled post-launch via PostHog Actions against the HTML hooks.
- Do not hand-edit any file in `dist/`; those are generated from the canonical `.md`.

## Definition of done

- [ ] `.md` is fact-checked against live docs; every claim and code block verified (run where possible, flagged where not).
- [ ] Run-instruction inconsistency (`serve()` vs `fastapi dev`) resolved and doc is internally consistent.
- [ ] `dist/mvp-prompt.txt` produced, with sync rule documented.
- [ ] Build step generates `dist/` from `.md` with one command; documented in README.
- [ ] `dist/webflow-embed.html` is self-contained, framework-free, loads prompt data from published `prompt-data.js`, tailors the prompt per path, and exposes stable analytics hooks on every clickable element.
- [ ] `dist/analytics-hooks.md` lists every element ID / data attribute for the PostHog Actions setup.
- [ ] A complete change list is captured for the Cowork changelog.

## Handoffs

- The **change list** and **`dist/analytics-hooks.md`** go to Cowork for the changelog and PostHog event spec.
- `dist/mvp-prompt.txt` is the paste source for whoever updates Webflow.
