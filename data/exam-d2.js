/*
 * Domain 2 — Exam-Sim Bank
 *
 * Original scenario-based questions authored from the public concepts in
 * Anthropic's docs (MCP, tool use, Claude Code built-in tools) and the
 * deep-dive content in data/d2.js. Each question is paired with per-option
 * rationales. Topic IDs match the existing study content (d2.1 – d2.5).
 *
 * Populates window.EXAM_BANK.D2. Schema per question:
 *   { id, source:"extra", domain:"D2", topic:"d2.X", topicTitle,
 *     question, options:[A,B,C,D], answer: 0-3 (pre-shuffle index),
 *     rationales:[whyA, whyB, whyC, whyD] }
 */
(function () {
  "use strict";

  window.EXAM_BANK = window.EXAM_BANK || {};

  var D2 = [
    // ====================================================================
    // 2.1 — Tool Interface Design
    // ====================================================================
    {
      id: "d2.1-extra-1", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "A team has two billing tools, `fetch_invoice` and `get_billing_history`. Each description is a single sentence (\"Retrieves invoice\" / \"Retrieves billing history\"). The agent sometimes routes \"what was my last charge?\" to `fetch_invoice` and other times to `get_billing_history`. What is the most effective first step?",
      options: [
        "Consolidate both tools into a single `get_billing_data` tool that returns whatever the caller asks for",
        "Expand each tool description to include input formats, example queries, edge cases, and a boundary statement explaining when to use it versus the sibling tool",
        "Add a routing classifier that inspects the user message and pre-selects a tool before the model sees the query",
        "Add eight few-shot examples of correct tool selection to the system prompt"
      ],
      answer: 1,
      rationales: [
        "Consolidation is a valid long-term architectural choice but requires more effort than expanding descriptions. The exam favours low-effort high-leverage fixes first.",
        "Tool descriptions are the primary mechanism for selection. Expanding them with inputs, example queries, edge cases, and explicit boundaries (\"do NOT use for X — use Y\") is the lowest-effort, highest-leverage fix and directly addresses the disambiguation problem.",
        "A routing classifier is over-engineered as a first step and bypasses the model's natural-language understanding. Try descriptions first.",
        "Few-shot examples add token overhead and treat the symptom (inconsistent selection) rather than the cause (sparse descriptions). Improve descriptions first."
      ]
    },
    {
      id: "d2.1-extra-2", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "Which of the following is NOT one of the five elements of a production-grade tool description?",
      options: [
        "Purpose — what the tool does, stated unambiguously",
        "Inputs — data types, formats, constraints, and required vs optional fields",
        "Performance benchmarks — typical latency, throughput, and rate limits",
        "Boundaries — when to use THIS tool versus similar tools in the same toolkit"
      ],
      answer: 2,
      rationales: [
        "Purpose is one of the five elements (the tool's primary function).",
        "Inputs are one of the five elements (data shape and constraints).",
        "Performance benchmarks are NOT part of the five elements. The five are: purpose, inputs, example queries, edge cases / limitations, and explicit boundaries. The model selects on semantic intent, not performance metrics.",
        "Boundaries are one of the five elements (\"do NOT use for X — use Y\") — the disambiguation lever."
      ]
    },
    {
      id: "d2.1-extra-3", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "After expanding tool descriptions with full inputs, examples, and boundaries, an agent STILL routes customer queries inconsistently. A teammate notices the system prompt contains: \"For every interaction, ALWAYS check customer details first before taking any action.\" What is most likely happening?",
      options: [
        "Keyword-sensitive system-prompt wording is silently creating an association between any customer-related query and the customer-lookup tool, overriding the disambiguated descriptions",
        "The model is ignoring tool descriptions because they exceed an internal token budget",
        "The new descriptions are too long and need to be trimmed back to one sentence each",
        "The tools must be re-registered with the API for new descriptions to take effect"
      ],
      answer: 0,
      rationales: [
        "Keyword-sensitive instructions in system prompts (e.g. \"always check customer details\") can create unintended tool associations that override well-written descriptions. Always review system prompts after editing tool descriptions.",
        "There is no \"description token budget\" that silently disables them. Detailed descriptions are exactly what's recommended.",
        "Long, structured descriptions are encouraged, not penalised. Brevity is what caused the original misrouting.",
        "Tool descriptions take effect on the next request; there is no separate registration step."
      ]
    },
    {
      id: "d2.1-extra-4", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "A team has a single generic tool `analyze_document` that the model uses for extraction, summarisation, and claim verification. Selection is inconsistent — sometimes it extracts when the user asked for a summary, sometimes vice versa. What is the appropriate fix?",
      options: [
        "Add a `mode` parameter to `analyze_document` (\"extract\" / \"summarise\" / \"verify\") and rely on the model to populate it correctly",
        "Split the generic tool into purpose-specific tools such as `extract_data_points`, `summarise_content`, and `verify_claim_against_source`, each with its own narrow described purpose",
        "Increase the model temperature so it explores different intents per call",
        "Combine all three behaviours into the description and let the model pick the right one at runtime"
      ],
      answer: 1,
      rationales: [
        "Adding a mode parameter still gives the model one tool with one description; it now also has to choose the correct mode, which is the same problem at a finer grain.",
        "Tool splitting replaces a broad generic tool with purpose-specific tools that each have a narrow, clearly described purpose. The model selects on intent rather than disambiguating modes inside one tool.",
        "Higher temperature increases variability; it doesn't add semantic clarity to selection.",
        "Stuffing more intents into one description doesn't disambiguate; it confuses the model further."
      ]
    },
    {
      id: "d2.1-extra-5", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "Two tools, `analyse_content` and `analyse_text`, have functional overlap that confuses the model. A team-wide refactor is acceptable. What is the most direct interface-level fix?",
      options: [
        "Set tool_choice to `any` so the model always picks one of the two",
        "Rename one to something specific that captures what it actually does (for example `extract_web_results`) and update its description, so the two no longer overlap at the interface level",
        "Delete both tools and rebuild the workflow without them",
        "Add 10 few-shot examples comparing the two side-by-side"
      ],
      answer: 1,
      rationales: [
        "tool_choice doesn't disambiguate two overlapping tools; it just forces a tool call.",
        "Tool renaming eliminates overlap at the interface level without changing implementation. The new name + scoped description gives the model an unambiguous signal.",
        "Deleting both is disproportionate when the underlying workflow is needed; rename is the targeted fix.",
        "Few-shot examples treat the symptom; renaming addresses the structural overlap directly."
      ]
    },
    {
      id: "d2.1-extra-6", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "A junior engineer proposes building a routing classifier that inspects each user message and pre-selects a tool before the LLM sees the query. Why is this NOT the recommended first response to a misrouting problem?",
      options: [
        "Classifiers cannot be deployed alongside the Messages API",
        "It is over-engineered as a first step, adds infrastructure complexity, and bypasses the model's own natural-language understanding — which improving descriptions exploits",
        "Classifiers always produce worse selection accuracy than LLMs",
        "Routing classifiers are disallowed in production Claude deployments"
      ],
      answer: 1,
      rationales: [
        "Classifiers can absolutely sit in front of the API; the issue is proportionality, not deployability.",
        "A routing classifier is a valid pattern long-term but disproportionate as a first step: it adds infrastructure, training/maintenance, and bypasses the NLU you're paying the model for. Expand descriptions first.",
        "Classifiers can perform well in narrow domains; the point is they're a heavier intervention than a description fix.",
        "Nothing disallows routing classifiers; the recommendation is just about ordering."
      ]
    },
    {
      id: "d2.1-extra-7", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "Which element of a production-grade tool description provides explicit DISAMBIGUATION against similar tools in the same toolkit?",
      options: [
        "Purpose — the primary function stated unambiguously",
        "Inputs — formats, constraints, and required/optional fields",
        "Edge cases — what happens outside expected ranges",
        "Boundaries — explicit \"do NOT use for X — use Y for that\" statements about when to use this tool versus similar ones"
      ],
      answer: 3,
      rationales: [
        "Purpose tells the model what the tool does, but two similar tools can both have valid purposes — disambiguation needs more.",
        "Inputs clarify shape and constraints; they don't say when to prefer this tool over a sibling.",
        "Edge cases describe failure / limit behaviour, not which sibling tool to prefer for a given query.",
        "Boundaries are the disambiguation lever. They tell the model explicitly when NOT to use this tool and which sibling to use instead — the most direct fix for sibling-tool misrouting."
      ]
    },
    {
      id: "d2.1-extra-8", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "A team's first instinct to fix misrouting is to add eight carefully crafted few-shot examples to the system prompt. What is the principal objection to this as the first step?",
      options: [
        "Few-shot examples are forbidden in Claude Code",
        "Examples treat the symptom (the model is guessing) without addressing the cause (descriptions don't differentiate the tools), and they cost tokens on every call",
        "Few-shot examples are only effective with temperatures above 0.7",
        "They require the model to be fine-tuned, which is not available"
      ],
      answer: 1,
      rationales: [
        "Few-shot examples are widely supported; they're not forbidden.",
        "Examples improve consistency but treat symptoms. Sparse descriptions are the underlying cause. Expanding descriptions is a cheaper, more durable fix because it changes the signal the model uses to select.",
        "Temperature has no role in this guidance; few-shot examples work at any temperature.",
        "Few-shot examples work via in-context learning; no fine-tuning is involved."
      ]
    },
    {
      id: "d2.1-extra-9", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "An MCP tool's description is one sentence; a built-in Claude Code tool's description is four sentences with examples and limitations. Both could plausibly handle a query. Which does the model prefer, and why?",
      options: [
        "The MCP tool, because MCP-registered tools take priority over built-ins",
        "Whichever is registered first in the configuration file",
        "The built-in, because the model has richer semantic context for it and naturally selects the tool it understands best",
        "The model picks randomly when descriptions are different lengths"
      ],
      answer: 2,
      rationales: [
        "There is no priority rule favouring MCP tools over built-ins; the model selects on description quality, not provenance.",
        "Registration order does not determine selection.",
        "The model selects the tool it has the best semantic grasp of. A sparse MCP description loses to a detailed built-in description. The fix is to enhance the MCP description so it competes on understanding.",
        "Selection is not random; it is driven by description content."
      ]
    },
    {
      id: "d2.1-extra-10", source: "extra",
      domain: "D2", topic: "d2.1", topicTitle: "Tool Interface Design",
      question: "Why does providing concrete example queries in a tool description help selection more than additional prose explaining the tool's purpose?",
      options: [
        "Examples are tokenised more efficiently than prose",
        "Examples anchor the model's understanding to concrete intents and let it generalise to similar phrasings; abstract prose still requires the model to interpret what it covers",
        "The Messages API requires example queries for all registered tools",
        "Examples replace the need for boundaries"
      ],
      answer: 1,
      rationales: [
        "Tokenisation efficiency is not the point; the point is semantic anchoring.",
        "Concrete example queries give the model real intents to pattern-match against. Generalisation from examples is more reliable than from abstract descriptions because examples remove interpretation.",
        "There is no API requirement to include example queries.",
        "Examples and boundaries solve different problems (anchoring intent vs disambiguating siblings); they are complementary, not interchangeable."
      ]
    },

    // ====================================================================
    // 2.2 — Structured Error Responses
    // ====================================================================
    {
      id: "d2.2-extra-1", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A `customer_lookup` tool successfully queries the customer database and returns an empty array because no customer matches the email `unknown@example.com`. The agent retries the same query three times, then escalates to a human. What is the root cause?",
      options: [
        "The retry budget is too low; raising it to five retries would resolve the issue",
        "The tool conflates valid empty results (query ran successfully, no matches) with access failures (could not reach the data source), so the agent treats \"no matches\" as a retriable failure",
        "The escalation threshold should be lower so the human sees it sooner",
        "The customer database is too slow; caching would fix the symptom"
      ],
      answer: 1,
      rationales: [
        "Higher retry counts amplify the wasted effort; they don't fix the misclassification.",
        "Access failure (tool could not reach the source) and valid empty result (query ran, no matches) require different responses — retry vs accept. Conflating them turns successful empty queries into retry storms and incorrect escalations.",
        "Escalation timing isn't the root cause; the root cause is misclassifying the empty result as a failure in the first place.",
        "The database performed correctly; speed isn't the issue."
      ]
    },
    {
      id: "d2.2-extra-2", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A `process_refund` tool returns `{\"error\": \"Refund of £750 exceeds the £500 automatic limit and requires manager approval.\"}`. How should this error be categorised, and is it retryable?",
      options: [
        "Transient — retry after a short delay",
        "Validation — fix the input and retry",
        "Business — `isRetryable: false`; the policy violation will repeat on retry, so the agent must take an alternative path such as escalation",
        "Permission — `isRetryable: false`; refresh credentials and retry"
      ],
      answer: 2,
      rationales: [
        "Transient errors are timeouts, rate limits, or service blips. A policy limit is not transient.",
        "Validation errors mean the input itself is malformed (wrong format, missing field). The input here is valid; the limit is the issue.",
        "Business errors describe a valid request that violates a business rule (here, the £500 automatic limit). Retrying will always hit the same rule, so isRetryable is false; the agent must escalate or take an alternative path.",
        "Permission errors are about authorisation, not policy limits. New credentials wouldn't change the outcome."
      ]
    },
    {
      id: "d2.2-extra-3", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A document-analysis tool fails with `{\"error\": \"Authentication token expired\"}`. The correct categorisation and recovery strategy is:",
      options: [
        "Transient — retry with exponential backoff up to five times",
        "Permission — `isRetryable: false` for this caller; escalate or rotate credentials, then retry with new credentials",
        "Business — `isRetryable: false`; take an alternative business path",
        "Validation — fix the token format and retry"
      ],
      answer: 1,
      rationales: [
        "Retrying the same expired token will keep failing; this is not a flaky service issue.",
        "Permission errors mean the caller lacks valid credentials. The fix isn't retry — it's getting new credentials. After token refresh, a retry with the new token can succeed.",
        "Business errors are policy violations, not credential problems.",
        "Token expiry isn't a formatting problem; the format is fine, the value is no longer valid."
      ]
    },
    {
      id: "d2.2-extra-4", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A tool call to an order service times out after the configured 5s window. Which categorisation and recovery is correct?",
      options: [
        "Transient — `isRetryable: true`; retry with backoff, since the request itself is valid and the underlying service is temporarily unreachable",
        "Validation — fix the input and retry",
        "Business — `isRetryable: false`; escalate",
        "Silent suppression — return an empty result marked as success to keep the workflow moving"
      ],
      answer: 0,
      rationales: [
        "Transient errors include timeouts, rate limits, and brief service unavailability. The request itself is valid; the underlying system is temporarily unreachable, so retry with backoff is appropriate.",
        "Validation errors mean malformed input. The input here is fine; the service couldn't be reached.",
        "Business errors are policy violations, not connectivity issues.",
        "Silent suppression is the worst anti-pattern: the coordinator thinks the query ran and found nothing, so it never retries or seeks alternatives."
      ]
    },
    {
      id: "d2.2-extra-5", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A research subagent tries to fetch from five academic sources. After local retries, sources 4 and 5 still time out while sources 1–3 returned content. What should the subagent return to the coordinator?",
      options: [
        "Nothing — keep retrying internally until all five succeed, regardless of how long that takes",
        "An empty result set marked as success, so the workflow does not stall",
        "A structured response with the partial results from 1–3, plus the failure type for sources 4–5, what was attempted, and one or two alternative approaches (e.g. \"narrow date range\" or \"try mirror source\")",
        "Only the error for the failed sources; discard the partial results to keep the response small"
      ],
      answer: 2,
      rationales: [
        "Indefinite local retry blocks the pipeline and removes the coordinator's ability to make recovery decisions.",
        "Silent suppression — empty marked as success — destroys the coordinator's ability to recover and produces invisible gaps in the synthesis.",
        "Structured propagation is the documented pattern: partial results + failure type + what was attempted + alternative approaches enable the coordinator to retry, try alternatives, proceed with partial coverage, or escalate.",
        "Discarding partial results wastes completed work; the coordinator needs both the partials and the failure info."
      ]
    },
    {
      id: "d2.2-extra-6", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A team's subagents wrap all internal exceptions in `try { ... } catch { return { results: [], status: \"ok\" }; }`. Why is this the worst error-handling anti-pattern in multi-agent systems?",
      options: [
        "It makes the code less readable and harder to maintain",
        "It causes the coordinator to believe the subagent's search ran successfully and found nothing, so the system silently omits an entire research area — an invisible gap with no recovery path",
        "It uses more CPU than rethrowing exceptions",
        "It violates the MCP error specification, which requires a specific error code"
      ],
      answer: 1,
      rationales: [
        "Maintainability matters but isn't the principal harm.",
        "Silent suppression is the worst anti-pattern because the failure is invisible: the coordinator never retries, never seeks alternatives, and the final output has gaps that look complete. In customer-facing flows this can produce incorrect statements like \"no orders found\" when the lookup system was actually down.",
        "Compute cost isn't the concern; correctness is.",
        "MCP error specs aren't violated by returning empty success; the harm is semantic, not formal."
      ]
    },
    {
      id: "d2.2-extra-7", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "When one subagent's tool call fails in a multi-agent research workflow, what should NOT happen?",
      options: [
        "Local retry on transient failures before escalating to the coordinator",
        "Selective propagation: report what could not be resolved locally, with what was attempted and partial results",
        "Termination of the entire pipeline on the first failure, discarding the other subagents' completed work",
        "Coverage annotations in the final synthesis noting which topics are well-supported and which have gaps"
      ],
      answer: 2,
      rationales: [
        "Local retry is the correct first move for transient failures; it keeps the coordinator's complexity down.",
        "Selective propagation is the right escalation behaviour: propagate only what local recovery can't fix, with structured context.",
        "Pipeline termination on a single failure wastes the other agents' completed work and removes any chance of partial recovery. It's the second major anti-pattern alongside silent suppression.",
        "Coverage annotations are the recommended way to expose gaps transparently in the synthesis output."
      ]
    },
    {
      id: "d2.2-extra-8", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "A response from a tool reads `{ \"isError\": false, \"resultCount\": 0, \"content\": [{ \"type\": \"text\", \"text\": \"Query executed successfully; no matches found.\" }] }`. What does this signal, and should the agent retry?",
      options: [
        "A valid empty result — the query ran and returned no matches. This IS the answer; do NOT retry",
        "A silent failure disguised as success — retry until results appear",
        "A formatting error — re-issue the query with different parameters",
        "An access failure — retry with exponential backoff"
      ],
      answer: 0,
      rationales: [
        "isError: false with resultCount: 0 is the documented shape of a valid empty result: the query reached the source and there are no matches. Retrying will return the same answer.",
        "Nothing here is disguised; the response is explicit. Treating it as failure causes retry storms on queries that simply have no matches.",
        "There is no formatting error indicated; the response is well-formed.",
        "Access failures carry isError: true with a transient errorCategory; this response is the opposite."
      ]
    },
    {
      id: "d2.2-extra-9", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "Which set of fields characterises a STRUCTURED error response — one that enables intelligent agent recovery — versus a generic \"Operation failed\" string?",
      options: [
        "Only an `isError: true` flag, since the model can infer the rest",
        "`isError`, an `errorCategory` (transient/validation/business/permission), an `isRetryable` boolean, and a human-readable description explaining what went wrong and what to try",
        "A stack trace, a request ID, and the underlying exception class name",
        "A single \"error\" string and an HTTP status code"
      ],
      answer: 1,
      rationales: [
        "isError alone signals \"something failed\" but doesn't enable the model to choose between retry, alternative path, or escalation.",
        "Structured metadata — category, retryability, description — lets the model branch its recovery: retry transient/validation, escalate business/permission. Without these, the agent can only guess.",
        "Stack traces and exception classes are useful for developers but not directly actionable by the model.",
        "An error string with HTTP status is generic and doesn't tell the model whether the same request will succeed on retry."
      ]
    },
    {
      id: "d2.2-extra-10", source: "extra",
      domain: "D2", topic: "d2.2", topicTitle: "Structured Error Responses",
      question: "Which of the following four error categories is NEVER retryable with the same request?",
      options: [
        "Transient — timeouts, rate limits, brief service unavailability",
        "Validation — malformed input, missing required field, out-of-range value",
        "Business — the request is well-formed but violates a business rule (e.g. exceeds a policy limit)",
        "Permission — the caller's credentials are insufficient for the requested operation"
      ],
      answer: 2,
      rationales: [
        "Transient errors retry well after backoff; the underlying issue is temporary.",
        "Validation errors are retryable AFTER fixing the input; the request itself becomes a new (corrected) one.",
        "Business errors describe a rule violation. The same request will violate the same rule on every retry; the agent must take an alternative path (escalation, reduced amount, different workflow).",
        "Permission errors are retryable AFTER credential refresh / privilege grant; with new credentials the request can succeed."
      ]
    },

    // ====================================================================
    // 2.3 — Tool Distribution & Tool Choice
    // ====================================================================
    {
      id: "d2.3-extra-1", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "A team gives one customer-support agent 18 tools \"so it can handle anything\". Selection reliability degrades. What is the recommended scoping?",
      options: [
        "Keep all 18 but rely on better tool descriptions to disambiguate",
        "Aim for 4–5 tools per agent scoped tightly to that agent's role; tools outside the role belong on different agents or are added back as scoped cross-role tools when justified by hot paths",
        "Switch to tool_choice `any` so the model must pick one",
        "Increase the model's max_tokens to give it more room to reason about all 18"
      ],
      answer: 1,
      rationales: [
        "Better descriptions help, but the underlying issue is selection complexity that grows with the toolkit size. Description quality alone won't carry 18 tools.",
        "The documented guideline is 4–5 tools per agent scoped to its role. Out-of-role tools invite misuse (e.g. a synthesis agent running its own searches); for high-frequency simple cross-role cases, add a scoped cross-role tool rather than the full out-of-role kit.",
        "tool_choice `any` forces a tool call but doesn't reduce decision complexity; it amplifies it.",
        "max_tokens influences output length, not selection accuracy across many tools."
      ]
    },
    {
      id: "d2.3-extra-2", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "An extraction pipeline must always return structured output via one of three schemas (invoice, receipt, contract), even when the document type is unknown. Which tool_choice setting is appropriate?",
      options: [
        "`auto` — let the model decide whether to call a tool or return text",
        "`{\"type\": \"tool\", \"name\": \"extract_invoice\"}` — force a single specific tool",
        "`any` — the model MUST call a tool but can choose which one; this guarantees structured output while letting it pick the right schema",
        "Disable tool_choice and rely on prompt engineering to force JSON"
      ],
      answer: 2,
      rationales: [
        "`auto` allows text-only responses, so structured output isn't guaranteed. Wrong when guaranteed structure is required.",
        "Forcing one schema fails when the document type is unknown — receipts and contracts would be coerced into the invoice schema.",
        "`any` is the right mode here: it guarantees a tool call (so structured output) while letting the model pick the schema that matches the document type. This is exactly the unknown-but-must-be-structured case.",
        "Prompt engineering alone is probabilistic and can produce malformed JSON; tool_choice provides the deterministic guarantee."
      ]
    },
    {
      id: "d2.3-extra-3", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "A synthesis agent returns control to the coordinator for fact verification on roughly 80% of its turns. Profiling shows each round-trip adds 2–3 extra hops and ~35% latency. Analysis of the verifications shows the vast majority are simple single-source lookups. What is the best fix?",
      options: [
        "Give the synthesis agent the full web_search + document_analysis + verify_claim toolkit so it can verify locally",
        "Add a SCOPED cross-role tool such as `verify_fact` directly on the synthesis agent, restricted to single-source simple lookups, while complex multi-source verifications still route through the coordinator",
        "Increase coordinator parallelism so verifications complete faster",
        "Remove verification from the synthesis workflow entirely"
      ],
      answer: 1,
      rationales: [
        "Granting the full out-of-role toolkit invites misuse and bloats the agent past the 4–5 tool guideline.",
        "Scoped cross-role tools are the documented pattern for hot paths: give the agent a constrained version of a capability for the common simple case (here, verify_fact for single-source lookups), and keep complex cases on the coordinator. This eliminates round-trips on the 80% case.",
        "Parallelism doesn't remove the round-trip cost on each query; it just runs them concurrently.",
        "Removing verification breaks the workflow's correctness guarantee."
      ]
    },
    {
      id: "d2.3-extra-4", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "A team adds web_search and document_analysis tools to a synthesis agent that already has compile_report and verify_fact. Within a week, the synthesis agent is running its own web searches even though the research agent has already provided full, well-sourced findings. What architectural principle has been violated?",
      options: [
        "Scoping tools to the agent's role — the synthesis agent now has out-of-role tools and naturally misuses them",
        "Tool_choice forcing — the agent should have been set to forced selection",
        "Description quality — the new tools need better descriptions",
        "Token budget — the agent has too much context to make good choices"
      ],
      answer: 0,
      rationales: [
        "Out-of-role tools invite misuse. A synthesis agent's job is to compose findings, not to search; once it can search, it sometimes will. Keep tools scoped to role and use scoped cross-role tools only when justified.",
        "Forced selection enforces a specific step but doesn't address the underlying scoping problem.",
        "Better descriptions don't fix the structural mistake of giving the agent capabilities outside its role.",
        "Token budget isn't the issue — the synthesis agent has enough context to ignore the existing findings; that's a discipline problem solved by removing the out-of-role tools."
      ]
    },
    {
      id: "d2.3-extra-5", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "Which scenario calls for `tool_choice` set to a specific forced tool (e.g. `{ \"type\": \"tool\", \"name\": \"extract_metadata\" }`) rather than `auto` or `any`?",
      options: [
        "When the model should pick any one of several extraction schemas for an unknown document type",
        "When a mandatory FIRST step must run before any other tool (e.g. extracting metadata before enrichment), regardless of what the model might decide",
        "When the agent should be free to respond conversationally if no tool is needed",
        "When you want to maximise creativity in the model's responses"
      ],
      answer: 1,
      rationales: [
        "An unknown-schema multi-extraction case is the `any` pattern, not forced.",
        "Forced selection guarantees a specific named tool runs as the next step. It's the right tool for enforcing a mandatory first step in a workflow (e.g. metadata extraction before enrichment). After that step, subsequent turns can switch back to `auto` or `any`.",
        "Conversational freedom needs `auto`, not forced.",
        "Forced selection narrows behaviour; it doesn't increase creativity."
      ]
    },
    {
      id: "d2.3-extra-6", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "A document-analysis subagent has a generic `fetch_url` tool that can fetch any URL. The team is concerned about misuse and unintended side effects. What is the most appropriate fix?",
      options: [
        "Add a system-prompt instruction telling the agent not to fetch non-document URLs",
        "Replace `fetch_url` with a constrained `load_document` tool that validates the URL is a document (extension, content type, or trusted domain) and rejects everything else",
        "Wrap fetch_url in a PostToolUse hook that scrubs the response of non-document content",
        "Increase the agent's max_tokens to give it room to think about whether each URL is appropriate"
      ],
      answer: 1,
      rationales: [
        "Prompt-based guidance is probabilistic; for capability boundaries you want a deterministic interface.",
        "Replacing the generic tool with a constrained one applies least privilege at the interface level: the agent literally can't fetch non-document URLs because the tool refuses them. Description also becomes clearer.",
        "PostToolUse scrubs results AFTER the fetch already happened; it can't prevent fetching arbitrary URLs in the first place.",
        "Reasoning room doesn't substitute for a constrained interface."
      ]
    },
    {
      id: "d2.3-extra-7", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "An extraction service must process documents of varying types. Sometimes the model needs to ask clarifying questions instead of extracting (e.g. when scans are illegible). Which `tool_choice` setting is most appropriate?",
      options: [
        "`any` — the model MUST call an extraction tool every time",
        "Forced selection of `extract_generic` for every request",
        "`auto` — the model decides whether to call an extraction tool or return a conversational request for a clearer scan",
        "Disable tools and let the model output JSON in plain text"
      ],
      answer: 2,
      rationales: [
        "`any` forces a tool call; the model can never ask the user for a clearer scan, so it would extract garbage from illegible inputs.",
        "Forcing one tool removes the model's ability to ask for clarification.",
        "`auto` is the right mode when the model needs the legitimate option to respond conversationally (e.g. \"this scan is illegible, can you re-upload?\") rather than being forced into a tool call.",
        "Disabling tools loses the structural guarantees they provide; the right answer is to use `auto`, not abandon tool use."
      ]
    },
    {
      id: "d2.3-extra-8", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "When are scoped CROSS-ROLE tools justified, despite the general principle of scoping tools to an agent's role?",
      options: [
        "When the agent has fewer than 4 tools and needs to fill the toolkit",
        "When a single cross-role capability is needed for a HIGH-FREQUENCY simple case, and routing through the coordinator would impose excessive round-trip latency",
        "When the developer wants to simplify the architecture by collapsing two agents into one",
        "When the coordinator becomes a bottleneck and needs offloading"
      ],
      answer: 1,
      rationales: [
        "Filling a toolkit for its own sake violates scoping; tools should justify their presence.",
        "The documented justification for a scoped cross-role tool is a hot-path simple operation where the coordinator round-trip would dominate latency. Keep it constrained (simple case only); route complex cases through the coordinator.",
        "Collapsing agents loses the role separation that makes orchestration work; cross-role tools don't substitute for that.",
        "Coordinator throughput is solved by parallel spawning and scaling, not by ad-hoc cross-role tools."
      ]
    },
    {
      id: "d2.3-extra-9", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "Which is a sign that an agent has too many tools rather than too few?",
      options: [
        "It frequently refuses to call any tool and just returns text",
        "Its selection accuracy on similar queries varies between runs, it sometimes uses out-of-role tools where in-role ones would be better, and similar-purpose tools are confused with one another",
        "It always picks the first tool in the toolkit",
        "It only uses two of the available tools and ignores the rest"
      ],
      answer: 1,
      rationales: [
        "Refusing to call tools is usually a description-clarity problem, not a count problem.",
        "Variability across runs, out-of-role tool misuse, and confusion between similar-purpose tools are textbook symptoms of toolkit bloat. The fix is to scope down to 4–5 in-role tools and use scoped cross-role tools for justified hot paths.",
        "Picking the first tool is a different pathology (often forced-mode misconfiguration), not toolkit size.",
        "Ignoring tools usually means the descriptions don't match the agent's tasks; reduce by removing unused tools rather than diagnosing as overload."
      ]
    },
    {
      id: "d2.3-extra-10", source: "extra",
      domain: "D2", topic: "d2.3", topicTitle: "Tool Distribution & Tool Choice",
      question: "A team's coordinator routes every query — simple or complex — through the full research-analysis-synthesis pipeline. Profiling shows 85% of queries are simple factual lookups. What is the recommended adjustment?",
      options: [
        "Keep the pipeline as-is; consistency is more important than latency",
        "Make the coordinator dynamically select which subagents to invoke per query — simple factual queries may only need the research subagent, not the full pipeline",
        "Add a routing classifier in front of the coordinator",
        "Force every subagent to run in parallel on every query to reduce wall-clock time"
      ],
      answer: 1,
      rationales: [
        "Routing the simple 85% through the full pipeline wastes latency and tokens without improving quality.",
        "Dynamic subagent selection is one of the coordinator's documented responsibilities: analyse the query and invoke only the subagents needed. Simple queries skip the full pipeline; complex queries still get the full treatment.",
        "An external classifier is over-engineered; the coordinator already has the context to decide.",
        "Parallel-everything spawns more work than necessary and doesn't reduce the per-query workload for the 85% simple case."
      ]
    },

    // ====================================================================
    // 2.4 — MCP Server Integration
    // ====================================================================
    {
      id: "d2.4-extra-1", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "A team wants their Linear MCP server available to every engineer who clones the repository. Where should the configuration live?",
      options: [
        "In each developer's `~/.claude.json`, with onboarding documentation explaining how to add it",
        "In `.mcp.json` at the repository root, so the configuration is version-controlled and picked up automatically on clone",
        "In a custom script that runs on `npm install`",
        "In the Claude Code application settings, propagated via SSO"
      ],
      answer: 1,
      rationales: [
        "Asking every developer to maintain their own `~/.claude.json` for a team-wide server guarantees drift and onboarding friction.",
        "Project-level `.mcp.json` at the repo root is the documented home for team-wide servers: version-controlled, shared via git, and picked up automatically by Claude Code on clone.",
        "Install-time scripts are brittle and bypass the documented configuration mechanism.",
        "There is no SSO propagation channel for MCP configs in Claude Code; the source of truth is the file."
      ]
    },
    {
      id: "d2.4-extra-2", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "A developer commits `\"env\": { \"SLACK_BOT_TOKEN\": \"xoxb-1234567890-abcdef\" }` to `.mcp.json`. What is the security issue and the documented fix?",
      options: [
        "The token is invalid because real Slack tokens never start with `xoxb-`; replace it with one that does",
        "The actual credential is in version control and will leak via repository history; reference it with `${SLACK_BOT_TOKEN}` syntax so each developer sets their own value locally",
        "The token belongs in `~/.claude.json`, not `.mcp.json`",
        "The `env` field is not valid in `.mcp.json`; use `secrets` instead"
      ],
      answer: 1,
      rationales: [
        "The token format is fine; the problem isn't syntactic.",
        "Hardcoded credentials in `.mcp.json` enter git history and are exposed to anyone with repo access. The documented pattern is `${ENV_VAR}` expansion: the file references the variable, each developer sets the value in their own shell environment.",
        "Moving the file doesn't help if the value is still hardcoded; the fix is env-var expansion, not relocation.",
        "`env` is the correct field for environment variables; there's no `secrets` field."
      ]
    },
    {
      id: "d2.4-extra-3", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "An agent connected to a database MCP server makes a sequence of exploratory calls — `list_tables`, then `describe_table` for each of seven tables — just to understand the schema before answering any real query. Which MCP feature would eliminate most of these calls?",
      options: [
        "Tool result caching on the MCP server side",
        "Expose the database schema as an MCP RESOURCE so it is available to the agent at connection time, without any tool call",
        "Add a single `get_full_schema` tool that aggregates the seven describe calls into one",
        "Include the schema in the system prompt"
      ],
      answer: 1,
      rationales: [
        "Caching speeds up repeats but doesn't eliminate the initial exploration; the agent still makes the calls the first time.",
        "MCP resources are the right primitive: they surface content catalogues (schemas, doc hierarchies, issue lists) to the agent up front, with no tool call needed. Tools then act on the data; resources give visibility into it.",
        "Aggregating into one call helps a bit but still requires a tool call. Resources skip the call entirely.",
        "System-prompt schema injection costs tokens on every request and goes stale when the schema changes."
      ]
    },
    {
      id: "d2.4-extra-4", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "A developer has both `.mcp.json` (project-level) and `~/.claude.json` (user-level) configured. When Claude Code starts up, which tools are available?",
      options: [
        "Only project-level tools from `.mcp.json` — it takes precedence",
        "Only user-level tools from `~/.claude.json` — personal settings override project settings",
        "All tools from BOTH project-level and user-level servers, discovered at connection time and available simultaneously",
        "The developer must explicitly enable one level via a CLI flag"
      ],
      answer: 2,
      rationales: [
        "Project-level does not override user-level; both contribute.",
        "User-level does not override project-level either; the model isn't precedence-based.",
        "Both scopes are discovered at connection time and their tools are simultaneously available. There is no override or activation step.",
        "There is no enable-one-level flag; both load automatically when present."
      ]
    },
    {
      id: "d2.4-extra-5", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "Your team needs Notion integration to read and update documentation pages. What is the recommended first step?",
      options: [
        "Design and implement a custom Notion MCP server from scratch using the Notion REST API",
        "Evaluate existing community / official Notion MCP servers first; only build custom if they cannot handle a team-specific workflow",
        "Skip MCP entirely and use the Notion CLI from Bash commands inside Claude Code",
        "Add the Notion REST API tokens directly into a project CLAUDE.md and have the model construct HTTP calls"
      ],
      answer: 1,
      rationales: [
        "Building custom before checking community offerings duplicates effort and adds maintenance burden.",
        "For standard integrations (Notion, Linear, GitHub, Slack, Jira), evaluate community / official MCP servers first. They cover the common surface, are maintained, and ship with sensible tool schemas. Build custom only when a team-specific workflow can't be served.",
        "Direct CLI calls bypass the MCP tool interface and lose the structured request/response surface the agent depends on.",
        "Tokens in CLAUDE.md leak credentials and pushes the model into ad-hoc HTTP construction; this is worse than every other option."
      ]
    },
    {
      id: "d2.4-extra-6", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "An MCP tool's description is \"Searches code.\" When asked to find function callers, the agent consistently picks the built-in Grep tool instead. What is the most direct fix?",
      options: [
        "Rename the MCP tool to `grep_v2` so the model treats it as a Grep upgrade",
        "Enhance the MCP tool's description with what it does, what it returns, when to use it INSTEAD of Grep (e.g. AST-aware semantic search), and example queries — so the model has enough context to prefer it on relevant queries",
        "Set tool_choice to always force the MCP tool",
        "Remove Grep from the agent's available tools"
      ],
      answer: 1,
      rationales: [
        "Renaming an MCP tool to mimic a built-in invites confusion and doesn't add the semantic context needed for selection.",
        "The model prefers tools it understands well. A sparse MCP description loses to a detailed built-in. Enhance the MCP description with capabilities, output shape, comparison to the built-in, and examples — that lets the model prefer it on relevant queries.",
        "Force-tool removes flexibility; the agent should also be able to use Grep for plain text searches.",
        "Removing Grep destroys a useful capability; the fix is to make the MCP tool selectable, not to amputate the built-in."
      ]
    },
    {
      id: "d2.4-extra-7", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "A developer is experimenting with a personal MCP server for a side project. They don't want this server to appear for anyone else on the team. Where should the configuration go?",
      options: [
        "Project root `.mcp.json` with a comment saying it's personal",
        "`~/.claude.json` — user-level, not version-controlled, and not visible to other developers",
        "A `.mcp.local.json` overlay file in the project root",
        "Inside CLAUDE.md so the model knows about it but git ignores it"
      ],
      answer: 1,
      rationales: [
        "Putting it in `.mcp.json` makes it team-wide regardless of comments; comments don't change visibility.",
        "User-level `~/.claude.json` is the documented home for personal/experimental servers: it lives in your home directory, isn't shared via git, and only affects your sessions.",
        "There's no documented `.mcp.local.json` overlay in this configuration model.",
        "CLAUDE.md is for instructions, not MCP server configuration; servers are configured in JSON config files."
      ]
    },
    {
      id: "d2.4-extra-8", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "A team rotates their GitHub personal-access tokens quarterly for security. How should `.mcp.json` reference the token so rotation doesn't require a commit for each developer?",
      options: [
        "Hardcode the token in `.mcp.json` and commit a new value each rotation",
        "Use `${GITHUB_TOKEN}` env-var expansion in `.mcp.json`; each developer maintains their own `GITHUB_TOKEN` in their shell environment, and rotation needs no config change",
        "Encrypt the token in `.mcp.json` with a shared symmetric key committed to the repo",
        "Store the token in `~/.claude.json` and copy the config across team members"
      ],
      answer: 1,
      rationales: [
        "Hardcoding requires a commit per rotation and exposes the value in history.",
        "`${ENV_VAR}` expansion lets each developer manage their own credential out-of-band. The committed config file references a name, not a value, so rotation requires zero config changes.",
        "Committing the symmetric key alongside the ciphertext destroys the encryption's value.",
        "Copying config around is operationally fragile; env-var expansion is the documented and standard pattern."
      ]
    },
    {
      id: "d2.4-extra-9", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "What is the principal distinction between MCP RESOURCES and MCP TOOLS?",
      options: [
        "Resources are read-only and tools are read-write",
        "Resources surface content catalogues (data, schemas, issue lists) that the agent can see without a tool call; tools perform actions on data and require a call. The combination reduces wasted exploratory calls",
        "Resources are exclusive to the project scope; tools work at both project and user scope",
        "Resources require manual user approval per access; tools do not"
      ],
      answer: 1,
      rationales: [
        "Read/write isn't the boundary; tools can be read-only too.",
        "Resources give the agent visibility into available content (schemas, doc hierarchies, issue lists) up front, without a call. Tools let the agent act on that content and require a call. Together they reduce exploratory tool calls and keep the agent's actions targeted.",
        "Scope is independent of resources vs tools; both work at either scope.",
        "Manual per-access approval isn't how resources are defined."
      ]
    },
    {
      id: "d2.4-extra-10", source: "extra",
      domain: "D2", topic: "d2.4", topicTitle: "MCP Server Integration",
      question: "A team has built a custom internal MCP server that wraps their proprietary HR system. Where should it be configured so every engineer gets it on `git pull`?",
      options: [
        "Each engineer's `~/.claude.json`, distributed via a shared onboarding script",
        "Project-root `.mcp.json`, version-controlled, with credentials referenced via `${ENV_VAR}` expansion so secrets stay out of git",
        "A separate MCP-only repository everyone clones alongside the main repo",
        "A CLAUDE.md section describing the server config so the model can configure itself"
      ],
      answer: 1,
      rationales: [
        "User-level distribution means drift and onboarding friction; this server is team-wide.",
        "Project-root `.mcp.json` is the documented home for team-wide servers, and `${ENV_VAR}` expansion is the standard pattern for keeping credentials out of version control. New engineers get the server automatically on clone.",
        "A separate repo adds operational overhead with no benefit over a single project-root file.",
        "CLAUDE.md is for instructions, not server configuration. The model doesn't configure its own MCP servers."
      ]
    },

    // ====================================================================
    // 2.5 — Built-in Tools
    // ====================================================================
    {
      id: "d2.5-extra-1", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "A developer needs to find every file that calls `legacySync()` AND every test file matching those callers. Which two-step sequence is correct?",
      options: [
        "Glob for `*legacySync*` first (to find callers), then Grep for `legacySync` (to find tests)",
        "Read every file in the repository searching for `legacySync` mentions, then Read every file matching `*.test.*`",
        "Grep for `legacySync` to find callers (a content search), then Glob for sibling test file patterns such as `**/*.test.{ts,tsx}` to find their tests (a path search)",
        "Bash with `find` and `xargs grep` for both steps"
      ],
      answer: 2,
      rationales: [
        "Glob matches paths, not contents. It can't find function callers; only files literally named after the function would match, and most don't.",
        "Reading everything is the textbook context-budget killer.",
        "Grep is the content-search tool: correct for finding callers of a function. Glob is the path-pattern tool: correct for finding files by name (here, test files by their naming convention). The two-step Grep-then-Glob sequence is the documented pattern.",
        "Shelling out works but bypasses the built-in tools designed for the job; the exam expects use of the right built-in for each step."
      ]
    },
    {
      id: "d2.5-extra-2", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "What is the fundamental distinction between Grep and Glob in Claude Code's built-in toolkit?",
      options: [
        "Grep is faster; Glob is slower but more thorough",
        "Grep is regex-based; Glob is substring-based",
        "Grep searches FILE CONTENTS for patterns; Glob matches FILE PATHS by naming convention. Grep finds what's inside files; Glob finds files by their names",
        "Grep works on text files; Glob works on binary files"
      ],
      answer: 2,
      rationales: [
        "Speed isn't the distinguishing axis; they're built for different jobs.",
        "Both can use pattern syntax; the difference is what they search.",
        "Grep is the content-search tool (function callers, error messages, imports). Glob is the path-pattern tool (`**/*.test.tsx`, `src/api/**`). Picking the wrong one means searching the wrong dimension entirely.",
        "Both work on regular files; binary handling isn't the distinction."
      ]
    },
    {
      id: "d2.5-extra-3", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "An Edit call fails with `old_string matches 4 locations`. What is the FIRST recovery step, before falling back to a heavier alternative?",
      options: [
        "Immediately Read the entire file and Write a modified version",
        "Widen `old_string` with more surrounding context (e.g. include the preceding line and a unique identifier) to make the match unique, OR set `replace_all: true` if every occurrence should be changed",
        "Use Bash with `sed -i` to replace all occurrences",
        "Insert a temporary unique comment, Edit the line near that comment, then remove the comment"
      ],
      answer: 1,
      rationales: [
        "Read + Write is the LAST resort, not the first response. It burns a whole file's worth of context for what's usually a one-line change.",
        "The documented recovery is to widen `old_string` with surrounding context until it pins down one occurrence, or set `replace_all: true` if all should change. Both keep you on Edit and cost almost nothing extra.",
        "Shell `sed` bypasses the built-in safety of unique-match verification and risks modifying the wrong occurrences.",
        "Temporary markers are fragile and risk leaving artefacts; they're not the documented response."
      ]
    },
    {
      id: "d2.5-extra-4", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "A developer joins a 175-file unfamiliar codebase and starts by Reading every file front-to-back to \"understand the whole system\". What's wrong with this approach?",
      options: [
        "Nothing — full understanding requires full reading",
        "Reading every file upfront is a context-budget killer: it consumes the conversation budget on mostly-irrelevant files. The documented approach is incremental — Grep for the entry points / symbols you care about, then Read only the files those searches identify",
        "They should Glob the directory structure first to filter files",
        "They should rely on documentation only and skip the code"
      ],
      answer: 1,
      rationales: [
        "Full reading isn't required and isn't feasible at scale; the model will run out of usable context long before understanding the system.",
        "Incremental discovery (Grep entry points → Read relevant files → Grep for usages of what you find) keeps context focused on what matters for the task at hand. This is the single biggest leverage point for codebase exploration.",
        "Glob by extension/path doesn't tell you which files are relevant to the task; it just shows you what exists.",
        "Documentation can be wrong or absent; relying on it exclusively is brittle. The point is incremental code exploration, not avoiding code."
      ]
    },
    {
      id: "d2.5-extra-5", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "A function `chargeCustomer` is defined in `payments.ts` and re-exported through `utils/index.ts` (a barrel export). A simple `Grep \"chargeCustomer\"` finds the definition and the barrel file but misses three callers. Why, and how do you find the missed callers?",
      options: [
        "Grep has an internal file limit; raise it via configuration",
        "Some callers import the function via the barrel module name (e.g. `import { chargeCustomer } from 'utils'`) and consume it; a single Grep for the function name catches direct references but can miss wrapper-name or namespace-based usages. Trace by Grep → Read for exported names → Grep each exported name plus the barrel module name",
        "The Grep pattern needs regex anchors to match function names",
        "Those callers are on a different git branch"
      ],
      answer: 1,
      rationales: [
        "There's no internal file limit to raise; Grep searches the whole working tree.",
        "Re-exports through a barrel can result in callers that don't textually mention the original function name in obvious ways (wrapper names, namespace imports, alias renames). The reliable trace is multi-step: Grep the definition → Read to discover exported names and the barrel module → Grep each exported name AND the barrel module name to catch indirect consumers.",
        "A literal string match for the function name is fine for direct callers; the issue is indirect references, not regex syntax.",
        "Grep searches the current tree; other branches are out of scope and irrelevant."
      ]
    },
    {
      id: "d2.5-extra-6", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "Why is jumping straight from a non-unique Edit failure to Read + Write of the entire file PENALISED as a pattern?",
      options: [
        "Because Read + Write breaks file watchers in the editor",
        "Because it burns an entire file's worth of context tokens for what is typically a one-line change, when widening `old_string` or using `replace_all` would have kept the change on Edit at almost no extra cost",
        "Because Write is unreliable on large files",
        "Because Read + Write is incompatible with the Edit tool's audit log"
      ],
      answer: 1,
      rationales: [
        "Editor watchers aren't part of the model's tooling concerns.",
        "Read + Write loads the full file into context and writes the modified full file back, costing dramatically more tokens than an anchored Edit. The documented first responses to a non-unique match — widen anchor, or replace_all — keep the change on Edit. Read + Write is the last resort when neither can disambiguate.",
        "Write is reliable; the issue is cost, not reliability.",
        "There's no audit-log incompatibility implied by the documentation."
      ]
    },
    {
      id: "d2.5-extra-7", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "Which tool and pattern would you use to find every `.ts` and `.tsx` file under `src/api/`?",
      options: [
        "Grep with `src/api`",
        "Glob with a pattern such as `src/api/**/*.{ts,tsx}` — Glob is the purpose-built tool for matching file paths by naming convention and directory structure",
        "Read the `src/api/` directory listing manually",
        "Bash with `find src/api -name '*.ts*'`"
      ],
      answer: 1,
      rationales: [
        "Grep searches contents; finding files by extension and directory is a path-pattern task.",
        "Glob is the documented tool for path patterns: `src/api/**/*.{ts,tsx}` matches every `.ts` and `.tsx` anywhere under `src/api/`. Results are typically sorted by modification time.",
        "Manual listing doesn't filter by extension and recurse cleanly; Glob does both.",
        "`find` works but bypasses the built-in tool; the documented choice is Glob."
      ]
    },
    {
      id: "d2.5-extra-8", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "You need to find every file in the repo that imports from `'./auth'`. Which tool and pattern?",
      options: [
        "Glob `**/*auth*` — match files whose paths contain \"auth\"",
        "Grep `from ['\"]./auth['\"]` — this is a content search inside source files for the import statement text",
        "Read every file in the project and inspect each one",
        "Bash `find . -name '*.ts'` followed by manual inspection"
      ],
      answer: 1,
      rationales: [
        "Glob matches paths, not contents. Files importing from `./auth` may have any path; the import statement is inside the file.",
        "Imports are TEXTUAL content inside source files. Grep is the content-search tool — perfect for finding `from \"./auth\"` references across the repo.",
        "Manual reading is the worst option here.",
        "Listing files with `find` doesn't actually search their contents; you'd still need Grep afterwards. Use Grep directly."
      ]
    },
    {
      id: "d2.5-extra-9", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "A developer's first reflex when Edit returns a non-unique match error is to reach for `bash sed -i`. Why is that the wrong default in Claude Code?",
      options: [
        "`sed` isn't installed in Claude Code's sandbox",
        "`sed` is a last resort: it bypasses Edit's safety mechanism (unique-match verification) and the documented recovery is to widen `old_string` with more context or set `replace_all: true`, both of which keep you on Edit with safety intact",
        "`sed` doesn't support multi-line patterns reliably",
        "`sed` always modifies the wrong occurrence"
      ],
      answer: 1,
      rationales: [
        "`sed` is generally available; presence isn't the objection.",
        "Edit's unique-match check is a safety mechanism that prevents accidentally modifying the wrong occurrence. The documented recovery preserves that safety: widen the anchor, or use `replace_all`. Falling back to `sed` discards the safety and is treated as a last resort, not a first response.",
        "Multi-line `sed` does work; it just isn't the documented response to this specific failure mode.",
        "`sed` doesn't always modify wrongly; the issue is loss of safety, not deterministic miscorrection."
      ]
    },
    {
      id: "d2.5-extra-10", source: "extra",
      domain: "D2", topic: "d2.5", topicTitle: "Built-in Tools",
      question: "A developer needs to rename an API call from `getUser` to `getUserById` across 26 files. Each file uses `getUser(` somewhere. What is the most efficient and safe approach?",
      options: [
        "Read each of the 26 files individually, then Write each one back with the change",
        "For each file, use Edit with `old_string = \"getUser(\"`, `new_string = \"getUserById(\"`, and `replace_all: true` — this updates every occurrence in each file atomically, on Edit, with no context-burning Read+Write fallback",
        "Use Bash `sed -i 's/getUser(/getUserById(/g' **/*.ts` immediately",
        "Combine all 26 files into one giant file, run a single Edit, then split them back out"
      ],
      answer: 1,
      rationales: [
        "Read + Write on each of 26 files burns 26 files' worth of context for what should be a one-call-per-file change.",
        "Edit with `replace_all: true` is exactly the documented pattern for global replacements in a single file: every occurrence updated atomically, on the Edit tool, with verification. Run it per file (or batched) for the 26 files.",
        "Bash `sed -i` works but bypasses Edit's safety and the documented response order. Use Edit with replace_all first.",
        "This is absurd and would corrupt the codebase; do not do this."
      ]
    }
  ];

  window.EXAM_BANK.D2 = D2;
})();
