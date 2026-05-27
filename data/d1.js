/*
 * Domain 1 — Agentic Architecture & Orchestration  (~27% of exam)
 * Source: claudecertificationguide.com  (sections 1.1–1.7)
 *
 * This file additively populates the shared globals for Domain 1 only:
 *   window.DOMAIN_DEEPDIVE.D1   — the "Domains" deep-dive view
 *   window.STUDY_CONTENT.D1     — the "Study Guide" view
 *   window.QUESTIONS (+= D1)    — the "Domain Quiz" / "Mock Exam" banks
 *   window.FLASHCARDS (+= D1)   — the "Flashcards" view
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
  // DEEP DIVE  — window.DOMAIN_DEEPDIVE.D1
  // ==========================================================================
  window.DOMAIN_DEEPDIVE.D1 = {
    number: 1,
    weight: "~27%",
    title: "Agentic Architecture & Orchestration",
    tagline: "The control flow, coordination, enforcement, and state management that power production Claude agents.",
    why: "This is the largest domain on the exam. It tests whether you can design agents that **terminate reliably**, **coordinate cleanly**, **enforce business rules deterministically**, and **manage state** across long-running work. Most wrong answers here are plausible-sounding prompt fixes for problems that actually require structural or programmatic solutions — the exam rewards recognising that difference.",

    sections: [
      // ---- 1.1 Agentic Loops --------------------------------------------
      {
        heading: "1.1 — Agentic Loops",
        body: [
          { type: "p", text: "An **agentic loop** is the core execution cycle that powers every Claude-based agent. It is a *deterministic control flow pattern* — not a prompt trick, not a retry loop, and not a chatbot turn." },
          { type: "p", text: "The loop has four steps, repeated until completion:" },
          { type: "bullets", items: [
            "Send a request to Claude via the Messages API, including the full conversation history (system prompt, prior messages, and any tool results from the previous iteration).",
            "Inspect the `stop_reason` field — the authoritative signal for what happens next. The two values relevant to agentic loops are `tool_use` (Claude wants to call tools → continue) and `end_turn` (Claude is finished → terminate).",
            "If `tool_use`: execute the requested tool(s), append the tool results to the conversation history as a new message, and resend the updated conversation to Claude.",
            "If `end_turn`: present the final response to the user and stop."
          ] },
          { type: "callout", kind: "key", text: "The `stop_reason` field is the *only* reliable signal for loop control — it is deterministic and unambiguous. Never use natural-language parsing, text-content checks, or arbitrary iteration caps as your primary stopping mechanism." },
          { type: "p", text: "The critical detail is step 3: **tool results must be appended to conversation history**. Without this, Claude cannot reason about the new information on the next iteration." },
          { type: "code", lang: "py", body: "messages = [{\"role\": \"user\", \"content\": user_query}]\nMAX_ITERATIONS = 20  # safety net only, NOT the primary control\n\nfor _ in range(MAX_ITERATIONS):\n    resp = client.messages.create(model=MODEL, tools=TOOLS, messages=messages)\n\n    if resp.stop_reason == \"end_turn\":\n        return final_text(resp)          # done — Claude signalled completion\n\n    if resp.stop_reason == \"tool_use\":\n        messages.append({\"role\": \"assistant\", \"content\": resp.content})\n        tool_results = run_requested_tools(resp)   # may be several tools\n        messages.append({\"role\": \"user\", \"content\": tool_results})\n        # loop continues with the new results in history" },
          { type: "p", text: "In an agentic loop, **Claude decides which tool to call based on context** — model-driven decision-making, as opposed to hard-coded decision trees or fixed tool sequences. The exam favours model-driven approaches for flexibility, with one exception: when business logic requires deterministic compliance (financial, security, regulatory), programmatic enforcement overrides model flexibility (see 1.4)." },
          { type: "callout", kind: "warn", text: "The three loop-termination anti-patterns the exam tests cold: (1) parsing natural-language signals like \"I'm done\"; (2) using arbitrary iteration caps as the *primary* stopping mechanism; (3) checking `response.content[0].type == \"text\"` — Claude can return text *alongside* tool_use blocks. A fourth trap: forcing `tool_choice` to `\"any\"`, which prevents Claude from ever signalling completion and creates an infinite loop." }
        ]
      },

      // ---- 1.2 Multi-Agent Orchestration --------------------------------
      {
        heading: "1.2 — Multi-Agent Orchestration",
        body: [
          { type: "p", text: "Multi-agent orchestration uses a specific architecture the exam tests directly: **hub-and-spoke with a coordinator at the centre**." },
          { type: "bullets", items: [
            "**Coordinator agent** (the hub): receives the task, decomposes it, decides which subagents to invoke, passes context, aggregates results, handles errors, and routes information.",
            "**Subagents** (the spokes): each handles a specialised task (web search, document analysis, synthesis, report generation), receiving instructions from and returning results to the coordinator."
          ] },
          { type: "callout", kind: "key", text: "**ALL communication flows through the coordinator. Subagents never communicate directly with each other — never**, not for efficiency or convenience. This centralisation gives you observability, consistent error handling, and controlled information flow." },
          { type: "p", text: "The **isolation principle** is the most-tested and most-misunderstood concept here. Subagents do NOT automatically inherit the coordinator's conversation history. A spawned subagent starts with *only* what the coordinator explicitly puts in its prompt — it has no access to the coordinator's system prompt, prior messages, other subagents' results, or any shared memory. Subagents also do not share memory between invocations: calling the same subagent twice gives the second call no knowledge of the first." },
          { type: "p", text: "The coordinator has four key responsibilities: **dynamic subagent selection** (don't route every query through the full pipeline), **research scope partitioning** (assign distinct subtopics to minimise duplication), **iterative refinement loops** (evaluate output for gaps and re-delegate), and **centralised communication routing**." },
          { type: "callout", kind: "warn", text: "The **narrow-decomposition failure**: when a multi-agent system's output misses entire categories (e.g. a \"renewable energy\" report covering only solar and wind), the root cause is the *coordinator's decomposition*, not the subagents. Trace failures to their origin. The fix is broader coordinator decomposition — not better search queries, a stronger synthesis agent, or more subagents." }
        ]
      },

      // ---- 1.3 Subagent Invocation & Context Passing --------------------
      {
        heading: "1.3 — Subagent Invocation & Context Passing",
        body: [
          { type: "p", text: "If 1.2 is the architecture, 1.3 is the wiring. The **Agent tool** (renamed from the **Task tool** in Claude Agent SDK v2.1.63) is the mechanism for spawning subagents. \"Task\" still works as a backward-compatible alias." },
          { type: "callout", kind: "key", text: "The coordinator's `allowedTools` **must include** `\"Agent\"` (or `\"Task\"`). This is a hard binary gate — without it, the coordinator physically cannot spawn any subagent, regardless of how they are defined." },
          { type: "p", text: "Each subagent is defined by an **AgentDefinition** specifying three things: a **description** (so the coordinator knows when to invoke it), a **system prompt** (its instructions), and **tool restrictions** (tools scoped to its role)." },
          { type: "p", text: "Three rules for effective **context passing**:" },
          { type: "bullets", items: [
            "**Include complete findings from prior agents** — pass them in full; subagents cannot \"look up\" prior results.",
            "**Use structured formats that separate content from metadata** — every finding must carry source attribution (URL, document name, page number) or the downstream agent cannot cite it.",
            "**Specify goals, not procedures** — goal-oriented prompts let subagents adapt; procedural step-by-step instructions constrain them."
          ] },
          { type: "code", lang: "json", body: "{\n  \"findings\": [\n    {\n      \"claim\": \"Solar panel efficiency has increased 25% in the last decade\",\n      \"source_url\": \"https://example.com/solar-report\",\n      \"document_name\": \"Annual Solar Industry Report 2024\",\n      \"page_number\": 14,\n      \"confidence\": \"high\",\n      \"retrieved_by\": \"web_search_agent\"\n    }\n  ]\n}" },
          { type: "callout", kind: "warn", text: "**Attribution failure pattern**: when a synthesis agent produces unsourced claims, the root cause is the coordinator passing content *without* structured metadata — the synthesis agent literally had no source info to include. Don't blame the synthesis prompt or give it direct tool access." },
          { type: "p", text: "**Parallel spawning**: for independent subagent tasks, emit multiple Agent tool calls in a *single* coordinator response rather than one per turn — sequential spawning adds needless latency. Look for answer options mentioning \"in a single response\" or \"simultaneously.\"" },
          { type: "p", text: "**fork_session** creates independent branches from a shared analysis baseline (e.g. after analysing a codebase, fork to compare two strategies). Each branch is independent after the split. This is *not* the same as **--resume**, which continues a specific named session. Fork = divergent exploration; resume = continuation." }
        ]
      },

      // ---- 1.4 Workflow Enforcement & Handoff ---------------------------
      {
        heading: "1.4 — Workflow Enforcement & Handoff",
        body: [
          { type: "p", text: "This task draws a hard line between two ways to control agent behaviour:" },
          { type: "bullets", items: [
            "**Prompt-based guidance** — instructions in the system prompt. Works ~90–95% of the time, but the model is probabilistic, so it has a non-zero failure rate. Fine for low-stakes operations.",
            "**Programmatic enforcement** — hooks, prerequisite gates, or code-level checks that physically block downstream tools until prerequisites complete. Deterministic: works every time, no matter what the model decides."
          ] },
          { type: "callout", kind: "key", text: "Exam decision rule: **if a single failure would cause financial loss, a security breach, or a compliance violation, use programmatic enforcement.** Money / security / compliance → programmatic. Formatting / style / ordering preferences → prompt-based guidance is acceptable." },
          { type: "callout", kind: "warn", text: "For high-stakes scenarios the exam *always* offers distractors like \"add stronger system-prompt instructions\" or \"include few-shot examples.\" Reject them — they improve probability but never reach a 0% failure rate. Routing classifiers are also wrong here: they handle routing, not per-agent workflow enforcement." },
          { type: "p", text: "A **prerequisite gate** is a programmatic check that blocks a tool until a prior condition is met — e.g. `process_refund` cannot run until `get_customer` has returned a verified customer ID for the session. The gate is code, so the model cannot bypass it by deciding to skip verification." },
          { type: "code", lang: "py", body: "def process_refund(args, session):\n    if not session.get(\"verified_customer_id\"):\n        return {\"error\": \"Cannot process refund — customer identity \"\n                         \"not verified. Call get_customer first.\"}\n    return do_refund(args[\"customer_id\"], args[\"amount\"])" },
          { type: "p", text: "**Subagent lifecycle hooks**: `SubagentStart` fires when a subagent is spawned (log / validate / rate-limit before it runs); `SubagentStop` fires when it returns (validate / sanitise / transform output before the coordinator uses it). Subagents can also define their own `PreToolUse`/`PostToolUse` hooks scoped to their execution, and `Stop` hooks in a subagent's frontmatter auto-convert to `SubagentStop` events at runtime." },
          { type: "p", text: "**Structured handoff**: when escalating to a human, the handoff summary must be **self-contained** — the human agent does NOT have the conversation transcript. Required fields: **customer ID, conversation summary, root-cause analysis, refund amount (if applicable), and recommended action**. Multi-concern requests should be **decomposed, investigated in parallel using shared context, then resolved in a single unified response** — not handled sequentially or partially." }
        ]
      },

      // ---- 1.5 Agent SDK Hooks ------------------------------------------
      {
        heading: "1.5 — Agent SDK Hooks",
        body: [
          { type: "p", text: "Hooks inject **deterministic behaviour** into an otherwise probabilistic system — they are how you implement the programmatic enforcement from 1.4. There are two points in the tool lifecycle:" },
          { type: "bullets", items: [
            "**PostToolUse hooks** run *after* a tool executes but *before* the model processes the result — used to **transform / normalise data** so the model always sees clean, consistent output.",
            "**Tool-call interception hooks** run *before* a tool executes — used to **enforce policy**: block, modify, or redirect the call. The tool never runs if the hook blocks it."
          ] },
          { type: "callout", kind: "key", text: "Know the direction: **PostToolUse transforms data after execution; tool-call interception enforces policy before execution.** The exam tests this distinction directly." },
          { type: "p", text: "**PostToolUse → data normalisation.** Different MCP tools return different formats (Unix timestamps vs ISO 8601, numeric status codes vs strings, regional date formats). Letting the model interpret heterogeneous formats every iteration introduces inconsistency. A PostToolUse hook normalises everything (dates → ISO 8601, status codes → human-readable strings, currency → consistent decimals) so the model receives clean data every time." },
          { type: "p", text: "**Interception → policy enforcement.** Examples: block `process_refund` above $500 and route to human escalation; block `transfer_funds` until an AML check has passed for the session; route `approve_discount` above 20% to a manager approval queue." },
          { type: "callout", kind: "warn", text: "The exam offers **PostToolUse as a way to *block* policy-violating actions** — this is wrong. PostToolUse runs *after* execution, so by the time it fires the non-compliant action has already happened. Use **pre-execution interception** to block. Also wrong: relying on the model to normalise data (use PostToolUse instead)." },
          { type: "code", lang: "py", body: "# PostToolUse: normalise heterogeneous tool output\ndef post_tool_use(tool_name, result):\n    result[\"date\"] = to_iso8601(result.get(\"date\"))\n    result[\"status\"] = STATUS_MAP.get(result.get(\"status\"), result.get(\"status\"))\n    return result\n\n# Pre-execution interception: enforce policy before the tool runs\ndef pre_tool_use(tool_name, args, session):\n    if tool_name == \"process_refund\" and args[\"amount\"] > 500:\n        return Block(\"Refund > $500 requires human approval\")\n    if tool_name == \"transfer_funds\" and not session.get(\"aml_passed\"):\n        return Block(\"AML check required before transfer\")\n    return Allow()" },
          { type: "p", text: "The decision framework: requirements that **must be followed 100% of the time → hooks (deterministic)**; requirements that are **preferred but tolerate occasional deviation → prompts (probabilistic)**." }
        ]
      },

      // ---- 1.6 Task Decomposition Strategies ----------------------------
      {
        heading: "1.6 — Task Decomposition Strategies",
        body: [
          { type: "p", text: "Two decomposition patterns, plus a failure mode the exam loves." },
          { type: "bullets", items: [
            "**Fixed sequential pipelines (prompt chaining)** — predetermined steps that run in order, each feeding the next. Best for *predictable, structured* tasks (code review, document processing, data extraction, compliance checks). Consistent, reliable, easy to debug and monitor — but cannot adapt to unexpected findings.",
            "**Dynamic adaptive decomposition** — subtasks generated from what's discovered at each step; the plan evolves. Best for *open-ended* tasks where scope isn't known up front (legacy exploration, security audits, debugging unfamiliar systems). Adaptive and thorough — but less predictable and harder to debug."
          ] },
          { type: "callout", kind: "key", text: "Match the pattern to the task characteristics, **not** to what sounds more sophisticated. Steps known in advance → fixed pipeline. Unknown scope, must adapt → dynamic decomposition." },
          { type: "p", text: "**Attention dilution** is the key failure mode: when an agent processes too many items in a single pass, attention per item drops and depth becomes inconsistent — thorough analysis for the first few items, increasingly shallow for later ones, and the same pattern flagged in one file but approved in another." },
          { type: "callout", kind: "warn", text: "The fix for attention dilution is **architectural, not capability-based**. A bigger model, larger context window, or stronger prompt does NOT fix it. Batching alone also misses cross-item issues. The fix is a **multi-pass architecture**: per-item local passes (each item gets the full attention budget) **plus** a separate cross-item integration pass (for data-flow / consistency issues across items)." },
          { type: "code", lang: "py", body: "# Multi-pass review — fixes attention dilution\nlocal = [analyse_one(f) for f in files]        # per-file: full attention each\ncross = integration_pass(local, files)         # cross-file: data flow, consistency\nreport = compile(local, cross)" }
        ]
      },

      // ---- 1.7 Session State & Resumption -------------------------------
      {
        heading: "1.7 — Session State & Resumption",
        body: [
          { type: "p", text: "Three session-management options, each for a distinct purpose:" },
          { type: "bullets", items: [
            "**--resume <session-name>** — continues a specific named session; the *entire* history (tool results, analyses, reasoning) is restored. Use when prior context is still valid and files haven't changed. Avoid after files change → stale context.",
            "**fork_session** — creates an independent branch from a shared baseline for *divergent* exploration (e.g. compare two refactoring strategies). Branches don't see each other. Use for divergence, not continuation.",
            "**Fresh start with summary injection** — a brand-new session with a curated structured summary of prior findings injected; no stale tool results. Use when prior tool results are stale or context has degraded."
          ] },
          { type: "callout", kind: "key", text: "Three options, three purposes: **resume = continuation, fork = divergent exploration, fresh start + summary = stale prior results.** Selecting the right one for the scenario is exactly what the exam tests." },
          { type: "p", text: "The **stale context problem** is the central concept: when you `--resume` after modifying files, the old tool results (old file contents) remain in history. The model reasons from that cached data and gives contradictory advice — recommending fixes already made, or referencing code that no longer exists." },
          { type: "callout", kind: "warn", text: "Simply resuming and asking the agent to re-read changed files is **not** the best answer — the stale results stay in history and can still influence reasoning. The reliable fix is a **fresh start with summary injection** plus **targeted re-analysis** of only the changed files (not a wasteful full re-exploration of the whole codebase). And note: `fork_session` does NOT solve stale context — the fork inherits the stale history." }
        ]
      }
    ],

    examFocus: [
      "Using `stop_reason` (not content-type checks, natural-language parsing, or iteration caps) as the authoritative loop-termination signal.",
      "Hub-and-spoke: all communication through the coordinator; subagents have fully isolated context and no shared memory.",
      "Tracing multi-agent failures to their origin — narrow coordinator decomposition and missing structured metadata, not the subagents.",
      "`Agent`/`Task` in `allowedTools` as the hard gate for spawning subagents; parallel spawning for independent tasks.",
      "Programmatic enforcement vs prompt-based guidance: money / security / compliance always require deterministic enforcement.",
      "Hook direction: PostToolUse (normalise, after) vs pre-execution interception (block policy, before).",
      "Decomposition pattern selection (fixed vs dynamic) and fixing attention dilution with multi-pass architecture.",
      "Session option selection and avoiding stale context after file changes (fresh start + summary + targeted re-analysis)."
    ],

    quickRef: [
      "`stop_reason`: `tool_use` → run tools, append results, continue; `end_turn` → stop. The only reliable signal.",
      "Loop anti-patterns: NL parsing · iteration cap as primary · `content[0].type=='text'` · `tool_choice:'any'`.",
      "Coordinator owns: dynamic selection, scope partitioning, iterative refinement, centralised routing.",
      "Subagent isolation: no inherited history, no shared memory — pass everything explicitly in the prompt.",
      "`allowedTools` must include `Agent` (alias `Task`, renamed in SDK v2.1.63) to spawn subagents.",
      "Context passing: full findings + content-separated-from-metadata + goals-not-procedures.",
      "Parallel spawn = multiple Agent calls in one response. fork_session ≠ --resume.",
      "Enforcement: high-stakes → programmatic gate/hook (100%); low-stakes → prompt (probabilistic).",
      "Hooks: PostToolUse = normalise after; interception = block before.",
      "Decomposition: fixed pipeline for predictable, dynamic for open-ended; multi-pass fixes attention dilution.",
      "Sessions: resume = continue · fork = diverge · fresh+summary = stale results / targeted re-analysis.",
      "Handoff summary fields: customer ID · summary · root cause · refund amount · recommended action."
    ]
  };

  // ==========================================================================
  // STUDY GUIDE  — window.STUDY_CONTENT.D1
  // ==========================================================================
  window.STUDY_CONTENT.D1 = {
    title: "Domain 1 — Agentic Architecture & Orchestration",
    weight: "~27%",
    summary: "How to build agents that terminate reliably, coordinate through a central hub, enforce critical rules deterministically, decompose work without losing depth, and manage state across long-running sessions.",
    examTips: [
      "When a loop terminates early or runs forever, the answer almost always involves <strong>stop_reason</strong> — not prompts or caps.",
      "When multi-agent output is incomplete, blame the <strong>coordinator</strong> (decomposition or context passing), never the subagents.",
      "Money, security, or compliance in the scenario? The answer is <strong>programmatic enforcement</strong>, not a better prompt.",
      "Match the hook to its direction: <strong>PostToolUse</strong> normalises after; <strong>interception</strong> blocks before.",
      "Inconsistent analysis depth across many items = <strong>attention dilution</strong> → multi-pass architecture, not a bigger model.",
      "Stale/contradictory advice after editing files = <strong>fresh start + summary injection</strong>, not naive resume."
    ],
    topics: [
      {
        id: "d1.1",
        title: "Agentic Loops",
        intro: "The deterministic four-step execution cycle behind every Claude agent, controlled by the stop_reason field.",
        concepts: [
          "An agentic loop is a deterministic control-flow pattern — not a prompt trick, retry loop, or chatbot turn.",
          "Four steps: send request with full history → inspect stop_reason → if tool_use run tools + append results + resend → if end_turn present final response and stop.",
          "stop_reason has two loop-relevant values: tool_use (continue) and end_turn (terminate).",
          "Tool results MUST be appended to conversation history, or Claude can't reason about them next iteration.",
          "Model-driven decision-making: Claude selects the tool from context, vs hard-coded decision trees — favoured for flexibility (exception: deterministic compliance, see 1.4)."
        ],
        antiPatterns: [
          "Parsing natural-language signals like 'I'm done' or 'task complete' — language is ambiguous.",
          "Using an arbitrary iteration cap as the PRIMARY stopping mechanism (acceptable only as a safety net).",
          "Checking response.content[0].type == 'text' for completion — Claude returns text alongside tool_use blocks.",
          "Forcing tool_choice to 'any' to suppress text — prevents end_turn and creates an infinite loop."
        ],
        deepDive: [
          "The premature-termination bug: a support agent checks content[0].type == 'text'. Claude returns 'Let me look up your order' text in position [0] alongside a tool_use block; the code sees text, assumes completion, and returns an incomplete response. The fix is to check stop_reason instead — continue on tool_use, stop on end_turn — which works regardless of content types present.",
          "Iteration caps are a common distractor presented as a fix for premature termination. They address runaway loops, not premature exits. The fix for premature termination is always correct stop_reason handling."
        ],
        code: {
          title: "stop_reason-driven loop (Python-style pseudocode)",
          body: "for _ in range(MAX_ITERATIONS):          # safety net only\n    resp = client.messages.create(model=MODEL, tools=TOOLS, messages=messages)\n    if resp.stop_reason == \"end_turn\":\n        return final_text(resp)\n    if resp.stop_reason == \"tool_use\":\n        messages.append({\"role\": \"assistant\", \"content\": resp.content})\n        messages.append({\"role\": \"user\", \"content\": run_tools(resp)})"
        },
        compare: {
          bad: "if response.content[0].type == 'text':\n    return done(response)   # misses text-alongside-tool_use",
          good: "if response.stop_reason == 'end_turn':\n    return done(response)   # authoritative, content-agnostic"
        },
        examTip: "Any loop control answer that relies on text content, phrases, or a cap as the primary mechanism is wrong. stop_reason is the only authoritative signal."
      },
      {
        id: "d1.2",
        title: "Multi-Agent Orchestration",
        intro: "Hub-and-spoke architecture: a central coordinator and isolated subagents that never talk to each other directly.",
        concepts: [
          "Coordinator (hub) decomposes the task, selects subagents, passes context, aggregates results, handles errors, and routes everything.",
          "Subagents (spokes) each handle a specialised task and return results only to the coordinator.",
          "ALL inter-subagent communication flows through the coordinator — subagents never communicate directly.",
          "Centralisation buys observability, consistent error handling, and controlled information flow.",
          "Coordinator responsibilities: dynamic subagent selection, research-scope partitioning, iterative refinement loops, centralised routing."
        ],
        antiPatterns: [
          "Assuming subagents inherit the coordinator's conversation history or share memory — they have fully isolated context.",
          "Proposing direct inter-subagent communication as an efficiency win — it breaks observability and control.",
          "Blaming downstream subagents for coverage gaps when the coordinator's decomposition was too narrow.",
          "Adding more subagents to fix a decomposition problem — they just get equally narrow assignments."
        ],
        deepDive: [
          "Isolation principle: a spawned subagent starts with only what the coordinator explicitly includes in its prompt — no coordinator system prompt, no prior messages, no other subagents' results, no global state. Repeated invocations don't share memory either.",
          "Narrow-decomposition failure (the 'renewable energy' / 'creative industries' pattern): output misses entire categories because the coordinator only assigned a subset of subtopics. The subagents researched thoroughly what they were given. Trace failures to their origin — the coordinator's decomposition — and fix it there."
        ],
        code: {
          title: "Coordinator routing through the hub (pseudocode)",
          body: "subtopics = coordinator.decompose(topic)        # must cover full breadth\nresults = [coordinator.invoke(agent, ctx=build_ctx(st)) for st in subtopics]\nreport = coordinator.synthesize(results)        # all flow back through hub\nwhile coordinator.has_gaps(report):             # iterative refinement\n    report = coordinator.refine(report)"
        },
        examTip: "If output is incomplete in SCOPE (missing whole categories), suspect the coordinator's decomposition. If incomplete in attribution, suspect context passing (1.3). Never the subagent."
      },
      {
        id: "d1.3",
        title: "Subagent Invocation & Context Passing",
        intro: "The mechanics: the Agent tool, AgentDefinitions, structured context passing, parallel spawning, and fork_session.",
        concepts: [
          "The Agent tool (renamed from Task in SDK v2.1.63; 'Task' is a backward-compatible alias) spawns subagents.",
          "Coordinator's allowedTools MUST include 'Agent' (or 'Task') — a hard binary gate for spawning.",
          "An AgentDefinition specifies description, system prompt, and tool restrictions (scoped to the subagent's role).",
          "Parallel spawning: emit multiple Agent tool calls in a single response for independent tasks to cut latency.",
          "fork_session creates independent branches from a shared baseline (divergent exploration); --resume continues a named session."
        ],
        antiPatterns: [
          "Assuming subagents have access to the coordinator's history or other subagents' outputs.",
          "Blaming the synthesis agent for missing citations when the coordinator passed content without metadata.",
          "Proposing sequential invocation for tasks that can run independently (adds latency).",
          "Confusing fork_session (divergence) with --resume (continuation)."
        ],
        deepDive: [
          "Three context-passing rules: (1) include complete findings from prior agents in full; (2) use structured formats that separate content from metadata (claim + source_url + document_name + page_number + confidence); (3) specify goals, not step-by-step procedures, so subagents can adapt.",
          "Attribution-failure pattern: the synthesis agent produces an excellent summary with no source attribution because the coordinator stripped metadata before passing content. The fix is to pass structured metadata alongside content — not to edit the synthesis prompt or give it direct tool access."
        ],
        code: {
          title: "Structured finding with separated metadata",
          body: "{\n  \"findings\": [{\n    \"claim\": \"Solar efficiency rose 25% in a decade\",\n    \"source_url\": \"https://example.com/report\",\n    \"document_name\": \"Solar Industry Report 2024\",\n    \"page_number\": 14,\n    \"confidence\": \"high\",\n    \"retrieved_by\": \"web_search_agent\"\n  }]\n}"
        },
        examTip: "Unsourced synthesis output = context passing without metadata. Independent subagents = parallel spawn (multiple Agent calls in one response). fork = diverge, resume = continue."
      },
      {
        id: "d1.4",
        title: "Workflow Enforcement & Handoff",
        intro: "Choosing prompt-based guidance vs programmatic enforcement, prerequisite gates, lifecycle hooks, and self-contained handoffs.",
        concepts: [
          "Prompt-based guidance is probabilistic (~90–95%); programmatic enforcement is deterministic (100%).",
          "Decision rule: a single failure causing financial loss, security breach, or compliance violation → programmatic enforcement.",
          "Prerequisite gates are code-level checks that block a tool until a prior condition is met (the model can't bypass them).",
          "SubagentStart / SubagentStop are lifecycle hooks; subagents can define their own scoped PreToolUse/PostToolUse hooks; Stop hooks in subagent frontmatter auto-convert to SubagentStop.",
          "Multi-concern requests: decompose, investigate in parallel with shared context, synthesise one unified response."
        ],
        antiPatterns: [
          "Enhanced system-prompt instructions as the fix for high-stakes compliance failures (never reaches 0% failure).",
          "Few-shot examples as 'sufficient' for guaranteed compliance — still probabilistic.",
          "Routing classifiers proposed to fix per-agent compliance (classifiers route; they don't enforce per-agent workflow).",
          "Handoff summaries that omit required fields like customer ID or recommended action."
        ],
        deepDive: [
          "The 8% failure rate: a support agent processes refunds without verifying ownership in 8% of cases despite a clear prompt instruction. A stronger prompt might reach 3–4% but never 0%. A programmatic prerequisite gate (process_refund blocked until get_customer returns a verified ID) eliminates the failure entirely.",
          "Structured handoff: the human agent does NOT have the conversation transcript, so the summary must be self-contained — customer ID, conversation summary, root-cause analysis, refund amount (if applicable), and recommended action. An incomplete summary forces the customer to repeat everything."
        ],
        code: {
          title: "Prerequisite gate blocking a financial tool",
          body: "def process_refund(args, session):\n    if not session.get(\"verified_customer_id\"):\n        return {\"error\": \"Identity not verified — call get_customer first.\"}\n    return do_refund(args[\"customer_id\"], args[\"amount\"])"
        },
        compare: {
          bad: "system_prompt += 'Always verify identity before refunds.'\n# 8% still slip through — probabilistic",
          good: "gate: process_refund requires session.verified_customer_id\n# 0% slip through — deterministic"
        },
        examTip: "If the scenario involves money, security, or compliance and the failure rate is non-zero, pick the programmatic gate/hook. Reject every 'stronger prompt' or 'few-shot' option."
      },
      {
        id: "d1.5",
        title: "Agent SDK Hooks",
        intro: "PostToolUse hooks normalise data after execution; tool-call interception hooks enforce policy before execution.",
        concepts: [
          "PostToolUse hooks run after a tool executes, before the model sees the result — used to transform/normalise data.",
          "Tool-call interception hooks run before a tool executes — used to block, modify, or redirect the call.",
          "Normalisation targets: Unix timestamps → ISO 8601, numeric/character status codes → human-readable strings, consistent currency formats.",
          "Interception use cases: refund threshold escalation, AML prerequisite gates, manager-approval workflows.",
          "Framework: 100% requirement → hooks (deterministic); preference tolerating deviation → prompts (probabilistic)."
        ],
        antiPatterns: [
          "Using PostToolUse hooks to BLOCK policy-violating actions — they run after execution, so the action already happened.",
          "Enhanced prompt instructions as the solution for 100% compliance requirements.",
          "Relying on model-side data transformation instead of a PostToolUse normalisation hook.",
          "Confusing hook direction — PostToolUse is after, interception is before."
        ],
        deepDive: [
          "Data-format chaos: three MCP tools return dates as Unix timestamps, ISO 8601, and DD/MM/YYYY, and statuses as numeric codes, English strings, and single characters. Without a hook the model sometimes misreads day/month order or interprets 'P' as 'processed' instead of 'pending'. A PostToolUse hook normalises all of it so the model always receives consistent data.",
          "Side-by-side: international transfers must pass AML checks. A prompt works ~95% — the 5% are regulatory violations. A pre-execution interception hook blocks transfer_funds until aml_check passes — 100%. For markdown formatting, by contrast, a hook is unnecessary overhead; a prompt is fine."
        ],
        code: {
          title: "Two hook directions",
          body: "def post_tool_use(name, result):          # AFTER: normalise\n    result[\"date\"] = to_iso8601(result[\"date\"])\n    return result\n\ndef pre_tool_use(name, args, session):    # BEFORE: enforce\n    if name == \"transfer_funds\" and not session.get(\"aml_passed\"):\n        return Block(\"AML check required\")\n    return Allow()"
        },
        examTip: "Blocking a bad action? It must be a PRE-execution interception hook. Cleaning up messy tool output? PostToolUse. Choosing the wrong direction is the trap."
      },
      {
        id: "d1.6",
        title: "Task Decomposition Strategies",
        intro: "Fixed sequential pipelines vs dynamic adaptive decomposition, and fixing attention dilution with multi-pass architecture.",
        concepts: [
          "Fixed sequential pipelines (prompt chaining): predetermined ordered steps; best for predictable, structured tasks.",
          "Dynamic adaptive decomposition: subtasks generated from discoveries; best for open-ended, unknown-scope tasks.",
          "Fixed = consistent/reliable/debuggable but can't adapt; dynamic = adaptive/thorough but less predictable.",
          "Attention dilution: too many items in one pass → attention per item drops → inconsistent depth.",
          "Multi-pass architecture: per-item local passes (full attention each) + a separate cross-item integration pass."
        ],
        antiPatterns: [
          "A bigger model or larger context window as the fix for attention dilution (it's architectural, not capability).",
          "A single-pass review with 'better prompts' treated as equivalent to multi-pass.",
          "Applying fixed pipelines to open-ended investigation tasks that require adaptation.",
          "Batching files into groups without a cross-file integration pass (misses cross-batch issues)."
        ],
        deepDive: [
          "The 14-file code review: files 1–5 get detailed feedback, 6–9 moderate, 10–14 superficial (missing null-pointer and SQL-injection bugs); a forEach flagged in file 3 is approved in file 11. These are attention-dilution symptoms.",
          "The fix is structural: 14 per-file analysis passes (each file gets dedicated attention, catching the late-file bugs) plus one cross-file integration pass (catching the inconsistent forEach evaluation and data-flow issues). Not a better model, larger window, or stronger prompt."
        ],
        code: {
          title: "Multi-pass decomposition",
          body: "local = [analyse_one(f) for f in files]   # per-item: full attention\ncross = integration_pass(local, files)    # cross-item: flow + consistency\nreport = compile(local, cross)"
        },
        examTip: "Inconsistent depth across many items, or the same pattern judged differently in different files = attention dilution → multi-pass (per-item + integration). Match pattern to task, not to sophistication."
      },
      {
        id: "d1.7",
        title: "Session State & Resumption",
        intro: "Resume vs fork_session vs fresh-start-with-summary, and avoiding the stale context problem after file changes.",
        concepts: [
          "--resume <session-name>: continues a named session, restoring the full history. Use when prior context is still valid.",
          "fork_session: independent branches from a shared baseline for divergent exploration; branches don't see each other.",
          "Fresh start with summary injection: a new session with a curated summary and no stale tool results.",
          "Targeted re-analysis: re-analyse only the changed files, relying on the summary for the rest — beats full re-exploration.",
          "Three options, three purposes: resume = continuation, fork = divergence, fresh+summary = stale results."
        ],
        antiPatterns: [
          "Recommending --resume after files have been modified (stale tool results cause contradictions).",
          "Full re-exploration of a large codebase when only a few files changed (wasteful).",
          "Using fork_session to handle stale context — the fork inherits the stale history.",
          "Confusing fork_session with --resume."
        ],
        deepDive: [
          "Stale context problem: resuming after edits restores old tool results (old file contents). The model reasons from them and gives contradictory advice — recommending fixes already made or referencing code that no longer exists.",
          "The contradictory-advice bug: across two days on a 50-file codebase, three issues fixed overnight; on resume Claude re-recommends the fixed issues and flip-flops between old and new code. The reliable fix is a fresh session with an injected summary ('prior analysis found X/Y/Z; these 3 files changed') plus targeted re-analysis of just those files. Resuming-then-re-reading is insufficient because stale results remain."
        ],
        code: {
          title: "Fresh start + summary + targeted re-analysis (pseudocode)",
          body: "session = new_session()\nsession.inject(summary=prior_findings,\n               changed=[\"auth.ts\", \"session.ts\", \"middleware.ts\"])\nsession.reanalyse(changed_only=True)   # not the whole codebase"
        },
        examTip: "Contradictory advice after editing files = stale context. Best answer: fresh start + summary injection + targeted re-analysis. Naive resume (even with a re-read) and fork both keep stale history."
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
  var D1_FLASHCARDS = [
    { front: "What is the authoritative signal for agentic loop control?", back: "The stop_reason field. tool_use → run tools, append results, continue. end_turn → stop. Never use text-content checks, natural-language parsing, or iteration caps as the primary mechanism." },
    { front: "Why is checking response.content[0].type == 'text' a bug for loop completion?", back: "Claude can return text alongside a tool_use block in the same response. Text presence does not indicate completion — use stop_reason." },
    { front: "What must you do with tool results each loop iteration?", back: "Append them to the conversation history, so Claude can reason about the new information on the next iteration." },
    { front: "When is an iteration cap acceptable in an agentic loop?", back: "Only as a safety net / maximum bound against runaway loops — never as the primary stopping mechanism (stop_reason is primary)." },
    { front: "What is the multi-agent orchestration architecture the exam tests?", back: "Hub-and-spoke: a central coordinator (hub) and specialised subagents (spokes). ALL communication flows through the coordinator; subagents never talk directly to each other." },
    { front: "What context do subagents inherit automatically from the coordinator?", back: "None. Subagents have fully isolated context — no coordinator system prompt, no prior messages, no other subagents' results, no shared memory. Everything must be passed explicitly." },
    { front: "A multi-agent report misses entire categories. Where is the root cause?", back: "The coordinator's task decomposition (too narrow), not the subagents. The fix is broader decomposition." },
    { front: "What gates the ability to spawn subagents in the Agent SDK?", back: "The coordinator's allowedTools must include 'Agent' (or its backward-compatible alias 'Task', renamed in SDK v2.1.63). It's a hard binary requirement." },
    { front: "What are the three context-passing rules?", back: "(1) Include complete findings from prior agents; (2) use structured formats separating content from metadata (source_url, document_name, page_number); (3) specify goals, not procedures." },
    { front: "A synthesis agent produces unsourced claims. Cause and fix?", back: "Cause: the coordinator passed content without structured metadata. Fix: pass metadata alongside content — don't edit the synthesis prompt or give it tool access." },
    { front: "How do you spawn independent subagents with minimal latency?", back: "Emit multiple Agent tool calls in a single coordinator response (parallel spawning), rather than one per turn." },
    { front: "fork_session vs --resume?", back: "fork_session = independent branches from a shared baseline for divergent exploration. --resume = continue a specific named session. Fork = diverge; resume = continue." },
    { front: "Prompt-based guidance vs programmatic enforcement?", back: "Prompt guidance is probabilistic (~90–95%). Programmatic enforcement (hooks, prerequisite gates) is deterministic (100%). Use enforcement when a single failure means financial loss, security breach, or compliance violation." },
    { front: "What is a prerequisite gate?", back: "A code-level check that blocks a tool until a prior condition is met (e.g. process_refund blocked until get_customer returns a verified ID). The model cannot bypass it." },
    { front: "Required fields in a structured human handoff summary?", back: "Customer ID, conversation summary, root-cause analysis, refund amount (if applicable), and recommended action — because the human has no access to the transcript." },
    { front: "PostToolUse hook vs tool-call interception hook — direction and purpose?", back: "PostToolUse runs AFTER execution to normalise/transform data. Interception runs BEFORE execution to block/modify/redirect the call (enforce policy)." },
    { front: "Why can't a PostToolUse hook block a policy-violating action?", back: "It runs after the tool executes — by the time it fires, the non-compliant action has already happened. Use a pre-execution interception hook to block." },
    { front: "What is attention dilution and how do you fix it?", back: "Processing too many items in one pass lowers attention per item, causing inconsistent depth. Fix with multi-pass architecture: per-item local passes + a cross-item integration pass. NOT a bigger model or stronger prompt." },
    { front: "Fixed sequential pipeline vs dynamic adaptive decomposition?", back: "Fixed pipeline (prompt chaining): predetermined ordered steps for predictable/structured tasks. Dynamic decomposition: subtasks generated from discoveries for open-ended/unknown-scope tasks." },
    { front: "What is the stale context problem?", back: "Resuming a session after editing files restores old tool results (old file contents). The model reasons from stale data and gives contradictory advice — recommending fixes already made or referencing code that no longer exists." },
    { front: "Best fix for stale context after modifying 3 of 50 files?", back: "Fresh start with summary injection + targeted re-analysis of only the 3 changed files. Naive resume (even with re-read) and fork both keep the stale history; full re-exploration is wasteful." },
    { front: "What are SubagentStart and SubagentStop hooks?", back: "Lifecycle hooks: SubagentStart fires when a subagent is spawned (log/validate/rate-limit); SubagentStop fires when it returns (validate/sanitise output). Stop hooks in subagent frontmatter auto-convert to SubagentStop." }
  ];
  Array.prototype.push.apply(window.FLASHCARDS, D1_FLASHCARDS);
})();
