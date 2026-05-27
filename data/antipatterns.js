/*
 * Anti-patterns cheatsheet — the most common wrong answers and distractors on
 * the Claude Certified Architect Foundations exam, aligned with the rebuilt
 * domain deep-dive content in data/d1.js … d5.js.
 *
 * Updates in this revision (accuracy fixes against the new reference content):
 *   - ap3: blocking enforcement uses PRE-execution tool-call interception, not
 *     PostToolUse (PostToolUse runs after execution → too late to block).
 *   - Added critical missing traps: tool_choice "any" creating infinite loops,
 *     direct inter-subagent communication, subagent context isolation, few-shot
 *     and routing classifier as first fix for misrouting, the new-team-member
 *     trap (team conventions in user-level CLAUDE.md), defaulting to Read+Write
 *     on Edit's non-unique match, bigger-context-window-to-fix-degradation,
 *     resume-after-file-edits inheriting stale context.
 *
 * Each item: { id, domain, severity ("critical"|"high"|"medium"),
 *              title, why, fix, fixWhy }.
 */
window.ANTI_PATTERNS = [

  // ===== Domain 1 — Agentic Architecture & Orchestration =====
  {
    id: "ap1",
    domain: "D1",
    severity: "critical",
    title: "Parsing natural language for loop termination",
    why: "Natural-language phrases like \"I'm done\" or \"task complete\" are ambiguous and unreliable. The model may continue with another step while sounding finished.",
    fix: "Use stop_reason — continue on \"tool_use\", terminate on \"end_turn\".",
    fixWhy: "stop_reason is the deterministic, content-agnostic signal Claude returns specifically for loop control."
  },
  {
    id: "ap2",
    domain: "D1",
    severity: "critical",
    title: "Iteration caps as the PRIMARY stopping mechanism",
    why: "Caps either cut off useful work (task needed 12 iterations, cap was 10) or run unnecessary iterations (task finished in 3). They mask the underlying signal.",
    fix: "Let stop_reason terminate the loop; keep iteration caps only as a safety net against runaway agents.",
    fixWhy: "stop_reason reflects task completion; iteration counts don't."
  },
  {
    id: "ap2b",
    domain: "D1",
    severity: "critical",
    title: "Checking response.content[0].type == 'text' as a completion signal",
    why: "Claude can return text ALONGSIDE a tool_use block in the same response. Content[0]=='text' often misclassifies an ongoing tool-using turn as finished.",
    fix: "Inspect stop_reason; ignore content[0].type for loop control.",
    fixWhy: "stop_reason is unambiguous; content composition is not."
  },
  {
    id: "ap2c",
    domain: "D1",
    severity: "high",
    title: "Setting tool_choice to \"any\" permanently inside an agentic loop",
    why: "Forcing a tool call on every turn means Claude can never produce stop_reason \"end_turn\". The loop never terminates naturally and runs until any safety cap fires.",
    fix: "Use \"any\" only for a single step that must produce structured output (e.g. one extraction across multiple schemas), not as the loop's steady state.",
    fixWhy: "Natural termination via end_turn is exactly what an agentic loop is designed around."
  },
  {
    id: "ap3",
    domain: "D1",
    severity: "critical",
    title: "Prompt-based enforcement for critical business rules",
    why: "System-prompt instructions are probabilistic — even good ones fail a small fraction of the time, which is unacceptable for financial / security / regulatory operations.",
    fix: "Use PRE-execution tool-call interception (prerequisite gates / blocking hooks) for deterministic enforcement.",
    fixWhy: "Pre-execution hooks are code that runs BEFORE the tool fires, so the policy-violating call never executes. PostToolUse hooks run AFTER execution and can only react, not prevent — they are the wrong direction for blocking."
  },
  {
    id: "ap3b",
    domain: "D1",
    severity: "high",
    title: "Using PostToolUse hooks to BLOCK policy-violating actions",
    why: "PostToolUse fires after the tool has already executed. By the time it sees the violation, the refund / transfer / delete has already happened.",
    fix: "Use pre-execution tool-call interception for blocking; reserve PostToolUse for transforming results before the model sees them (e.g. format normalisation).",
    fixWhy: "Hook direction matters: PRE-execution prevents, POST-execution reacts."
  },
  {
    id: "ap4",
    domain: "D1",
    severity: "high",
    title: "Sentiment-based escalation to a human agent",
    why: "Customer frustration does not correlate with case complexity. A furious customer with a simple damage claim is easy to resolve; a calm customer with a policy gap needs human judgement.",
    fix: "Escalate on the three valid triggers: explicit human request, policy gaps, or inability to make meaningful progress after attempting resolution.",
    fixWhy: "These triggers reflect actual decision boundaries; sentiment scores reflect emotional state, not what the agent can or can't do."
  },
  {
    id: "ap5",
    domain: "D1",
    severity: "high",
    title: "Self-reported LLM confidence as the basis for escalation or routing",
    why: "Raw LLM confidence is poorly calibrated — the model is often confidently wrong on hard cases and overly uncertain on easy ones.",
    fix: "Use explicit categorical criteria first; if you must use confidence for routing, calibrate thresholds against labelled validation sets so each threshold maps to a known accuracy.",
    fixWhy: "Calibrated thresholds reflect measured accuracy on real data; raw scores reflect the model's miscalibrated self-assessment."
  },
  {
    id: "ap5b",
    domain: "D1",
    severity: "high",
    title: "Allowing direct inter-subagent communication",
    why: "Bypassing the coordinator breaks observability, consistent error handling, and controlled information flow — the three benefits of hub-and-spoke architecture.",
    fix: "Route ALL inter-subagent communication through the coordinator, regardless of perceived efficiency gains.",
    fixWhy: "The coordinator is the single point that logs, applies uniform error policies, and decides what context each subagent receives."
  },
  {
    id: "ap5c",
    domain: "D1",
    severity: "high",
    title: "Assuming subagents inherit the coordinator's conversation history",
    why: "Subagents have fully isolated context. They start with only what the coordinator explicitly puts in their prompt — no system prompt, no prior messages, no other subagents' results, no shared memory.",
    fix: "Pass every required piece of context (findings, source URLs, document names) explicitly in the subagent's prompt; use structured records, not raw history.",
    fixWhy: "Subagent isolation is the architectural reality; designs that assume otherwise produce silent attribution and coverage gaps."
  },

  // ===== Domain 2 — Tool Design & MCP Integration =====
  {
    id: "ap6",
    domain: "D2",
    severity: "critical",
    title: "Generic error messages like \"Operation failed\"",
    why: "Without structured detail, the agent cannot decide whether to retry, take an alternative path, or escalate.",
    fix: "Return structured errors: isError, errorCategory (transient | validation | business | permission), isRetryable, description, and any partial results.",
    fixWhy: "Structured error context lets the model branch its recovery on the actual failure type rather than guessing."
  },
  {
    id: "ap7",
    domain: "D2",
    severity: "critical",
    title: "Silently returning empty results for access failures",
    why: "If the tool couldn't reach the source but returns { results: [], status: 'success' }, the agent treats \"couldn't check\" as \"checked and found nothing\" — the worst kind of silent failure.",
    fix: "Distinguish access failure (isError: true, errorCategory transient/permission) from valid empty result (isError: false, resultCount: 0).",
    fixWhy: "Access failures should be retried or escalated; valid empty results are the answer and should not be retried."
  },
  {
    id: "ap8",
    domain: "D2",
    severity: "high",
    title: "Giving one agent 18+ tools",
    why: "Selection reliability degrades as the toolkit grows. Similar-purpose tools create disambiguation problems.",
    fix: "Aim for 4–5 tools per agent, scoped to its role; add a scoped cross-role tool for high-frequency hot paths that would otherwise route through the coordinator.",
    fixWhy: "Smaller, role-focused toolkits produce more reliable selection."
  },
  {
    id: "ap8b",
    domain: "D2",
    severity: "high",
    title: "Few-shot examples or a routing classifier as the FIRST fix for tool misrouting",
    why: "Few-shot adds token overhead without addressing the cause; a routing classifier is over-engineered as a first step and bypasses the model's NLU. The proportionate fix is the low-effort/high-leverage one: better descriptions.",
    fix: "Expand each tool description with purpose, input formats, example queries, edge cases, and explicit boundaries (\"do NOT use for X — use Y\").",
    fixWhy: "Tool descriptions are the PRIMARY mechanism the model uses for selection; clarifying them directly addresses the misrouting cause."
  },
  {
    id: "ap8c",
    domain: "D2",
    severity: "medium",
    title: "Using tool_choice \"auto\" when guaranteed structured output is required",
    why: "auto lets the model return plain text instead of calling a tool — no structural guarantee.",
    fix: "Use tool_choice \"any\" (must call SOME tool — model picks the schema) for unknown document types; use forced selection {type:'tool', name:...} for a mandatory first step.",
    fixWhy: "Each tool_choice mode has a specific guarantee; pick the one that matches your need."
  },
  {
    id: "ap9",
    domain: "D2",
    severity: "critical",
    title: "Hardcoding API keys in .mcp.json",
    why: ".mcp.json is version-controlled; the credential enters git history and is exposed to anyone with repo access.",
    fix: "Use ${ENV_VAR} expansion in .mcp.json; each developer sets the value in their local environment.",
    fixWhy: "The committed file references variable names, not values — rotation needs no commit and no secret leaks via history."
  },
  {
    id: "ap9b",
    domain: "D2",
    severity: "medium",
    title: "Defaulting to Read + Write on an Edit non-unique-match failure",
    why: "Read + Write loads the whole file into context just to change a line. It burns far more tokens than necessary and bypasses Edit's safety check.",
    fix: "First widen old_string with surrounding context until it pins down one location; if every occurrence should change, set replace_all: true.",
    fixWhy: "The documented Edit recovery preserves the unique-match safety and avoids loading the entire file as a fallback."
  },

  // ===== Domain 3 — Claude Code Configuration & Workflows =====
  {
    id: "ap10",
    domain: "D3",
    severity: "critical",
    title: "Team conventions stored in user-level ~/.claude/CLAUDE.md",
    why: "User-level config is personal and not shared via git. A new team member clones the repo and never receives the conventions — the \"new-team-member trap\".",
    fix: "Put team-wide standards in project-level .claude/CLAUDE.md (or root CLAUDE.md) so they ship with the repo.",
    fixWhy: "Project-level config is version-controlled and applied automatically for every contributor on clone."
  },
  {
    id: "ap10b",
    domain: "D3",
    severity: "medium",
    title: "Personal preferences in project-level .claude/CLAUDE.md",
    why: "Personal verbosity or style preferences should not be imposed on every teammate.",
    fix: "Put personal preferences in ~/.claude/CLAUDE.md (user-level) and team standards in project-level config.",
    fixWhy: "Each scope serves a different audience: user-level for one person, project-level for the team."
  },
  {
    id: "ap10c",
    domain: "D3",
    severity: "high",
    title: "Relying on CLAUDE.md for deterministic enforcement",
    why: "CLAUDE.md files are concatenated guidance, not a strict-precedence config. Conflicting rules may resolve arbitrarily; the docs explicitly say there's no guarantee of strict compliance.",
    fix: "For rules that MUST hold every run (blocked tool, required formatter, permission policy), encode them in settings.json or a hook.",
    fixWhy: "settings.json has a strict precedence chain and is client-enforced; hooks fire at fixed lifecycle events. Both are deterministic in ways CLAUDE.md is not."
  },
  {
    id: "ap11",
    domain: "D3",
    severity: "high",
    title: "Putting always-on conventions in a Skill instead of CLAUDE.md or .claude/rules/",
    why: "Skills load on-demand as task workflows. Always-on conventions that should shape every edit shouldn't depend on the developer remembering to invoke a skill.",
    fix: "Use CLAUDE.md (or path-scoped .claude/rules/) for always-on conventions; reserve skills for invocable task workflows.",
    fixWhy: "Memory files attach to every session (or every matching file, for path-scoped rules); skills attach to invocation."
  },
  {
    id: "ap11b",
    domain: "D3",
    severity: "medium",
    title: "Using @import as a CLAUDE.md import directive",
    why: "There is no @import keyword. The directive is bare \"@\" followed by a path on its own line.",
    fix: "Use @./standards/naming.md (one path per line), not @import …",
    fixWhy: "The bare @path syntax is the documented form; @import will be inlined as text and ignored."
  },
  {
    id: "ap12",
    domain: "D3",
    severity: "critical",
    title: "Same-session self-review in CI/CD pipelines",
    why: "The reviewing session inherits the generating session's reasoning context, so it tends to confirm rather than challenge its own decisions.",
    fix: "Use a SEPARATE, independent `claude -p` invocation for review — the artefact only, no shared session context.",
    fixWhy: "Without the generator's reasoning trail, the reviewer evaluates the code on its own merits."
  },
  {
    id: "ap12b",
    domain: "D3",
    severity: "critical",
    title: "Running Claude Code in CI without the -p (--print) flag",
    why: "Without -p, Claude Code starts in interactive mode and the CI job hangs waiting for input that never arrives.",
    fix: "Use `claude -p \"…\"` for non-interactive print mode (process prompt → stdout → exit). The single most directly testable fact in Domain 3.",
    fixWhy: "-p is the documented non-interactive mode; CLAUDE_HEADLESS=true, --batch, and stdin redirection are not the correct fixes (some don't exist)."
  },
  {
    id: "ap12c",
    domain: "D3",
    severity: "high",
    title: "Using the Message Batches API for blocking pre-merge checks",
    why: "The Batches API has up to a 24-hour processing window with no latency SLA. Pre-merge checks are blocking — developers wait to merge.",
    fix: "Synchronous API for blocking workflows; Batches API only for latency-tolerant work (overnight reports, weekly audits, nightly test generation).",
    fixWhy: "Match the API to the latency requirement; ~50% cost savings don't justify blocking developers for hours."
  },

  // ===== Domain 4 — Prompt Engineering & Structured Output =====
  {
    id: "ap13",
    domain: "D4",
    severity: "critical",
    title: "Vague instructions like \"be conservative\" or \"only high-confidence findings\"",
    why: "The model has no actionable interpretation of \"conservative\" or \"high-confidence\". Outputs remain inconsistent and false positives stay high.",
    fix: "Define explicit categorical criteria with concrete code examples per severity level; specify what to FLAG and what to SKIP.",
    fixWhy: "Concrete criteria + example patterns give the model an actionable decision boundary instead of subjective interpretation."
  },
  {
    id: "ap13b",
    domain: "D4",
    severity: "high",
    title: "Tolerating one noisy category with a high false-positive rate",
    why: "High false positives in ONE category destroy developer trust in ALL categories — they stop reading the entire review output, missing accurate findings.",
    fix: "Temporarily disable the noisy category; refine its criteria with concrete code examples; re-enable once precision is acceptable.",
    fixWhy: "Trust-recovery is system-wide. Disabling restores trust in the working categories immediately while you iterate offline."
  },
  {
    id: "ap14",
    domain: "D4",
    severity: "high",
    title: "Assuming tool_use guarantees semantic correctness",
    why: "tool_use with JSON schemas guarantees STRUCTURE only — type-checks, required fields, valid JSON. Values inside (sum totals, field placement, fabrications) can still be wrong.",
    fix: "Pair tool_use with semantic validation (e.g. line items must sum to stated_total, dates must be in range) and a retry loop with specific error feedback.",
    fixWhy: "Structural correctness is a necessary but insufficient guarantee; semantic checks catch the errors schemas can't."
  },
  {
    id: "ap14b",
    domain: "D4",
    severity: "high",
    title: "All-required-fields schemas pressuring the model to fabricate",
    why: "When a required field is genuinely absent from the source document, the model fills it with a plausible-looking value rather than violating the schema.",
    fix: "Make fields optional and nullable (type: [\"string\", \"null\"]) when the source document may not contain them; add \"unclear\" / \"other\" enum values.",
    fixWhy: "Honest null beats fabricated value; schema design is the lever, not a \"don't hallucinate\" instruction."
  },
  {
    id: "ap15",
    domain: "D4",
    severity: "high",
    title: "Generic retry messages like \"there were errors, try again\"",
    why: "Without specific error context the model has no signal for what to fix and tends to reproduce the same mistake.",
    fix: "Send back the original document + the failed extraction + the specific validation error (e.g. \"line items sum to £450 but stated_total is £500\").",
    fixWhy: "Targeted feedback gives the model a concrete correction target; generic feedback gives it nothing actionable."
  },
  {
    id: "ap15b",
    domain: "D4",
    severity: "high",
    title: "Retrying when the source genuinely lacks the information",
    why: "If the data simply isn't in the source, retrying produces another null or, worse, a fabricated value.",
    fix: "Distinguish fixable errors (format mismatch, missed line item, misplaced field) from genuinely absent information; flag absent info for human review.",
    fixWhy: "Retries are powerful for format/structural errors but cannot create information that doesn't exist."
  },

  // ===== Domain 5 — Context Management & Reliability =====
  {
    id: "ap16",
    domain: "D5",
    severity: "critical",
    title: "Progressive summarisation of critical transactional facts",
    why: "Each round of summarisation tends to lose specifics: customer IDs, order numbers, amounts, dates.",
    fix: "Use an immutable case-facts block at the start of the prompt holding the transactional facts; never summarise it.",
    fixWhy: "Case facts are exempted from summarisation and sit in a high-recall position — surviving long conversations intact."
  },
  {
    id: "ap16b",
    domain: "D5",
    severity: "high",
    title: "Bigger context window as a fix for context degradation",
    why: "Context degradation is not a capacity problem. The model still loses grip on earlier findings as verbose output accumulates — a bigger window just delays the same problem.",
    fix: "Use scratchpad files (persist key findings outside the conversation), subagent context isolation, proactive /compact, and structured state manifests for crash recovery.",
    fixWhy: "Each addresses a different facet of degradation that capacity alone doesn't touch."
  },
  {
    id: "ap16c",
    domain: "D5",
    severity: "high",
    title: "Using --resume (or fork_session) after files have changed on disk",
    why: "Both keep the prior conversation history, including stale tool reads that no longer match the on-disk content. The agent reasons from outdated content.",
    fix: "Start a fresh session and inject a structured summary of prior findings PLUS the list of changed files; let the agent re-read only those.",
    fixWhy: "A fresh session has no stale tool results; the injected summary preserves what was learned without carrying outdated reads forward."
  },
  {
    id: "ap17",
    domain: "D5",
    severity: "critical",
    title: "Aggregate accuracy metrics only (\"95% overall\")",
    why: "Aggregates mask per-segment failures. Standard invoices at 99% can hide handwritten receipts at 70% in the same metric.",
    fix: "Track accuracy stratified by document type and field; calibrate confidence thresholds against labelled validation sets per segment.",
    fixWhy: "Per-segment metrics reveal hidden failures; calibration translates raw model confidence into known accuracy at each threshold."
  },
  {
    id: "ap17b",
    domain: "D5",
    severity: "high",
    title: "Workflow termination on the first subagent failure",
    why: "Aborting the entire pipeline discards partial results from the other subagents that completed successfully.",
    fix: "Propagate a structured error (type + attempted action + partial results + alternatives) and let the coordinator continue with partials, annotating coverage gaps.",
    fixWhy: "Selective propagation preserves useful work while surfacing the failure honestly."
  },
  {
    id: "ap18",
    domain: "D5",
    severity: "high",
    title: "No provenance tracking in multi-source synthesis",
    why: "When subagents produce conflicting data, the synthesis agent has no basis for deciding which source to trust, and the final report cannot be traced back to sources.",
    fix: "Pass structured claim-source mappings (claim + source URL + document name + date + relevance) through every step; preserve them through synthesis.",
    fixWhy: "Provenance enables informed conflict resolution and produces traceable, verifiable reports."
  },
  {
    id: "ap18b",
    domain: "D5",
    severity: "high",
    title: "Silently picking one value when two credible sources conflict",
    why: "Arbitrary selection destroys information. The difference may be a real trend (different publication dates) rather than a data-quality issue.",
    fix: "Annotate BOTH values with source attribution, publication date, and a possible explanation for the difference; let the reader decide.",
    fixWhy: "Preserving conflicting information with context is more honest and often surfaces a story that single-value reporting hides."
  }
];
