# Agno Setup Wizard

A copyable prompt that guides users through building agents with the **Agno**
framework + **AgentOS**. It ships in two forms:

1. **MVP** — a static "copy prompt" button on the Webflow marketing site.
2. **V2** — an instrumented selector embed that captures the user's chosen path
   and copies a *tailored* prompt.

## Source of truth

[`agno-setup-wizard-prompt.md`](./agno-setup-wizard-prompt.md) is the **single
canonical source** for all prompt text. Everything in [`dist/`](./dist) is
**generated** from it.

> **Sync direction is always repo → everywhere (Webflow, CDN, etc.). Never the
> reverse. Never hand-edit `dist/`.**

`AgnoSetupWizardCTA.jsx` is a **design reference only** — it is not shipped, and
its embedded prompt string is not canonical.

## Build

Zero runtime dependencies — pure Node (built-ins only).

```bash
npm run build      # == node build.js
```

This reads `agno-setup-wizard-prompt.md` and regenerates:

| Output | Purpose |
| --- | --- |
| `dist/mvp-prompt.txt` | Clean copy-paste block for the MVP Webflow copy button. Header documents the sync rule; paste everything below the delimiter line. |
| `dist/prompt-data.js` | Base prompt + path metadata + `buildPrompt(pathId)` assembly logic for the V2 embed. Loadable in the browser as `window.AgnoWizardPrompt` and via CommonJS. |

The build stamps each artifact with an ISO timestamp and a short content hash of
the prompt body so generated files are traceable to a source revision.

### `prompt-data.js` API

```js
window.AgnoWizardPrompt.version       // content hash string
window.AgnoWizardPrompt.paths         // [{ id, emoji, label, description, letter }]
window.AgnoWizardPrompt.basePrompt    // full prompt text (includes Step 1 routing)
window.AgnoWizardPrompt.buildPrompt(pathId)
                                      // full prompt pre-routed to a path;
                                      // unknown/empty pathId → unmodified base prompt
```

Path IDs are slugified from the Step 1 options in the canonical `.md`
(e.g. `building-a-product`, `automating-a-workflow`, `evaluating-for-my-team`,
`exploring`).

## Workflow when the prompt changes

1. Edit `agno-setup-wizard-prompt.md` (the only file you hand-edit).
2. Run `npm run build`.
3. Commit the regenerated `dist/`.
4. **MVP:** copy the body of `dist/mvp-prompt.txt` and re-paste into the Webflow
   copy element.
5. **V2:** the embed loads `dist/prompt-data.js` from the published URL — once
   the new `dist/` is published (below), the embed picks it up.

## Publishing `dist/`

The V2 embed loads `prompt-data.js` from a URL, so `dist/` must be published.
Both options work; `dist/` is committed to the repo to support either.

- **jsDelivr (recommended, no setup):** once this repo is on GitHub, the file is
  served from
  `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag-or-commit>/dist/prompt-data.js`.
  Pin a tag/commit for stable caching; `@latest` follows the default branch.
- **GitHub Pages:** enable Pages for the repo.
  - If you publish from the `dist/` folder, the file is at `https://<owner>.github.io/<repo>/prompt-data.js`.
  - If you publish from the repo root, the file is at `https://<owner>.github.io/<repo>/dist/prompt-data.js`.

> If you haven’t pushed this repo to GitHub yet, initialize a remote and push it,
> then replace the `<owner>/<repo>` placeholders above in the V2 embed’s script
> `src`.

## Files

- `agno-setup-wizard-prompt.md` — canonical prompt (source of truth).
- `build.js` — generator (`dist/` from the `.md`).
- `dist/mvp-prompt.txt` — MVP paste block (generated).
- `dist/prompt-data.js` — V2 prompt data + assembly (generated).
- `dist/webflow-embed.html` — V2 self-contained embed (Phase 4 — pending).
- `dist/analytics-hooks.md` — PostHog Action hook list (Phase 4 — pending).
- `AgnoSetupWizardCTA.jsx` — design reference only (not shipped).
