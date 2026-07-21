#!/usr/bin/env node
/*
 * build.js — generates everything in dist/ from the canonical prompt.
 *
 * Source of truth: agno-setup-wizard-prompt.md
 * Sync direction is ALWAYS repo -> everywhere. Never hand-edit dist/.
 *
 * The canonical file has two zones (split on the "BUILD DATA" comment marker):
 *   1. Preamble  — the shared teaching prompt, copied into every target's prompt.
 *   2. Build data — the cloud target list, the per-cloud setup instruction
 *      (with an AGENTOS_REPO placeholder), and the "start local" instruction.
 *
 * A per-target prompt = preamble + blank line + that target's instruction.
 *
 * Emits:
 *   dist/mvp-prompt.txt  — raw "start local" prompt for the single MVP copy button
 *   dist/prompt-data.js  — preamble + per-target tails + buildPrompt() for the V2 selector
 *
 * Run: node build.js   (or: npm run build)  — zero dependencies, pure Node.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const SOURCE = path.join(ROOT, "agno-setup-wizard-prompt.md");
const DIST = path.join(ROOT, "dist");
const REPO_BASE = "https://github.com/agno-agi/";
const START_LOCAL_ID = "start-local";

function fail(msg) {
  console.error("build.js: " + msg);
  process.exit(1);
}

if (!fs.existsSync(SOURCE)) fail("canonical source not found: " + SOURCE);
const raw = fs.readFileSync(SOURCE, "utf8");

/* 1. Body = everything after the first horizontal rule. ------------------- */
const lines = raw.split(/\r?\n/);
const firstRule = lines.findIndex((l) => l.trim() === "---");
if (firstRule === -1) fail("could not find the opening '---' rule in the source");
const body = lines.slice(firstRule + 1).join("\n");

/* 2. Split preamble (copied) from build data (consumed, not copied). ------ */
const dataMarker = body.search(/^<!--\s*=+/m);
if (dataMarker === -1) fail("could not find the '<!-- ===' BUILD DATA marker");
const preamble = body.slice(0, dataMarker).trim() + "\n";
const dataZone = body.slice(dataMarker);

/* 3. Parse the build-data section. ---------------------------------------- */
function sectionBody(text, heading) {
  const idx = text.indexOf(heading);
  if (idx === -1) fail("missing build-data section: " + heading);
  const after = text.slice(idx + heading.length);
  const stop = after.search(/\n(#{2,3}\s|<!--)/);
  return (stop === -1 ? after : after.slice(0, stop)).trim();
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Cloud target list: "- **Label**: agentos-repo"
const cloudBlock = sectionBody(dataZone, "### Cloud targets");
const cloudRe = /^-\s+\*\*(.+?)\*\*:\s*(\S+)\s*$/gm;
const clouds = [];
let m;
while ((m = cloudRe.exec(cloudBlock)) !== null) {
  clouds.push({ id: slugify(m[1]), label: m[1], repo: m[2] });
}
if (clouds.length === 0) fail("parsed zero cloud targets — check the '- **Label**: repo' format");

const cloudInstruction = sectionBody(dataZone, "### Cloud setup instruction");
if (!/AGENTOS_REPO/.test(cloudInstruction)) fail("cloud setup instruction is missing the AGENTOS_REPO placeholder");
const localInstruction = sectionBody(dataZone, "### Start local (not sure yet)");

/* 4. Assemble per-target tails, then full prompts. ------------------------ */
const targets = clouds.map((c) => ({
  id: c.id,
  label: c.label,
  repo: c.repo,
  cloud: true,
  tail: cloudInstruction.replace(/AGENTOS_REPO/g, c.repo),
}));
targets.push({
  id: START_LOCAL_ID,
  label: "Not sure yet",
  repo: null,
  cloud: false,
  tail: localInstruction,
});

function assemble(tail) {
  return preamble + "\n" + tail + "\n";
}

/* 5. Version stamp. ------------------------------------------------------- */
const hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 12);
const generatedAt = new Date().toISOString();

/* 6. Emit dist/mvp-prompt.txt — the raw "start local" prompt (no header). -- */
fs.mkdirSync(DIST, { recursive: true });
const mvpPrompt = assemble(targets.find((t) => t.id === START_LOCAL_ID).tail);
fs.writeFileSync(path.join(DIST, "mvp-prompt.txt"), mvpPrompt);

/* 7. Emit dist/prompt-data.js — preamble + per-target tails + buildPrompt. */
const data = {
  version: hash,
  generatedAt: generatedAt,
  repoBase: REPO_BASE,
  startLocalId: START_LOCAL_ID,
  preamble: preamble,
  targets: targets,
};

const js =
  "/*\n" +
  " * prompt-data.js — GENERATED, do not hand-edit.\n" +
  " * Source of truth: agno-setup-wizard-prompt.md\n" +
  " * Regenerate: npm run build  (node build.js)\n" +
  " * Generated: " + generatedAt + "  |  content hash: " + hash + "\n" +
  " *\n" +
  " * Usage (browser):\n" +
  " *   window.AgnoWizardPrompt.targets                 // [{id,label,repo,cloud,tail}]\n" +
  " *   window.AgnoWizardPrompt.buildPrompt('railway')  // full prompt for a target\n" +
  " *   window.AgnoWizardPrompt.buildPrompt()           // -> 'start-local' default\n" +
  " */\n" +
  "(function (root) {\n" +
  "  var DATA = " + JSON.stringify(data, null, 2).replace(/\n/g, "\n  ") + ";\n\n" +
  "  // A target's full prompt = shared preamble + that target's instruction.\n" +
  "  // Unknown/empty id falls back to the 'start local' default.\n" +
  "  function buildPrompt(targetId) {\n" +
  "    var id = targetId || DATA.startLocalId;\n" +
  "    var target = null;\n" +
  "    for (var i = 0; i < DATA.targets.length; i++) {\n" +
  "      if (DATA.targets[i].id === id) { target = DATA.targets[i]; break; }\n" +
  "    }\n" +
  "    if (!target) {\n" +
  "      for (var j = 0; j < DATA.targets.length; j++) {\n" +
  "        if (DATA.targets[j].id === DATA.startLocalId) { target = DATA.targets[j]; break; }\n" +
  "      }\n" +
  "    }\n" +
  "    return DATA.preamble + '\\n' + target.tail + '\\n';\n" +
  "  }\n\n" +
  "  var API = {\n" +
  "    version: DATA.version,\n" +
  "    generatedAt: DATA.generatedAt,\n" +
  "    repoBase: DATA.repoBase,\n" +
  "    startLocalId: DATA.startLocalId,\n" +
  "    preamble: DATA.preamble,\n" +
  "    targets: DATA.targets,\n" +
  "    buildPrompt: buildPrompt\n" +
  "  };\n" +
  "  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }\n" +
  "  root.AgnoWizardPrompt = API;\n" +
  "})(typeof window !== 'undefined' ? window : this);\n";

fs.writeFileSync(path.join(DIST, "prompt-data.js"), js);

/* ------------------------------------------------------------------------- */
console.log("build.js: wrote dist/ from agno-setup-wizard-prompt.md");
console.log("  content hash : " + hash);
console.log("  targets      : " + targets.map((t) => t.id).join(", "));
console.log("  dist/mvp-prompt.txt  (" + mvpPrompt.length + " bytes, raw 'start local' prompt)");
console.log("  dist/prompt-data.js  (" + js.length + " bytes)");
