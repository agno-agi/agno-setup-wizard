#!/usr/bin/env node
/*
 * build.js — generates everything in dist/ from the canonical prompt.
 *
 * Source of truth: agno-setup-wizard-prompt.md
 * Sync direction is ALWAYS repo -> everywhere. Never hand-edit dist/.
 *
 * Emits:
 *   dist/mvp-prompt.txt  — clean copy-paste block for the Webflow MVP copy button
 *   dist/prompt-data.js  — base prompt + per-path assembly logic for the V2 embed
 *
 * Run: node build.js   (or: npm run build)  — zero dependencies, pure Node.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const SOURCE = path.join(ROOT, "agno-setup-wizard-prompt.md");
const DIST = path.join(ROOT, "dist");

function fail(msg) {
  console.error("build.js: " + msg);
  process.exit(1);
}

if (!fs.existsSync(SOURCE)) fail("canonical source not found: " + SOURCE);

const raw = fs.readFileSync(SOURCE, "utf8");

/* ----------------------------------------------------------------------------
 * 1. Extract the prompt body.
 * The canonical file opens with a short editorial intro, then a horizontal rule
 * (`---`) on its own line, then the actual prompt. We take everything after the
 * FIRST such rule. The body itself contains `---` separators between paths, so
 * we must only split on the first one.
 * ------------------------------------------------------------------------- */
const lines = raw.split(/\r?\n/);
const firstRule = lines.findIndex((l) => l.trim() === "---");
if (firstRule === -1) fail("could not find the opening '---' rule in the source");

const body = lines.slice(firstRule + 1).join("\n").trim() + "\n";

/* ----------------------------------------------------------------------------
 * 2. Parse the Step 1 path list so per-path metadata stays single-sourced.
 * Each option looks like:
 *   - 🚀 **Building a product** — I'm building an agent-powered product or feature
 * ------------------------------------------------------------------------- */
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePaths(text) {
  const step1 = text.indexOf("## Step 1");
  if (step1 === -1) fail("could not find '## Step 1' to parse the path list");
  const after = text.slice(step1);
  // Stop at the next heading so we only read Step 1's bullets.
  const block = after.split(/\n##\s/)[0];
  const re = /^-\s+(\S+)\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+?)\s*$/gmu;
  const paths = [];
  let m;
  let i = 0;
  while ((m = re.exec(block)) !== null) {
    paths.push({
      id: slugify(m[2]),
      emoji: m[1],
      label: m[2],
      description: m[3],
      letter: String.fromCharCode(65 + i), // A, B, C, D
    });
    i++;
  }
  if (paths.length === 0) fail("parsed zero paths from Step 1 — check the bullet format");
  return paths;
}

const paths = parsePaths(body);

/* ----------------------------------------------------------------------------
 * 3. Version stamp: content hash so downstream artifacts are traceable.
 * ------------------------------------------------------------------------- */
const hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 12);
const generatedAt = new Date().toISOString();

/* ----------------------------------------------------------------------------
 * 4. Emit dist/mvp-prompt.txt
 * RAW prompt only — no header, no comments, no fences. The Webflow copy button
 * fetches this file and the end user copies its contents verbatim into their AI
 * assistant, so the body must contain nothing but the prompt itself. The sync
 * rule / regenerate-and-tag workflow is documented in the README, not here.
 * ------------------------------------------------------------------------- */
fs.mkdirSync(DIST, { recursive: true });

fs.writeFileSync(path.join(DIST, "mvp-prompt.txt"), body);

/* ----------------------------------------------------------------------------
 * 5. Emit dist/prompt-data.js
 * Browser-loadable (window.AgnoWizardPrompt) and CommonJS-loadable. Carries the
 * base prompt + path metadata + buildPrompt(pathId) assembly for the V2 embed.
 * ------------------------------------------------------------------------- */
const data = {
  version: hash,
  generatedAt: generatedAt,
  paths: paths,
  basePrompt: body,
};

const js =
  "/*\n" +
  " * prompt-data.js — GENERATED, do not hand-edit.\n" +
  " * Source of truth: agno-setup-wizard-prompt.md\n" +
  " * Regenerate: npm run build  (node build.js)\n" +
  " * Generated: " + generatedAt + "  |  content hash: " + hash + "\n" +
  " *\n" +
  " * Usage (browser):\n" +
  " *   window.AgnoWizardPrompt.buildPrompt('" + paths[0].id + "')\n" +
  " *   window.AgnoWizardPrompt.paths  // [{id, emoji, label, description, letter}]\n" +
  " */\n" +
  "(function (root) {\n" +
  "  var DATA = " + JSON.stringify(data, null, 2).replace(/\n/g, "\n  ") + ";\n\n" +
  "  // Per-path assembly: returns the full prompt pre-routed to the chosen path.\n" +
  "  // Passing no/unknown pathId returns the unmodified base prompt (with Step 1).\n" +
  "  function buildPrompt(pathId) {\n" +
  "    var base = DATA.basePrompt;\n" +
  "    if (!pathId) return base;\n" +
  "    var path = null;\n" +
  "    for (var i = 0; i < DATA.paths.length; i++) {\n" +
  "      if (DATA.paths[i].id === pathId) { path = DATA.paths[i]; break; }\n" +
  "    }\n" +
  "    if (!path) return base;\n" +
  "    var preface =\n" +
  "      'The user has already selected their path: ' + path.label +\n" +
  "      ' (Path ' + path.letter + '). Skip Step 1 (Route by Intent) entirely — do not ' +\n" +
  "      'ask them to pick an option. Acknowledge their choice in one line, then begin at ' +\n" +
  "      'Step 2 (Calibrate Readiness) for Path ' + path.letter + ' and follow that path ' +\n" +
  "      'for the rest of the session.\\n\\n';\n" +
  "    return preface + base;\n" +
  "  }\n\n" +
  "  var API = {\n" +
  "    version: DATA.version,\n" +
  "    generatedAt: DATA.generatedAt,\n" +
  "    paths: DATA.paths,\n" +
  "    basePrompt: DATA.basePrompt,\n" +
  "    buildPrompt: buildPrompt\n" +
  "  };\n" +
  "  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }\n" +
  "  root.AgnoWizardPrompt = API;\n" +
  "})(typeof window !== 'undefined' ? window : this);\n";

fs.writeFileSync(path.join(DIST, "prompt-data.js"), js);

/* ------------------------------------------------------------------------- */
console.log("build.js: wrote dist/ from agno-setup-wizard-prompt.md");
console.log("  content hash : " + hash);
console.log("  paths        : " + paths.map((p) => p.letter + "=" + p.id).join(", "));
console.log("  dist/mvp-prompt.txt  (" + body.length + " bytes, raw prompt)");
console.log("  dist/prompt-data.js  (" + js.length + " bytes)");
