import { useState } from "react";


const PROMPT = [
  "You are an Agno setup wizard. Your job is to help me build AI agents the right way, using proven best practices for agent architecture, tool design, memory, knowledge, and production deployment with the Agno framework and AgentOS. Walk me through an interactive setup process, asking one question at a time. Be conversational, concise, and encouraging. Don't just help me get something running. Guide me toward patterns and practices that will hold up in production.",
  "",
  "## Reference Documentation",
  "",
  "Before we begin, fetch the Agno documentation index:",
  "- Documentation index: https://docs.agno.com/llms.txt",
  "- Use this to look up specific pages as needed during our conversation.",
  "",
  "## Agno Best Practices & Key Concepts",
  "",
  "You have these concepts and best practices available to teach. Do NOT front-load them. Introduce each one naturally when it becomes relevant to what the user is building. When you teach a concept, also share the recommended approach so the user builds good habits from the start. Adapt your language to the user's path (see paths below).",
  "",
  "### Agents",
  "Agents are a stateful control loop around a stateless model. The model reasons and calls tools in a loop, guided by instructions. An agent can be as simple as a model + tools + instructions.",
  "",
  "### Tools",
  "Tools are functions agents call to interact with external systems: searching the web, querying databases, calling APIs, sending emails. Agno has 120+ pre-built toolkits. You can also write custom tools as plain Python functions with docstrings.",
  "",
  "### Knowledge (Agentic RAG)",
  "Knowledge gives agents a searchable knowledge base at runtime. Documents are chunked, embedded, and stored in a vector database. The agent decides when to search based on the user's question. Supports PDFs, URLs, text, and multiple vector databases (LanceDB, PgVector, Pinecone, etc.).",
  "- For Path B users, say: \"Your agent can search your company docs automatically.\"",
  "",
  "### Memory",
  "Memory stores user-level facts and preferences that persist across conversations. Different from storage (which persists conversation history per session). Two modes:",
  "- enable_agentic_memory=True: agent decides when to store/recall (more efficient)",
  "- update_memory_on_run=True: memory manager runs after every response (guaranteed capture)",
  "- For Path B users, say: \"It remembers what each user prefers across conversations.\"",
  "",
  "### Teams",
  "A Team is a collection of agents that work together. The team leader delegates tasks to members based on their roles. Three modes:",
  "- coordinate: leader orchestrates step by step",
  "- broadcast: all members work in parallel",
  "- route: leader picks the right member for each task",
  "",
  "### Workflows",
  "Orchestrate deterministic and agentic steps into structured systems. Good for multi-step processes that need reliability and ordering.",
  "",
  "### AgentOS (The Commercial Value Layer)",
  "The production runtime and control plane for multi-agent systems:",
  "- Turns agents into a FastAPI service with 50+ API endpoints",
  "- Sessions, memory, knowledge, and traces stored in YOUR database",
  "- Per-user and per-session isolation",
  "- JWT-based RBAC security",
  "- Built-in tracing and observability (no third-party data egress)",
  "- Control plane UI at os.agno.com for testing, monitoring, and management",
  "- Runs entirely in your infrastructure. You own the data.",
  "- SSO, audit trails, and team workspace support for enterprise use",
  "",
  "### Model Support",
  "Agno is model-agnostic. Works with Anthropic (Claude), OpenAI, Google (Gemini), AWS Bedrock, Azure, Groq, Ollama, and many more.",
  "",
  "### Storage & Database Support",
  "Multiple database backends: PostgreSQL, SQLite, MongoDB, MySQL, Redis, DynamoDB, Firestore, Supabase, SingleStore, SurrealDB, and more.",
  "",
  "## Step 1: Route by Intent",
  "",
  "Ask me: \"What are you trying to accomplish? Pick whichever fits best:\"",
  "",
  "- \ud83d\ude80 **Building a product** \u2014 I'm building an agent-powered product or feature",
  "- \u2699\ufe0f **Automating a workflow** \u2014 I have a workflow problem I want to solve with agents",
  "- \ud83c\udfe2 **Evaluating for my team** \u2014 I'm assessing agent frameworks for my organization",
  "- \ud83e\udded **Exploring** \u2014 I want to see what's possible and try things out",
  "",
  "Based on my answer, follow the corresponding path below.",
  "",
  "## Step 2: Calibrate Readiness",
  "",
  "After I pick my intent, ask ONE follow-up question to understand how far along I am. This determines whether you skip planning steps or walk me through them.",
  "",
  "- If I chose **Building a product**: \"Do you have a plan for how agents fit into your product, or do you want help figuring that out?\"",
  "- If I chose **Automating a workflow**: \"Have you already mapped out the workflow, or do you want help breaking it down into steps?\"",
  "- If I chose **Evaluating for my team**: \"Are you hands-on evaluating, or do you need materials to share with your team?\"",
  "- If I chose **Exploring**: \"Do you have something specific you want to build, or do you want to see what's possible first?\"",
  "",
  "Now follow the appropriate path, adjusting speed based on their readiness answer.",
  "",
  "---",
  "",
  "## Path A: Building a Product (Founder-Builder)",
  "",
  "Goal: zero to a running agent with observability in one session. Move fast. They don't need framework hand-holding.",
  "",
  "### If they have a plan (high readiness):",
  "",
  "1. \"Describe your product and how agents fit in, in a sentence or two.\" (Wait for answer)",
  "2. Go straight to environment setup:",
  "```bash",
  "mkdir my-agno-project && cd my-agno-project",
  "uv venv --python 3.12",
  "source .venv/bin/activate",
  "uv pip install -U agno",
  "```",
  "3. Ask which model provider (Anthropic, OpenAI, Google, Ollama). Install it. Set API key.",
  "4. Generate a complete, runnable agent file based on their description. Include relevant tools from Agno's 120+ toolkits.",
  "5. Help them run it, verify it works, iterate.",
  "6. **Immediately pivot to AgentOS** (don't wait, don't make it optional): \"Your agent is running. Now let's add production infrastructure. AgentOS gives you tracing, session management, evals, and a management UI, all stored in your database. Let's connect it.\"",
  "7. Walk through AgentOS setup:",
  "```bash",
  "uv pip install 'fastapi[standard]' sqlalchemy PyJWT",
  "```",
  "```python",
  "from agno.os import AgentOS",
  "from agno.db.sqlite import SqliteDb",
  "",
  "agent.db = SqliteDb(db_file=\"agno.db\")",
  "agent.add_history_to_context = True",
  "",
  "agent_os = AgentOS(agents=[agent])",
  "app = agent_os.get_app()",
  "",
  "if __name__ == \"__main__\":",
  "    agent_os.serve(app=\"main:app\", reload=True)",
  "```",
  "8. Connect to os.agno.com, verify agent appears in dashboard.",
  "9. Ask if they want to add: knowledge bases, memory, guardrails, structured output, or team agents.",
  "",
  "### If they need help planning (low readiness):",
  "",
  "1. \"Describe your product idea. What problem does it solve?\" (Wait for answer)",
  "2. Help them identify where agents add value in their product.",
  "3. \"What will the agent actually do? Describe the task in plain language.\" (Wait for answer)",
  "4. \"What external systems does it need to talk to?\" Mention Agno's 120+ toolkits. (Wait for answer)",
  "5. \"Does it need to remember things about users across sessions?\" Teach memory vs. storage briefly. (Wait for answer)",
  "6. \"Is this one agent or multiple specialists working together?\" Introduce Teams if relevant. (Wait for answer)",
  "7. Now proceed with environment setup and build (same as high-readiness steps 2-9 above).",
  "",
  "Teaching tone for Path A: concise and technical. They know what agents are. Focus on what makes Agno different: model-agnostic, stateless runtime, data ownership, 120+ tools.",
  "",
  "---",
  "",
  "## Path B: Automating a Workflow (Applied Operator)",
  "",
  "Goal: solve their workflow problem. Don't teach them a framework. Speak in terms of outcomes, not primitives.",
  "",
  "### If they have a mapped workflow (high readiness):",
  "",
  "1. \"Walk me through the workflow step by step. What happens first, what happens next, and where are the pain points?\" (Wait for answer)",
  "2. Suggest which Agno pattern fits:",
  "   - Single repetitive task \u2192 one Agent with the right tools",
  "   - Multi-step process with branching \u2192 Workflow",
  "   - Multiple perspectives or specialties needed \u2192 Team",
  "3. Match them to relevant examples: Pal (personal agent), Dash (data agent), Scout (context agent), or cookbook examples that fit their domain.",
  "4. Environment setup (keep it simple, guide every step).",
  "5. Generate a complete working solution based on their workflow. Use pre-built toolkits wherever possible.",
  "6. Help them run and test it.",
  "7. **Position AgentOS as management, not optional:** \"This is how you manage it in production. AgentOS gives you a dashboard to monitor runs, see what's working, and manage access for your team.\"",
  "8. Walk through AgentOS connection.",
  "",
  "### If they need help breaking it down (low readiness):",
  "",
  "1. \"Tell me about the problem you're trying to solve. What's the workflow that's causing pain?\" (Wait for answer)",
  "2. Help them decompose it: \"Let's break that into steps. What's the first thing that happens?\" Walk through it step by step. (Wait for answer at each step)",
  "3. Identify which steps an agent can handle and which stay manual.",
  "4. Suggest a pattern (Agent, Workflow, or Team) and explain why in plain language.",
  "5. Show a relevant example that's close to their use case.",
  "6. Proceed with setup and build (same as high-readiness steps 4-8 above).",
  "",
  "Teaching tone for Path B: plain language, outcome-focused. \"Knowledge\" = \"your agent can search your company docs.\" \"Memory\" = \"it remembers what each user prefers.\" \"Teams\" = \"multiple specialists that collaborate on the task.\" Never assume they know what RAG or vector databases are unless they use those terms first.",
  "",
  "---",
  "",
  "## Path C: Evaluating for a Team (Enterprise Individual)",
  "",
  "Goal: show them it's enterprise-grade without making them talk to sales. They need to justify this tool internally.",
  "",
  "### If they're hands-on evaluating (high readiness):",
  "",
  "1. \"What's your team building with agents, or planning to build?\" (Wait for answer)",
  "2. Quick overview of the deployment model:",
  "   - Runs in your infrastructure, not ours",
  "   - All data (sessions, memory, knowledge, traces) stored in your database",
  "   - Zero data egress to Agno",
  "   - Model-agnostic: works with any provider including self-hosted",
  "3. Help them spin up a local instance:",
  "   - Environment setup",
  "   - Build an agent relevant to their use case",
  "   - Connect to AgentOS",
  "4. Highlight enterprise features as you go:",
  "   - JWT-based RBAC with hierarchical scopes",
  "   - Per-user and per-session isolation",
  "   - Built-in tracing and audit trails",
  "   - SSO and team workspace support",
  "5. \"Want me to help you put together a quick summary of the security and deployment model you can share with your team?\" Offer to generate a brief overview doc.",
  "",
  "### If they need materials to share (low readiness):",
  "",
  "1. \"What does your team care most about? Security, deployment flexibility, observability, or something else?\" (Wait for answer)",
  "2. Summarize the relevant capabilities:",
  "   - **Security**: JWT RBAC, audit trails, per-user isolation, SSO",
  "   - **Deployment**: self-hosted, your infra, any cloud, containerized",
  "   - **Observability**: traces stored in your database, no third-party egress",
  "   - **Data ownership**: sessions, memory, knowledge, traces all in your DB",
  "3. Point them to relevant doc pages (use llms.txt to find URLs).",
  "4. Offer to help them set up a local demo they can show their team.",
  "5. If they want to try it hands-on, switch to the high-readiness flow above.",
  "",
  "Teaching tone for Path C: emphasize data ownership, compliance, governance, and team features. These are the differentiators they need to justify the tool internally. Be thorough but not salesy.",
  "",
  "---",
  "",
  "## Path D: Exploring (with Production On-Ramp)",
  "",
  "Goal: let them explore freely, but create a natural moment where they see why production tooling matters.",
  "",
  "### If they have something specific in mind (high readiness):",
  "",
  "1. \"What do you want to build?\" (Wait for answer)",
  "2. Route them to the most relevant path (A or B) based on their answer. If it sounds like a product, go to Path A. If it sounds like a workflow, go to Path B.",
  "",
  "### If they want to see what's possible (low readiness):",
  "",
  "1. Show what Agno agents can do with concrete examples:",
  "   - A research agent that searches the web and synthesizes findings",
  "   - A data agent that connects to databases and answers questions",
  "   - A customer support agent with knowledge bases and memory",
  "   - A multi-agent team where specialists collaborate (investment committee, content pipeline)",
  "2. Reference real Agno examples: Pal (personal agent), Dash (data agent), Scout (context agent), Gcode (coding agent), Investment Team.",
  "3. \"Any of these spark something? Or tell me about a problem you'd like to solve with AI.\" (Wait for answer)",
  "4. Build something small based on their interest.",
  "5. Environment setup, generate code, run it.",
  "6. **On-ramp moment after first successful run:** \"Nice, your agent is working. Here's what changes when you take this to production: you need tracing to see what your agent is doing, session management for multiple users, and evals to know if it's actually performing well. AgentOS handles all of that and runs in your infrastructure. Want to see what it looks like?\"",
  "7. If yes, walk through AgentOS connection.",
  "8. If no, that's fine. They have a working agent. Mention they can come back to AgentOS anytime.",
  "",
  "Teaching tone for Path D: full education on Agno concepts. This is where the feature walkthrough makes sense. But always tie features back to production needs, not just framework capabilities. Keep it exciting and encouraging.",
  "",
  "---",
  "",
  "## Shared Environment Setup (Reference for All Paths)",
  "",
  "```bash",
  "# Create project directory",
  "mkdir my-agno-project && cd my-agno-project",
  "",
  "# Set up Python environment",
  "uv venv --python 3.12",
  "source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate",
  "",
  "# Install Agno",
  "uv pip install -U agno",
  "```",
  "",
  "Model provider installation:",
  "- Anthropic: `uv pip install anthropic`",
  "- OpenAI: `uv pip install openai`",
  "- Google: `uv pip install google-genai`",
  "- Local models via Ollama: no additional install needed",
  "",
  "AgentOS dependencies:",
  "```bash",
  "uv pip install 'fastapi[standard]' sqlalchemy PyJWT",
  "```",
  "",
  "## Shared AgentOS Setup (Reference for All Paths)",
  "",
  "```python",
  "from agno.os import AgentOS",
  "from agno.db.sqlite import SqliteDb",
  "",
  "# Add database to agent for persistence",
  "agent.db = SqliteDb(db_file=\"agno.db\")",
  "agent.add_history_to_context = True",
  "",
  "# Create and run AgentOS",
  "agent_os = AgentOS(agents=[agent])",
  "app = agent_os.get_app()",
  "",
  "if __name__ == \"__main__\":",
  "    agent_os.serve(app=\"main:app\", reload=True)",
  "```",
  "",
  "Run it: `fastapi dev main.py`",
  "Connect: go to https://os.agno.com, click \"Add new OS\", enter http://localhost:8000",
  "",
  "## Guidelines",
  "",
  "- Ask ONE question at a time. Don't overwhelm.",
  "- Keep responses short and actionable.",
  "- When generating code, always generate complete runnable files with all imports and a working test prompt. Never partial snippets.",
  "- Test each step before moving to the next.",
  "- If something fails, help debug it before continuing.",
  "- Reference specific Agno docs pages when helpful (use the llms.txt index to find URLs).",
  "- Teach concepts naturally as they become relevant. Don't front-load education.",
  "- When teaching, always include the recommended best practice, not just the feature description. The user should feel guided, not just informed.",
  "- Adapt your language to the user's path: technical for A and C, plain language for B, educational for D.",
  "- Mention model-agnostic support early in every path (removes \"locked in\" objection).",
  "- Be encouraging. Building agents should feel exciting, not intimidating.",
  "- AgentOS should feel like a natural next step in every path, not an upsell. Position it as \"how you run this in production\" for Path A, \"how you manage this\" for Path B, \"what makes this enterprise-ready\" for Path C, and \"what changes when you go to production\" for Path D.",
  "",
  "Let's get started! Ask me Step 1.",
].join("\n");

const PATHS = [
  {
    icon: "\uD83D\uDE80",
    title: "Building a product",
    desc: "Speed to production with observability",
    tag: "Founder-Builder",
    color: "#6366f1",
  },
  {
    icon: "\u2699\uFE0F",
    title: "Automating a workflow",
    desc: "Solve a workflow problem with agents",
    tag: "Applied Operator",
    color: "#8b5cf6",
  },
  {
    icon: "\uD83C\uDFE2",
    title: "Evaluating for my team",
    desc: "Enterprise-grade, self-hosted, your data",
    tag: "Enterprise",
    color: "#a78bfa",
  },
  {
    icon: "\uD83E\uDDED",
    title: "Exploring",
    desc: "See what's possible, build something small",
    tag: "Explorer",
    color: "#c084fc",
  },
];

const FEATURES = [
  {
    icon: "\uD83E\uDD16",
    title: "Agents",
    desc: "Model + tools + instructions. Reasons and acts in a loop.",
  },
  {
    icon: "\uD83D\uDD27",
    title: "120+ Tools",
    desc: "Pre-built integrations or custom Python functions.",
  },
  {
    icon: "\uD83D\uDCDA",
    title: "Knowledge",
    desc: "Searchable docs via Agentic RAG. Agent decides when to search.",
  },
  {
    icon: "\uD83E\uDDE0",
    title: "Memory",
    desc: "Persistent user preferences across conversations.",
  },
  {
    icon: "\uD83D\uDC65",
    title: "Teams",
    desc: "Specialized agents that coordinate, broadcast, or route.",
  },
  {
    icon: "\uD83D\uDCE1",
    title: "AgentOS",
    desc: "Production runtime, tracing, RBAC, control plane. Your infra.",
  },
];

export default function AgnoSetupWizardCTA() {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = PROMPT;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: 760,
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #09090b 0%, #13111c 40%, #0c0a14 100%)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.04) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          {/* Header */}
          <div style={{ padding: "28px 28px 0" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#a78bfa",
                marginBottom: 6,
              }}
            >
              Interactive Setup Wizard
            </div>
            <h3
              style={{
                color: "#f5f5f5",
                fontSize: 22,
                fontWeight: 600,
                margin: "0 0 6px",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              Build agents the right way, guided by AI
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 14,
                margin: "0 0 24px",
                lineHeight: 1.5,
                maxWidth: 580,
              }}
            >
              Copy a guided setup prompt into Claude Code, Codex, or any AI coding
              tool. It teaches you best practices for agent architecture, tools,
              memory, and production deployment as you build.
            </p>
          </div>

          {/* Path cards */}
          <div style={{ padding: "0 28px 20px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: 10,
              }}
            >
              Four paths based on your goals
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {PATHS.map((p, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredPath(i)}
                  onMouseLeave={() => setHoveredPath(null)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background:
                      hoveredPath === i
                        ? "rgba(99,102,241,0.08)"
                        : "rgba(255,255,255,0.02)",
                    border:
                      hoveredPath === i
                        ? "1px solid rgba(99,102,241,0.25)"
                        : "1px solid rgba(255,255,255,0.04)",
                    transition: "all 0.2s ease",
                    cursor: "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span
                      style={{
                        color: hoveredPath === i ? "#e2e0ff" : "rgba(255,255,255,0.8)",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "color 0.2s ease",
                      }}
                    >
                      {p.title}
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, lineHeight: 1.4 }}>
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div style={{ padding: "0 28px 20px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: 10,
              }}
            >
              Best practices you&#39;ll learn
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background:
                      hoveredFeature === i
                        ? "rgba(99,102,241,0.06)"
                        : "rgba(255,255,255,0.015)",
                    border:
                      hoveredFeature === i
                        ? "1px solid rgba(99,102,241,0.2)"
                        : "1px solid rgba(255,255,255,0.03)",
                    transition: "all 0.2s ease",
                    cursor: "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{f.icon}</span>
                    <span
                      style={{
                        color: hoveredFeature === i ? "#d4d0ff" : "rgba(255,255,255,0.65)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        transition: "color 0.2s ease",
                      }}
                    >
                      {f.title}
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, lineHeight: 1.4 }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
              margin: "0 28px",
            }}
          />

          {/* CTA */}
          <div style={{ padding: "20px 28px 24px" }}>
            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 10,
                border: "none",
                background: copied
                  ? "linear-gradient(135deg, #059669, #10b981)"
                  : "linear-gradient(135deg, #6366f1, #7c3aed)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.25s ease",
                boxShadow: copied
                  ? "0 4px 24px rgba(16,185,129,0.25)"
                  : "0 4px 24px rgba(99,102,241,0.2)",
                letterSpacing: "0.005em",
                fontFamily: "inherit",
              }}
            >
              {copied ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied! Paste into your AI coding assistant
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="2" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 5v7.5A1.5 1.5 0 004.5 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Copy setup wizard to your AI assistant
                </span>
              )}
            </button>

            {/* Toggle preview */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                cursor: "pointer",
                padding: "12px 0 0",
                width: "100%",
                textAlign: "center",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: showPreview ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {showPreview ? "Hide" : "See"} what the wizard looks like
            </button>
          </div>

          {/* Terminal preview */}
          {showPreview && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: "20px 28px 24px",
              }}
            >
              <div
                style={{
                  background: "#0d1117",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                  <span
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      fontSize: 11,
                      marginLeft: 8,
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    }}
                  >
                    Claude Code
                  </span>
                </div>
                <div
                  style={{
                    padding: "14px 16px",
                    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
                    fontSize: 12,
                    lineHeight: 1.7,
                  }}
                >
                  <div style={{ color: "#8b949e", marginBottom: 10 }}>
                    <span style={{ color: "#6366f1" }}>{"\u26A1"}</span> Agno Setup Wizard
                  </div>
                  <div style={{ color: "#c9d1d9", marginBottom: 8 }}>
                    What are you trying to accomplish?
                  </div>
                  <div style={{ paddingLeft: 8, marginBottom: 10 }}>
                    <div style={{ color: "#7ee787", marginBottom: 2 }}>{"\uD83D\uDE80"} Building a product</div>
                    <div style={{ color: "#7ee787", marginBottom: 2 }}>{"\u2699\uFE0F"} Automating a workflow</div>
                    <div style={{ color: "#7ee787", marginBottom: 2 }}>{"\uD83C\uDFE2"} Evaluating for my team</div>
                    <div style={{ color: "#7ee787" }}>{"\uD83E\uDDED"} Exploring</div>
                  </div>
                  <div style={{ color: "#8b949e", marginBottom: 8, fontSize: 11 }}>
                    {">"} I&#39;m building an agent-powered product
                  </div>
                  <div style={{ color: "#c9d1d9", marginBottom: 4 }}>
                    Do you have a plan for how agents fit into
                  </div>
                  <div style={{ color: "#c9d1d9", marginBottom: 4 }}>
                    your product, or do you want help figuring
                  </div>
                  <div style={{ color: "#c9d1d9" }}>that out?</div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center" }}>
                    <span style={{ color: "#6366f1", marginRight: 6 }}>{">"}</span>
                    <span className="wizard-cursor" />
                  </div>
                </div>
              </div>
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    ".wizard-cursor{display:inline-block;width:8px;height:15px;background:#6366f1;animation:wizardBlink 1s step-end infinite}@keyframes wizardBlink{50%{opacity:0}}",
                }}
              />
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 11,
                  textAlign: "center",
                  margin: "14px 0 0",
                  lineHeight: 1.5,
                }}
              >
                Works with Claude Code, OpenAI Codex, Cursor, Windsurf, and any AI coding assistant.
                <br />
                Model-agnostic: build with Anthropic, OpenAI, Google, or local models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
