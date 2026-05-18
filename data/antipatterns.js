/*
 * 18 anti-patterns across 5 domains — the official cheatsheet.
 * Severity: critical (10), high (7), medium (1).
 */
window.ANTI_PATTERNS = [
  // ===== Domain 1 =====
  {
    id: "ap1",
    domain: "D1",
    severity: "critical",
    title: "Parsing natural language for loop termination",
    why: "Text content is for the user, not control flow. The model may phrase completion differently each time.",
    fix: "Check stop_reason field (tool_use vs end_turn).",
    fixWhy: "stop_reason is a structured, deterministic field that reliably signals whether the agent needs to continue."
  },
  {
    id: "ap2",
    domain: "D1",
    severity: "critical",
    title: "Arbitrary iteration caps as primary stopping mechanism",
    why: "May cut off the agent mid-task or allow it to loop pointlessly. Does not reflect task completion.",
    fix: "Let the agentic loop terminate naturally via stop_reason.",
    fixWhy: "The model decides when it is done based on task state, not an arbitrary number."
  },
  {
    id: "ap3",
    domain: "D1",
    severity: "critical",
    title: "Prompt-based enforcement for critical business rules",
    why: "Prompts are probabilistic. The model CAN and WILL sometimes ignore critical instructions.",
    fix: "Use programmatic hooks (PreToolUse/PostToolUse) for deterministic enforcement.",
    fixWhy: "Hooks run as code, not suggestions. They provide 100% reliable enforcement."
  },
  {
    id: "ap4",
    domain: "D1",
    severity: "high",
    title: "Sentiment-based escalation to human agents",
    why: "An angry customer with a simple request does NOT need a human. Sentiment does not equal task complexity.",
    fix: "Escalate based on policy gaps, capability limits, explicit requests, or business thresholds.",
    fixWhy: "Objective criteria prevent unnecessary escalations while catching genuine edge cases."
  },
  {
    id: "ap5",
    domain: "D1",
    severity: "high",
    title: "Self-reported confidence scores for decision-making",
    why: "Model confidence scores are not well-calibrated and cannot be relied upon for production decisions.",
    fix: "Use structured criteria and programmatic checks for escalation decisions.",
    fixWhy: "Programmatic checks based on observable facts are reliable and auditable."
  },

  // ===== Domain 2 =====
  {
    id: "ap6",
    domain: "D2",
    severity: "critical",
    title: "Generic error messages ('Operation failed')",
    why: "The agent cannot decide whether to retry, try an alternative, or escalate without details.",
    fix: "Return structured errors: isError, errorCategory, isRetryable, and context.",
    fixWhy: "Structured errors give the agent enough information to make intelligent recovery decisions."
  },
  {
    id: "ap7",
    domain: "D2",
    severity: "critical",
    title: "Silently returning empty results for access failures",
    why: "The agent thinks 'no results found' when the real problem is 'could not even check.' This leads to catastrophic misunderstandings.",
    fix: "Distinguish access failures (isError: true) from genuinely empty results (isError: false, results: []).",
    fixWhy: "The agent knows whether data is missing because it was not found vs. because the search failed."
  },
  {
    id: "ap8",
    domain: "D2",
    severity: "high",
    title: "Giving one agent 18+ tools",
    why: "Tool selection accuracy degrades rapidly above 5 tools. Similar tools create ambiguity.",
    fix: "Keep 4-5 tools per agent. Distribute the rest across specialized subagents.",
    fixWhy: "Focused agents with fewer tools make better selections and produce higher quality results."
  },
  {
    id: "ap9",
    domain: "D2",
    severity: "critical",
    title: "Hardcoding API keys in .mcp.json configuration",
    why: "Configuration files are committed to git. Hardcoded secrets get leaked.",
    fix: "Use ${ENV_VAR} environment variable expansion in MCP config.",
    fixWhy: "Secrets stay in the environment, not in version-controlled files."
  },

  // ===== Domain 3 =====
  {
    id: "ap10",
    domain: "D3",
    severity: "medium",
    title: "Putting personal preferences in project-level CLAUDE.md",
    why: "Personal preferences (editor settings, themes) should not be imposed on the whole team.",
    fix: "Use ~/.claude/CLAUDE.md for personal prefs, .claude/CLAUDE.md for team standards.",
    fixWhy: "Each configuration layer has a specific purpose and audience."
  },
  {
    id: "ap11",
    domain: "D3",
    severity: "high",
    title: "Using commands for complex tasks that need context isolation",
    why: "Commands run in the current session context, polluting it with exploration noise.",
    fix: "Use skills with context: fork and allowed-tools restrictions.",
    fixWhy: "Forked context keeps exploration separate. Tool restrictions prevent accidental side effects."
  },
  {
    id: "ap12",
    domain: "D3",
    severity: "critical",
    title: "Same-session self-review in CI/CD pipelines",
    why: "The reviewer retains the generator's reasoning context, creating confirmation bias.",
    fix: "Use separate sessions for code generation and code review.",
    fixWhy: "A fresh session reviews the code objectively with no preconceptions."
  },

  // ===== Domain 4 =====
  {
    id: "ap13",
    domain: "D4",
    severity: "critical",
    title: "Vague instructions like 'be thorough' or 'find all issues'",
    why: "Leads to over-flagging, false positives, and alert fatigue. Developers stop trusting the tool.",
    fix: "Provide explicit, measurable criteria: 'flag functions exceeding 50 lines'.",
    fixWhy: "Specific criteria produce consistent, actionable results that build trust."
  },
  {
    id: "ap14",
    domain: "D4",
    severity: "high",
    title: "Assuming tool_use guarantees semantic correctness",
    why: "tool_use guarantees STRUCTURE only. Values inside the JSON may still be wrong.",
    fix: "Validate extracted values after tool_use with business rule checks.",
    fixWhy: "Schema compliance + semantic validation together ensure both correct format AND correct content."
  },
  {
    id: "ap15",
    domain: "D4",
    severity: "high",
    title: "Generic retry messages: 'There were errors, please try again'",
    why: "Without specific error details, the model has no signal for what to fix.",
    fix: "Append specific error details: which field, what was wrong, expected vs actual.",
    fixWhy: "Specific feedback gives the model a clear correction target."
  },

  // ===== Domain 5 =====
  {
    id: "ap16",
    domain: "D5",
    severity: "critical",
    title: "Progressive summarization of critical customer details",
    why: "Each round of summarization loses specifics: names, IDs, amounts, dates.",
    fix: "Use immutable 'case facts' blocks positioned at the start of context.",
    fixWhy: "Case facts are never summarized and sit in a high-recall position (beginning of context)."
  },
  {
    id: "ap17",
    domain: "D5",
    severity: "critical",
    title: "Aggregate accuracy metrics only (e.g., '95% overall')",
    why: "Aggregate metrics mask per-category failures. Invoices at 70% while receipts at 99% still averages 95%.",
    fix: "Track accuracy per document type (stratified metrics).",
    fixWhy: "Per-type tracking reveals hidden failures that aggregate metrics conceal."
  },
  {
    id: "ap18",
    domain: "D5",
    severity: "high",
    title: "No provenance tracking for multi-agent data",
    why: "When subagents provide conflicting data, there is no way to determine which source to trust.",
    fix: "Track source, confidence level, timestamp, and agent ID for all data.",
    fixWhy: "Provenance metadata enables informed conflict resolution and audit trails."
  }
];
