/*
 * Domain 2 — Tool Design & MCP Integration  (~18% of exam)
 * Source: claudecertificationguide.com  (sections 2.1–2.5)
 *
 * Additively populates the shared globals for Domain 2 only:
 *   window.DOMAIN_DEEPDIVE.D2   — the "Domains" deep-dive view
 *   window.STUDY_CONTENT.D2     — the "Study Guide" view
 *   window.QUESTIONS (+= D2)    — the "Domain Quiz" / "Mock Exam" banks
 *   window.FLASHCARDS (+= D2)   — the "Flashcards" view
 *
 * Loads before app.js, which guards each global with `|| {}` / `|| []`.
 */
(function () {
  "use strict";

  window.DOMAIN_DEEPDIVE = window.DOMAIN_DEEPDIVE || {};
  window.STUDY_CONTENT = window.STUDY_CONTENT || {};
  window.QUESTIONS = window.QUESTIONS || [];
  window.FLASHCARDS = window.FLASHCARDS || [];

  // ==========================================================================
  // DEEP DIVE  — window.DOMAIN_DEEPDIVE.D2
  // ==========================================================================
  window.DOMAIN_DEEPDIVE.D2 = {
    number: 2,
    weight: "~18%",
    title: "Tool Design & MCP Integration",
    tagline: "Designing tool interfaces, error contracts, distribution, MCP servers, and built-in tool usage so agents select and recover reliably.",
    why: "Most tool-design failures are *interface* failures, not model failures. The exam rewards the **low-effort, high-leverage** fix every time: **better descriptions before routing classifiers, scoped access before full access, community servers before custom builds.** It also tests precise distinctions — access failure vs valid empty result, `auto`/`any`/forced `tool_choice`, project vs user MCP scope, and Grep (contents) vs Glob (paths).",

    sections: [
      // ---- 2.1 Tool Interface Design ------------------------------------
      {
        heading: "2.1 — Tool Interface Design",
        body: [
          { type: "p", text: "**Tool descriptions are the PRIMARY mechanism LLMs use for tool selection** — not supplementary metadata. The model reads the descriptions to decide which tool to call. Minimal descriptions like \"Retrieves customer information\" leave it unable to differentiate overlapping tools." },
          { type: "p", text: "A production-grade description includes five elements:" },
          { type: "bullets", items: [
            "**What the tool does** — its primary purpose, stated unambiguously.",
            "**What inputs it expects** — data types, formats, constraints, required vs optional fields.",
            "**Example queries it handles well** — concrete use cases that anchor understanding.",
            "**Edge cases and limitations** — what it does NOT do, and behaviour outside expected ranges.",
            "**Explicit boundaries** — when to use THIS tool vs similar tools in the same toolkit."
          ] },
          { type: "code", lang: "text", body: "// Minimal (causes misrouting)\nget_customer: \"Retrieves customer information\"\nlookup_order:  \"Retrieves order details\"\n\n// Production-grade (reliable selection)\nget_customer: \"Looks up a customer account by email, phone, or customer ID.\n  Returns profile (name, contact, account status, loyalty tier). Use to verify\n  who the customer is. Do NOT use for order queries — use lookup_order.\"\nlookup_order: \"Retrieves order details by order number (#NNNNN) or tracking ID.\n  Returns status, items, shipping, refund eligibility. Use for a specific order.\n  Do NOT use for identity verification — use get_customer.\"" },
          { type: "callout", kind: "key", text: "When misrouting occurs, the first fix is **always to improve descriptions** — not few-shot examples, not a routing classifier, not tool consolidation. The exam consistently favours low-effort, high-leverage fixes." },
          { type: "callout", kind: "warn", text: "Three wrong fixes for misrouting: **few-shot examples** (token overhead, treats symptoms), **routing classifier** (over-engineered first step; bypasses the model's NLU), and **tool consolidation** (valid long-term, but more effort than expanding descriptions). Also: **keyword-sensitive system-prompt wording** (e.g. \"always check customer details\") can silently override good tool descriptions — review prompts after editing descriptions." },
          { type: "p", text: "**Tool splitting**: replace a generic `analyze_document` with purpose-specific tools (`extract_data_points`, `summarize_content`, `verify_claim_against_source`), each with a narrow described purpose. **Tool renaming**: when two names are confusingly similar, rename (e.g. `analyze_content` → `extract_web_results`) to eliminate overlap at the interface level without changing implementation." }
        ]
      },

      // ---- 2.2 Structured Error Responses -------------------------------
      {
        heading: "2.2 — Structured Error Responses",
        body: [
          { type: "p", text: "When an MCP tool fails, its error response decides whether the agent recovers intelligently or flails. Generic messages like \"Operation failed\" are useless. The MCP protocol provides the **`isError` flag** to signal failure, so the model reasons about recovery rather than treating error text as a successful result." },
          { type: "p", text: "Every failure falls into one of **four categories**, each with a different recovery strategy:" },
          { type: "bullets", items: [
            "**Transient** (timeouts, service unavailable, rate limits) — request is valid; `isRetryable: true`, retry after a brief delay.",
            "**Validation** (bad format, missing fields, out-of-range) — request is malformed; `isRetryable: true`, fix the input and retry.",
            "**Business** (policy violations, limit exceedances) — technically valid but violates a rule; `isRetryable: false`, take an alternative path / escalate. Retrying always fails.",
            "**Permission** (access denied, bad credentials) — `isRetryable: false`, escalate or use different credentials."
          ] },
          { type: "code", lang: "json", body: "{\n  \"isError\": true,\n  \"content\": [{ \"type\": \"text\", \"text\": \"Refund exceeds policy limit\" }],\n  \"errorCategory\": \"business\",\n  \"isRetryable\": false,\n  \"description\": \"Refund of \\u00a3750 exceeds the \\u00a3500 automatic limit. Requires manager approval. Escalate to a human agent with the refund details.\"\n}" },
          { type: "callout", kind: "key", text: "**Access failure vs valid empty result** is the most-tested distinction in the domain. *Access failure*: the tool could not reach the data source (timeout/auth/down) → `isError: true`, maybe retry. *Valid empty result*: the query ran successfully and found nothing → `isError: false`, `resultCount: 0`, do NOT retry. Confusing them breaks recovery — an agent retrying a successful empty query is the canonical anti-pattern." },
          { type: "code", lang: "json", body: "// Valid empty result — NOT an error\n{ \"isError\": false,\n  \"content\": [{ \"type\": \"text\", \"text\": \"No customer found matching that email. Query ran successfully, no matches.\" }],\n  \"resultCount\": 0 }\n\n// Access failure — IS an error\n{ \"isError\": true,\n  \"content\": [{ \"type\": \"text\", \"text\": \"Could not reach customer database\" }],\n  \"errorCategory\": \"transient\", \"isRetryable\": true,\n  \"description\": \"Connection timed out after 5s. The query did not execute.\" }" },
          { type: "callout", kind: "warn", text: "**Multi-agent error propagation**: local recovery with selective propagation. Subagents retry transient failures locally; only propagate what can't be resolved locally; include partial results and what was attempted (\"3 of 5 sources succeeded; 4 and 5 timed out\"). Never silently suppress errors by returning empty results as success, and never terminate the whole workflow on a single failure." }
        ]
      },

      // ---- 2.3 Tool Distribution & Tool Choice --------------------------
      {
        heading: "2.3 — Tool Distribution & Tool Choice",
        body: [
          { type: "p", text: "The **number of tools** an agent has directly affects selection reliability. Giving one agent **18 tools** degrades selection; the **optimal range is 4–5 tools per agent, scoped to its role**. It's about relevance too: a synthesis agent with `web_search` may run its own searches instead of using provided results, duplicating work and wasting context. Each agent gets only the tools its role needs — nothing more." },
          { type: "p", text: "The **`tool_choice`** parameter has three settings:" },
          { type: "bullets", items: [
            "**`auto`** (default) — the model decides whether to call a tool or return text. For general operation needing conversational flexibility.",
            "**`any`** — the model MUST call a tool but chooses which. Guarantees structured output from one of several schemas (e.g. invoice/receipt/contract extraction when the type is unknown).",
            "**Forced** (`{type:'tool', name:'extract_metadata'}`) — the model MUST call a specific named tool. Enforces a mandatory first step; the model can't skip or reorder it. Switch to `auto` on later turns."
          ] },
          { type: "code", lang: "json", body: "{ \"tool_choice\": { \"type\": \"auto\" } }                         // model decides\n{ \"tool_choice\": { \"type\": \"any\" } }                          // must call some tool\n{ \"tool_choice\": { \"type\": \"tool\", \"name\": \"extract_metadata\" } } // must call this one" },
          { type: "callout", kind: "key", text: "Optimal is **4–5 tools per agent, scoped to its role**. For a high-frequency simple operation, add a **scoped cross-role tool** directly to the agent that needs it — this avoids coordinator round-trip latency for the common case." },
          { type: "p", text: "**Scoped cross-role tools**: routing every cross-role request through the coordinator adds 2–3 round trips and can raise latency 40%+. If a synthesis agent verifies simple facts often (85% are millisecond lookups), give it a scoped `verify_fact` for the simple case; complex verifications (multi-source, cross-referencing) still route through the coordinator." },
          { type: "callout", kind: "warn", text: "**Least privilege for tools**: replace a generic `fetch_url` (fetches anything) with a constrained `load_document` that validates document URLs only — prevents misuse, clarifies purpose, reduces side effects. And don't use `tool_choice:'auto'` when you require structured output (use `any` or forced)." }
        ]
      },

      // ---- 2.4 MCP Server Integration -----------------------------------
      {
        heading: "2.4 — MCP Server Integration",
        body: [
          { type: "p", text: "MCP servers connect Claude to external systems (databases, APIs, dev tools, issue trackers). Configuration exists at **two scopes**:" },
          { type: "bullets", items: [
            "**Project-level `.mcp.json`** — in the repo root, **version-controlled, shared** with everyone who clones/pulls. For servers the whole team needs (Jira, GitHub, internal connectors).",
            "**User-level `~/.claude.json`** — in the home directory, **personal, NOT version-controlled, NOT shared.** For experimental/personal servers you're testing before proposing to the team."
          ] },
          { type: "callout", kind: "key", text: "Project-level `.mcp.json` is version-controlled and shared; user-level `~/.claude.json` is personal and not shared. Use `${ENV_VAR}` syntax to keep credentials out of version control. All tools from all configured servers (both scopes) are discovered at connection time and available simultaneously — no manual activation step." },
          { type: "code", lang: "json", body: "{\n  \"mcpServers\": {\n    \"github\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-github\"],\n      \"env\": { \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\" }\n    }\n  }\n}" },
          { type: "p", text: "**Environment-variable expansion** (`${VARIABLE_NAME}`) keeps secrets out of git: the file references variable names, not values, so it's safe to commit; each developer sets their own tokens locally; token rotation needs no config change; no secrets leak through history." },
          { type: "p", text: "**MCP resources** expose content catalogs (issue summaries, documentation hierarchies, database schemas) to agents *without* exploratory tool calls. Instead of `list_tables` then `describe_table` per table, a schema resource makes that available immediately. Resources give *visibility* into data; tools let agents *act* on it." },
          { type: "callout", kind: "warn", text: "**Build vs use**: evaluate **community servers first** for standard integrations (Jira, GitHub, Slack, Linear, Notion). Build custom **only** for team-specific workflows, custom business logic, or proprietary systems with no community server. \"Evaluate community servers first\" is always correct for a standard integration. Also: **enhance sparse MCP tool descriptions** — otherwise the agent prefers built-in tools (like Grep) it understands better, even when the MCP tool is more capable." }
        ]
      },

      // ---- 2.5 Built-in Tools -------------------------------------------
      {
        heading: "2.5 — Built-in Tools",
        body: [
          { type: "p", text: "Claude Code provides six built-in tools: **Read, Write, Edit, Bash, Grep, Glob**. Using the wrong one wastes time, context tokens, or both." },
          { type: "callout", kind: "key", text: "The core distinction: **Grep searches file CONTENTS** (function callers, error messages, imports). **Glob matches file PATHS** by naming pattern (`**/*.test.tsx`, `**/config.*`). In one sentence: Grep finds what is INSIDE files; Glob finds files by their NAMES." },
          { type: "code", lang: "text", body: "// Grep — contents\nGrep: \"processLegacyOrder\"            // files that CALL the function\nGrep: \"import.*from 'utils/auth'\"     // files that import a module\n\n// Glob — paths\nGlob: \"**/*.test.tsx\"                  // all test files\nGlob: \"content/domains/**/*.mdx\"       // MDX files in a directory" },
          { type: "p", text: "**Read / Write / Edit**: `Edit` performs targeted modifications via unique text matching — fast and precise. If the `old_string` matches multiple places, Edit fails by design (a safety mechanism). The documented recovery is to **widen `old_string` with surrounding context** until it pins down one location, or set **`replace_all: true`** for a global change. **Read + Write** (load whole file, write it back) is the **last resort**, not the next step — it burns a file's worth of tokens for what's usually a one-line change." },
          { type: "callout", kind: "warn", text: "Two penalised escalations: defaulting to **Read + Write for every modification** (use Edit first), and **jumping straight to Read + Write the moment Edit reports a non-unique match** (widen the anchor or use `replace_all` first)." },
          { type: "p", text: "**Incremental codebase understanding**: never read all files upfront (a context-budget killer). Discover progressively — **Grep to find entry points → Read to follow imports and trace flows → Grep again to trace usage → Read only what each prior step justified.**" },
          { type: "callout", kind: "key", text: "The deprecation scenario: **Grep → Glob → Grep again.** Grep for the function name (direct callers + tests that import it), Glob for sibling test files (`**/OrderProcessor.test.*`) to catch tests that exercise it indirectly through the source module, then Grep for wrapper names to catch transitive coverage. Not Glob first — Glob matches paths, not contents." }
        ]
      }
    ],

    examFocus: [
      "Fixing tool misrouting by improving descriptions first — rejecting few-shot, routing classifiers, and consolidation as the first step.",
      "Writing production-grade descriptions (purpose, inputs, examples, edge cases, boundaries) and watching for system-prompt keyword conflicts.",
      "The four error categories and their isRetryable values; business/permission errors are never retryable.",
      "Access failure (isError:true) vs valid empty result (isError:false, resultCount:0) — and not retrying successful empty queries.",
      "4–5 tools per agent scoped to role; scoped cross-role tools to avoid coordinator round-trips.",
      "tool_choice auto vs any vs forced — and using any/forced (not auto) when structured output is required.",
      "Project (.mcp.json, shared) vs user (~/.claude.json, personal) MCP scope; ${ENV_VAR} for credentials; community-servers-first.",
      "Grep (contents) vs Glob (paths); Edit-first with anchor-widening/replace_all before Read+Write; incremental discovery."
    ],

    quickRef: [
      "Misrouting fix order: improve descriptions → (only later) consolidate/route. Never few-shot/classifier first.",
      "Good description = purpose + inputs/formats + example queries + edge cases + explicit boundaries.",
      "Review system prompts for keyword-sensitive wording that overrides tool descriptions.",
      "Error categories: transient (retry) · validation (fix+retry) · business (no retry, escalate) · permission (no retry, escalate).",
      "`isError:true` = failure; valid empty result = `isError:false` + `resultCount:0`. Don't retry a successful empty query.",
      "Multi-agent errors: recover locally, propagate selectively, include partial results + what was attempted.",
      "4–5 tools per agent, scoped to role. Add a scoped cross-role tool for high-frequency simple ops.",
      "tool_choice: auto (decide) · any (must call some tool) · {type:'tool',name} (must call that tool).",
      "Least privilege: constrained load_document over generic fetch_url.",
      ".mcp.json = project, shared, version-controlled. ~/.claude.json = user, personal. Use ${ENV_VAR}.",
      "Community MCP servers first; build custom only for team-specific/proprietary needs. Enhance sparse MCP descriptions.",
      "Grep = file contents. Glob = file paths. Edit first → widen anchor / replace_all → Read+Write last. Deprecation: Grep→Glob→Grep."
    ]
  };

  // ==========================================================================
  // STUDY GUIDE  — window.STUDY_CONTENT.D2
  // ==========================================================================
  window.STUDY_CONTENT.D2 = {
    title: "Domain 2 — Tool Design & MCP Integration",
    weight: "~18%",
    summary: "How to design tool interfaces and error contracts, distribute and constrain tools across agents, configure MCP servers at the right scope, and use Claude Code's built-in tools correctly.",
    examTips: [
      "Tool misrouting? <strong>Improve the descriptions first</strong> — reject few-shot, routing classifiers, and consolidation as the first step.",
      "<strong>Access failure vs valid empty result</strong> is tested directly: never retry a successful query that returned no matches.",
      "<strong>Business and permission errors are never retryable</strong> — the agent must escalate or take an alternative path.",
      "Need guaranteed structured output? Use <strong>tool_choice 'any' or forced</strong>, never 'auto'.",
      "Team-wide MCP servers go in <strong>.mcp.json</strong> (shared); personal ones in <strong>~/.claude.json</strong>. Use <strong>${ENV_VAR}</strong> for secrets.",
      "<strong>Grep = contents, Glob = paths.</strong> Try Edit first; widen the anchor or use replace_all before falling back to Read + Write."
    ],
    topics: [
      {
        id: "d2.1",
        title: "Tool Interface Design",
        intro: "Tool descriptions are the primary mechanism for tool selection — write them like production interfaces, not afterthoughts.",
        concepts: [
          "Tool descriptions are THE primary mechanism LLMs use for tool selection, not supplementary metadata.",
          "A production-grade description has five elements: purpose, expected inputs/formats, example queries, edge cases/limitations, explicit boundaries vs similar tools.",
          "Tool splitting: replace a broad generic tool with purpose-specific tools that each have a narrow, clearly described purpose.",
          "Tool renaming: rename confusingly similar tools (e.g. analyze_content -> extract_web_results) to remove overlap at the interface level.",
          "System prompts can override descriptions: keyword-sensitive instructions create unintended tool associations."
        ],
        antiPatterns: [
          "Few-shot examples to fix misrouting — token overhead, treats symptoms not the cause.",
          "A routing classifier as the first step — over-engineered; bypasses the model's NLU.",
          "Tool consolidation as the first step — valid long-term but more effort than expanding descriptions.",
          "Ignoring system-prompt wording after updating tool descriptions."
        ],
        deepDive: [
          "The misrouting problem (exam Q2): get_customer and lookup_order with minimal descriptions ('Retrieves customer information' / 'Retrieves order details') and similar identifier formats cause 'check my order #12345' to route to the wrong tool. The correct first fix is to expand the descriptions to include input formats, example queries, edge cases, and explicit boundaries (when to use this tool vs the other).",
          "The exam consistently favours low-effort, high-leverage fixes: better descriptions before routing classifiers, scoped access before full access, community servers before custom builds."
        ],
        code: {
          title: "Minimal vs production-grade descriptions",
          body: "// Minimal (misroutes)\nget_customer: \"Retrieves customer information\"\n\n// Production-grade\nget_customer: \"Looks up a customer by email, phone, or customer ID. Returns\n  profile + account status + loyalty tier. Use to verify who the customer is.\n  Do NOT use for order queries -- use lookup_order.\""
        },
        compare: {
          bad: "Add 5-8 few-shot examples of correct tool selection to the system prompt",
          good: "Expand each tool description with inputs, examples, edge cases, and boundaries"
        },
        examTip: "When two tools misroute, the answer is expand the descriptions. Few-shot, routing classifier, and consolidation are all distractors as the first step."
      },
      {
        id: "d2.2",
        title: "Structured Error Responses",
        intro: "Structured error metadata lets an agent recover intelligently — and distinguishes a failure from a successful empty result.",
        concepts: [
          "The MCP isError flag signals tool failure so the model reasons about recovery instead of treating error text as a success.",
          "Four error categories: transient (retry), validation (fix input + retry), business (no retry, escalate), permission (no retry, escalate).",
          "Structured metadata: errorCategory, isRetryable boolean, and a human-readable description enable correct recovery branching.",
          "Access failure (could not reach the source) is isError:true; valid empty result (queried successfully, no matches) is isError:false + resultCount:0.",
          "Multi-agent error propagation: recover locally, propagate selectively, include partial results and what was attempted."
        ],
        antiPatterns: [
          "Retrying when a successful query returned an empty result — it will return empty again.",
          "Generic messages like 'Operation failed' without errorCategory/isRetryable/description.",
          "Treating business errors as retryable — the same policy violation applies every time.",
          "Silently suppressing subagent errors by returning empty results as success."
        ],
        deepDive: [
          "Access failure vs valid empty result (the most-tested distinction): a tool returns an empty array, the agent retries 3 times then escalates — but the account simply does not exist. The tool succeeded; it just found no matches. Because the response doesn't distinguish 'could not reach the database' from 'reached it and found nothing', the agent treats both as a retriable failure. The fix is to structure responses so a successful-but-empty query looks fundamentally different from a failed query.",
          "Business errors carry isRetryable:false plus a customer-friendly explanation (e.g. refund exceeds the £500 limit, requires manager approval), so the agent escalates instead of retrying."
        ],
        code: {
          title: "Empty result vs access failure",
          body: "// Valid empty result -- NOT an error\n{ \"isError\": false, \"resultCount\": 0,\n  \"content\": [{\"type\":\"text\",\"text\":\"No match. Query ran, no results.\"}] }\n\n// Access failure -- IS an error\n{ \"isError\": true, \"errorCategory\": \"transient\", \"isRetryable\": true,\n  \"content\": [{\"type\":\"text\",\"text\":\"Could not reach database (timeout).\"}] }"
        },
        compare: {
          bad: "Empty array returned the same way as a timeout -> agent retries 'no results'",
          good: "isError:false+resultCount:0 for empty; isError:true+errorCategory for failures"
        },
        examTip: "If an agent wastes retries on a lookup that found nothing, the root cause is that the tool doesn't distinguish access failures from valid empty results."
      },
      {
        id: "d2.3",
        title: "Tool Distribution & Tool Choice",
        intro: "Scope 4-5 tools per agent, add scoped cross-role tools for hot paths, and pick the right tool_choice mode.",
        concepts: [
          "Tool selection reliability degrades as the toolkit grows; 18 tools is too many. Optimal range: 4-5 tools per agent, scoped to its role.",
          "Relevance matters: an agent with out-of-role tools tends to misuse them (e.g. a synthesis agent running its own web searches).",
          "tool_choice 'auto' = model decides (text or tool); 'any' = must call some tool; forced {type:'tool',name} = must call a specific tool.",
          "Forced selection enforces a mandatory first step (e.g. extract_metadata before enrichment); switch to 'auto' afterwards.",
          "Least privilege: replace a generic tool (fetch_url) with a constrained one (load_document that validates document URLs only)."
        ],
        antiPatterns: [
          "Giving one agent 18 tools and expecting reliable selection.",
          "Routing all simple verifications through the coordinator when 85% are simple lookups (2-3 round trips, ~40% latency).",
          "Using tool_choice 'auto' when structured output is required (the model may return text).",
          "Giving a subagent a generic fetch_url when a constrained load_document would suffice."
        ],
        deepDive: [
          "Scoped cross-role tool (exam Q9): a synthesis agent returns control to the coordinator for fact verification, adding 2-3 round trips and 40% latency; 85% of verifications are simple lookups. The fix is a scoped verify_fact tool on the synthesis agent for the simple case, routing only complex multi-source verifications through the coordinator.",
          "Role-specific scoping in a research system: Web Search (search_web, fetch_page, extract_links, save_snippet); Document Analysis (extract_metadata, extract_data_points, summarize_content, verify_claim); Synthesis (compile_report, verify_fact scoped, format_citation, assess_coverage); Coordinator (Agent/Task to spawn subagents, review_output, request_revision)."
        ],
        code: {
          title: "tool_choice modes",
          body: "{ \"tool_choice\": {\"type\":\"auto\"} }                          // decide freely\n{ \"tool_choice\": {\"type\":\"any\"} }                           // must call SOME tool\n{ \"tool_choice\": {\"type\":\"tool\",\"name\":\"extract_metadata\"} } // must call THAT tool"
        },
        examTip: "High-frequency simple cross-role op with coordinator latency? Add a scoped tool. Need guaranteed structured output? Use 'any' or forced, never 'auto'."
      },
      {
        id: "d2.4",
        title: "MCP Server Integration",
        intro: "Scope MCP servers correctly, keep secrets in env vars, expose resources, and prefer community servers.",
        concepts: [
          "Project-level .mcp.json lives in the repo root, is version-controlled, and is shared with the whole team.",
          "User-level ~/.claude.json lives in the home directory, is personal, and is NOT version-controlled or shared.",
          "All tools from all configured servers (both scopes) are discovered at connection time and available simultaneously.",
          "${VARIABLE_NAME} expansion keeps credentials out of version control: the file references names, each dev sets values locally.",
          "MCP resources expose content catalogs (issue summaries, doc hierarchies, DB schemas) so agents avoid exploratory tool calls."
        ],
        antiPatterns: [
          "Building a custom MCP server for a standard integration like Jira instead of evaluating community servers first.",
          "Putting team-wide MCP configuration in ~/.claude.json (personal, not shared).",
          "Committing credentials directly in .mcp.json instead of using ${ENV_VAR} expansion.",
          "Leaving MCP tool descriptions sparse, causing the agent to prefer built-in tools like Grep."
        ],
        deepDive: [
          "Build-vs-use (exam scenario): a team needs Jira integration and a dev proposes building a custom server. The correct first step is to evaluate existing community MCP servers (Jira, GitHub, Slack, Linear, Notion all have maintained ones) and build custom only if they cannot handle team-specific workflows. 'Evaluate community servers first' is always correct for a standard integration.",
          "Enhancing MCP descriptions: a sparse description ('Searches code') loses to a rich built-in like Grep. A detailed description ('semantic, AST-aware search ... more accurate than text-based grep ... use instead of Grep when searching by intent') gives the model enough context to prefer the more-capable MCP tool."
        ],
        code: {
          title: ".mcp.json with env-var expansion",
          body: "{\n  \"mcpServers\": {\n    \"github\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-github\"],\n      \"env\": { \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\" }\n    }\n  }\n}"
        },
        compare: {
          bad: "Build a custom Jira MCP server; commit JIRA_TOKEN into .mcp.json",
          good: "Use a community Jira server; reference ${JIRA_TOKEN} via env-var expansion"
        },
        examTip: "Team-wide server -> .mcp.json. Personal/experimental -> ~/.claude.json. Standard integration -> community server first. Secrets -> ${ENV_VAR}."
      },
      {
        id: "d2.5",
        title: "Built-in Tools",
        intro: "Six tools (Read, Write, Edit, Bash, Grep, Glob): pick Grep for contents, Glob for paths, Edit before Read+Write.",
        concepts: [
          "Grep searches file CONTENTS for patterns (function callers, error messages, imports).",
          "Glob matches file PATHS by naming pattern (**/*.test.tsx, **/config.*). Grep = inside files; Glob = file names.",
          "Edit makes targeted changes via unique text matching; it fails by design if old_string matches multiple places.",
          "On a non-unique Edit match: widen old_string with surrounding context, or set replace_all:true for a global change. Read+Write is the last resort.",
          "Incremental discovery: Grep entry points -> Read to trace flows -> Grep usage -> Read only what's justified. Never read all files upfront."
        ],
        antiPatterns: [
          "Using Glob to find function callers (Glob matches paths, not contents).",
          "Using Grep to find files by extension/naming pattern (Glob is purpose-built for paths).",
          "Reading all source files upfront before knowing what's relevant (context-budget killer).",
          "Defaulting to Read+Write for every modification, or jumping to it the moment Edit reports a non-unique match."
        ],
        deepDive: [
          "The deprecation scenario (exam): find all callers of processLegacyOrder AND their test files. Correct sequence is Grep -> Glob -> Grep again: Grep the function name (direct callers + tests importing it), Glob sibling test files (**/OrderProcessor.test.*) to catch tests that exercise it indirectly through the source module, then Grep wrapper names (e.g. applyLegacyOrder) for transitive coverage. Glob-first is wrong because Glob matches paths, not contents.",
          "Tracing across wrapper/barrel modules: Grep the definition -> Read the defining file for exported names -> Grep each exported name across the codebase -> if re-exported through a barrel (index.ts), Grep the barrel module name to find indirect consumers a single search would miss."
        ],
        code: {
          title: "Grep (contents) vs Glob (paths)",
          body: "Grep: \"processLegacyOrder\"     // CONTENTS: who calls the function\nGlob: \"**/*.test.tsx\"          // PATHS: all test files\n\n// Edit recovery on non-unique match:\n//   1) widen old_string with surrounding context\n//   2) or replace_all: true\n//   3) Read + Write only as last resort"
        },
        compare: {
          bad: "Glob '*processLegacyOrder*' to find callers, then Read all test files",
          good: "Grep 'processLegacyOrder' for callers, then Glob '**/Caller.test.*' for tests"
        },
        examTip: "Searching inside files = Grep. Finding files by name = Glob. Modifying = Edit first (widen anchor / replace_all before Read+Write). Deprecation trace = Grep -> Glob -> Grep."
      }
    ]
  };

  // ==========================================================================
  // QUIZ / EXAM QUESTIONS — removed (old single-line/derived bank).
  // New scenario-based "Exam Sim" banks will be pasted per domain into dedicated
  // files and power the rebuilt Domain Quiz / Mock / Real Exam engine.
  // ==========================================================================

  // ==========================================================================
  // FLASHCARDS  — appended to window.FLASHCARDS
  // ==========================================================================
  var D2_FLASHCARDS = [
    { front: "What is the PRIMARY mechanism LLMs use for tool selection?", back: "Tool descriptions. They are not supplementary metadata — the model reads them to decide which tool to call. When misrouting occurs, improve the descriptions first." },
    { front: "What five elements make a production-grade tool description?", back: "(1) What it does; (2) expected inputs/formats; (3) example queries it handles well; (4) edge cases/limitations; (5) explicit boundaries vs similar tools (when NOT to use it)." },
    { front: "Three wrong first fixes for tool misrouting?", back: "Few-shot examples (token overhead, treats symptoms), a routing classifier (over-engineered, bypasses NLU), and tool consolidation (more effort, long-term choice). Expand descriptions first." },
    { front: "How can a system prompt cause misrouting even with good descriptions?", back: "Keyword-sensitive wording (e.g. 'always check customer details') creates unintended tool associations that override the descriptions. Review prompts after editing descriptions." },
    { front: "What are the four MCP error categories and their retryability?", back: "Transient (retry), Validation (fix input + retry), Business (NOT retryable — escalate/alternative path), Permission (NOT retryable — escalate/credentials)." },
    { front: "Access failure vs valid empty result?", back: "Access failure = tool couldn't reach the source (isError:true, maybe retry). Valid empty result = query ran successfully, no matches (isError:false, resultCount:0, do NOT retry). Confusing them wastes retries." },
    { front: "What does the MCP isError flag do?", back: "It signals to the model that the tool execution failed, so the model reasons about recovery instead of treating error text as a normal successful result." },
    { front: "How should errors propagate in a multi-agent system?", back: "Local recovery with selective propagation: subagents retry transient failures locally; only propagate what can't be resolved; include partial results and what was attempted. Never suppress errors as success or kill the whole workflow on one failure." },
    { front: "How many tools per agent, and why?", back: "4–5 tools per agent, scoped to its role. Selection reliability degrades as the toolkit grows (18 tools is too many), and out-of-role tools invite misuse." },
    { front: "tool_choice: auto vs any vs forced?", back: "auto = model decides (text or tool). any = must call SOME tool (guarantees structured output, model picks the schema). forced {type:'tool',name} = must call that specific tool (enforces a mandatory first step)." },
    { front: "When do you use a scoped cross-role tool?", back: "When an agent frequently needs a capability from another role for a simple, high-frequency case. Give it a constrained version directly (e.g. synthesis agent's verify_fact for the 85% simple lookups), routing only complex cases through the coordinator — avoids 2-3 round trips / ~40% latency." },
    { front: "Apply least privilege to tools — example?", back: "Replace a generic fetch_url (fetches anything) with a constrained load_document that validates document URLs only. Prevents misuse, clarifies purpose, reduces side effects." },
    { front: ".mcp.json vs ~/.claude.json?", back: ".mcp.json = project root, version-controlled, shared with the team (team-wide servers). ~/.claude.json = home directory, personal, NOT shared (experimental/personal servers). Tools from both are available simultaneously." },
    { front: "How do you keep MCP credentials out of version control?", back: "Use ${VARIABLE_NAME} env-var expansion in .mcp.json. The file references variable names (safe to commit); each developer sets values locally; rotation needs no config change." },
    { front: "What are MCP resources for?", back: "Exposing content catalogs (issue summaries, doc hierarchies, DB schemas) to agents WITHOUT exploratory tool calls. Resources give visibility into data; tools let agents act on it — fewer wasted calls." },
    { front: "Build a custom MCP server or use a community one?", back: "Evaluate community servers first for standard integrations (Jira, GitHub, Slack, Linear, Notion). Build custom only for team-specific workflows, custom business logic, or proprietary systems with no community server." },
    { front: "Why might an agent prefer Grep over a more capable MCP tool, and the fix?", back: "Sparse MCP descriptions lose to rich built-in descriptions the model understands better. Fix: enhance the MCP tool description with capabilities, outputs, and when to use it instead of the built-in." },
    { front: "Grep vs Glob?", back: "Grep searches file CONTENTS (function callers, error messages, imports). Glob matches file PATHS by naming pattern (**/*.test.tsx). Grep = inside files; Glob = file names." },
    { front: "When does Edit fail, and what's the recovery order?", back: "Edit fails when old_string matches multiple places (a safety mechanism). Recovery: (1) widen old_string with surrounding context, or (2) set replace_all:true; (3) Read+Write only as a last resort — it burns tokens." },
    { front: "Correct tool sequence for the deprecation scenario?", back: "Grep → Glob → Grep again. Grep the function name (direct callers + tests importing it), Glob sibling test files (**/Caller.test.*) for indirect tests, then Grep wrapper names for transitive coverage. Not Glob first." },
    { front: "Right vs wrong way to understand a large codebase?", back: "Wrong: read all files upfront (context-budget killer). Right: incremental discovery — Grep entry points → Read to trace flows → Grep usage → Read only what each step justifies." }
  ];
  Array.prototype.push.apply(window.FLASHCARDS, D2_FLASHCARDS);
})();
