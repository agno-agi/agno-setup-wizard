# CLAUDE.md

Persistent ground rules for the Agno Setup Wizard project. These apply to every
session. The full spec is in `claude-code-instructions.md` — read it before working.

## What this project is

A copyable prompt that guides users through building agents with the Agno
framework + AgentOS. Ships as (1) an MVP static copy button on a Webflow
marketing site, and (2) a later instrumented selector embed that captures the
user's chosen path and copies a tailored prompt.

## Source of truth

- `agno-setup-wizard-prompt.md` is the **single canonical source** for all prompt text.
- Everything in `dist/` is **generated** from it. Never hand-edit `dist/`.
- Sync direction is always repo → everywhere (Webflow, etc.). Never the reverse.

## Documentation

- Use the `agno-docs` MCP (`https://docs.agno.com/mcp`) as the source of truth for
  all Agno facts, APIs, and code. Start from `https://docs.agno.com/llms.txt`.
- Do NOT rely on training data for Agno details — it is stale and known wrong in places.
- If the MCP is unavailable, stop and say so rather than guessing from memory.

## Hard rules

- Do not ship `AgnoSetupWizardCTA.jsx` or any React. It is a design reference only.
- The V2 Webflow embed must be self-contained, framework-free HTML/CSS/vanilla JS.
- Do NOT add analytics SDK calls (`posthog.capture()` etc.). Analytics is handled
  post-launch via PostHog Actions targeting stable `id` / `data-*` hooks on the HTML.
- This is a content **refresh**, not a redesign — do not restructure the wizard's
  four paths, readiness branching, or teaching tone unless docs make something wrong.
- Cite the specific doc page for any non-trivial correction.

## Working style

- Pause at the checkpoints defined in the kickoff prompt before editing and before
  building V2. Otherwise keep moving.
- Keep a running change list for the changelog handoff.
