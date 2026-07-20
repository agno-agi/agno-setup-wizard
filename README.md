# Agno Setup Wizard

A copyable prompt that guides users through standing up an **Agno** + **AgentOS**
agent platform. The prompt hands the user's coding agent off to an official Agno
**platform template repo** (per deploy target), whose README and `.agents/skills/`
drive setup — while a shared **teaching preamble** keeps the experience
educational (explain the *why*, one question at a time, adapt to level).

It ships in two forms:

1. **MVP** — a single "copy prompt" button on the Webflow marketing site. It
   copies the **"start local"** prompt (run locally with the Railway template,
   connect to os.agno.com, build a first agent; deploy later).
2. **V2** — an instrumented selector embed: the user picks a **deploy target**
   (Railway, AWS, GCP, Azure, Fly.io, Render, Modal, Kubernetes, Docker — or
   "Not sure yet"), and the copied prompt is tailored to that target's template.

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
| `dist/prompt-data.js` | Shared preamble + per-target metadata/tails + `buildPrompt(targetId)` assembly for the V2 selector. Loadable in the browser as `window.AgnoWizardPrompt` and via CommonJS. |

The build stamps each artifact with an ISO timestamp and a short content hash of
the prompt body so generated files are traceable to a source revision.

### `prompt-data.js` API

```js
window.AgnoWizardPrompt.version       // content hash string
window.AgnoWizardPrompt.targets       // [{ id, label, repo, cloud, tail }]
window.AgnoWizardPrompt.preamble      // shared teaching preamble (in every prompt)
window.AgnoWizardPrompt.startLocalId  // "start-local"
window.AgnoWizardPrompt.buildPrompt(targetId)
                                      // preamble + that target's instruction;
                                      // unknown/empty targetId → "start local" default
```

A full prompt for a target = `preamble` + that target's `tail`. Target IDs are
slugified from the canonical `.md` (`railway`, `aws`, `gcp`, `azure`, `fly-io`,
`render`, `modal`, `kubernetes`, `docker`, and `start-local`). Cloud targets carry
their `repo` (e.g. `agentos-railway`); `start-local` has `repo: null`.

## Publishing — jsDelivr from this public repo

The Webflow copy button **fetches** `dist/mvp-prompt.txt` from jsDelivr at runtime
rather than hard-coding it, so the repo stays the single source of truth and V2
can load `prompt-data.js` from the same place. (The "start local" prompt is now
~5 KB — small enough to inline — but fetching keeps one sync path for both MVP and
V2.) This requires the repo to be **public** — jsDelivr only serves public repos.

URLs (repo is `agno-agi/agno-setup-wizard`):

```
# Pinned to a release tag — PREFERRED (deterministic, no stale-cache surprises)
https://cdn.jsdelivr.net/gh/agno-agi/agno-setup-wizard@v2.0.0/dist/mvp-prompt.txt

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
4. Tag a new release, e.g. `v2.0.1` (GitHub → Releases → *Draft a new release*,
   or `git tag v2.0.1 && git push origin v2.0.1`).
5. Update the `@vX.Y.Z` in the Webflow button's fetch URL to the new tag.

> **Sync direction is always repo → Webflow.** Never edit the prompt in Webflow
> and never hand-edit `dist/`.

## Webflow MVP copy button

Drop this into a Webflow **Embed** element. It fetches the raw "start local" prompt
from jsDelivr and copies it to the clipboard. Bump the `@v2.0.0` tag when you publish
a new release.

```html
<button id="agno-copy-prompt" data-agno-action="copy-prompt"
        data-agno-src="https://cdn.jsdelivr.net/gh/agno-agi/agno-setup-wizard@v2.0.0/dist/mvp-prompt.txt">
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

- `agno-setup-wizard-prompt.md` — canonical prompt: shared preamble + build-data
  (cloud target list, per-cloud setup instruction, "start local" instruction).
- `build.js` — generator (`dist/` from the `.md`).
- `dist/mvp-prompt.txt` — raw "start local" prompt fetched by the Webflow button (generated).
- `dist/prompt-data.js` — per-target prompt data + `buildPrompt()` (generated).
- `template-prompt.md` — upstream reference: the cloud→template-repo clone lines (input).
- `RAILWAY-EXAMPLE-README.md` — reference: an example platform-template README (input).
- `dist/webflow-embed.html` — V2 self-contained selector embed (pending).
- `dist/analytics-hooks.md` — PostHog Action hook list (pending).
- `AgnoSetupWizardCTA.jsx` — design reference only (not shipped).
