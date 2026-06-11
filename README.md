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
| `dist/mvp-prompt.txt` | **Raw** prompt text — no header, no comments, no fences. The MVP Webflow copy button fetches this from jsDelivr and the end user copies it verbatim, so the file must contain nothing but the prompt. The sync rule lives here in the README, never in the file. |
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

## Publishing — jsDelivr from this public repo

The prompt (~16.8 KB) exceeds Webflow's Embed/custom-code field limits, so it is
**not** hard-coded into Webflow. Instead the Webflow copy button **fetches**
`dist/mvp-prompt.txt` from jsDelivr at runtime. This requires the repo to be
**public** — jsDelivr only serves public repos.

URLs (repo is `agno-agi/agno-setup-wizard`):

```
# Pinned to a release tag — PREFERRED (deterministic, no stale-cache surprises)
https://cdn.jsdelivr.net/gh/agno-agi/agno-setup-wizard@v1.0.1/dist/mvp-prompt.txt

# Latest on the default branch — convenient, but CDN-cached up to ~7 days
https://cdn.jsdelivr.net/gh/agno-agi/agno-setup-wizard@main/dist/mvp-prompt.txt
```

Use the **tag-pinned** URL in Webflow. jsDelivr caches `@main` aggressively
(up to ~7 days), so pinning to a tag makes every prompt update deliberate and
instantly live at a new URL.

### Workflow when the prompt changes (regenerate → commit → tag → bump URL)

1. Edit `agno-setup-wizard-prompt.md` (the only file you hand-edit).
2. `npm run build` to regenerate `dist/`.
3. Commit the regenerated `dist/` (via PR — `main` is protection-ruled).
4. Tag a new release, e.g. `v1.0.2` (GitHub → Releases → *Draft a new release*,
   or `git tag v1.0.2 && git push origin v1.0.2`).
5. Update the `@vX.Y.Z` in the Webflow button's fetch URL to the new tag.

> **Sync direction is always repo → Webflow.** Never edit the prompt in Webflow
> and never hand-edit `dist/`.

## Webflow MVP copy button

Drop this into a Webflow **Embed** element. It fetches the raw prompt from
jsDelivr and copies it to the clipboard. Bump the `@v1.0.1` tag when you publish
a new release.

```html
<button id="agno-copy-prompt" data-agno-action="copy-prompt"
        data-agno-src="https://cdn.jsdelivr.net/gh/agno-agi/agno-setup-wizard@v1.0.1/dist/mvp-prompt.txt">
  Copy the Agno setup prompt
</button>
<script>
  (function () {
    var btn = document.getElementById("agno-copy-prompt");
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      fetch(btn.getAttribute("data-agno-src"), { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (text) { return navigator.clipboard.writeText(text); })
        .then(function () {
          btn.textContent = "Copied!";
          setTimeout(function () { btn.textContent = label; }, 2000);
        })
        .catch(function () {
          btn.textContent = "Copy failed — try again";
          setTimeout(function () { btn.textContent = label; }, 2500);
        });
    });
  })();
</script>
```

The `id` and `data-agno-action` hooks are stable so PostHog Actions can target
the button post-launch (no analytics SDK calls in the markup).

## Files

- `agno-setup-wizard-prompt.md` — canonical prompt (source of truth).
- `build.js` — generator (`dist/` from the `.md`).
- `dist/mvp-prompt.txt` — raw MVP prompt fetched by the Webflow button (generated).
- `dist/prompt-data.js` — V2 prompt data + assembly (generated).
- `dist/webflow-embed.html` — V2 self-contained embed (Phase 4 — pending).
- `dist/analytics-hooks.md` — PostHog Action hook list (Phase 4 — pending).
- `AgnoSetupWizardCTA.jsx` — design reference only (not shipped).
