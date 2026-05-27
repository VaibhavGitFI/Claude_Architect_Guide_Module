/*
 * Domain 4 — Prompt Engineering & Structured Output  (~20% of exam)
 * Source: claudecertificationguide.com  (sections 4.1–4.6)
 *
 * Additively populates the shared globals for Domain 4 only:
 *   window.DOMAIN_DEEPDIVE.D4   — the "Domains" deep-dive view
 *   window.STUDY_CONTENT.D4     — the "Study Guide" view
 *   window.QUESTIONS (+= D4)    — the "Domain Quiz" / "Mock Exam" banks
 *   window.FLASHCARDS (+= D4)   — the "Flashcards" view
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
  // DEEP DIVE  — window.DOMAIN_DEEPDIVE.D4
  // ==========================================================================
  window.DOMAIN_DEEPDIVE.D4 = {
    number: 4,
    weight: "~20%",
    title: "Prompt Engineering & Structured Output",
    tagline: "Explicit criteria, schema-guaranteed output, validation-retry loops, few-shot examples, batch economics, and multi-instance review.",
    why: "This domain rewards **specificity over vagueness** and **structure over hope**. Recurring themes: explicit categorical criteria beat \"be conservative\"; `tool_use` schemas kill *syntax* errors but not *semantic* ones; retries fix format/structure but can't invent missing data; **few-shot examples are the first fix for inconsistency**; the **Batch API** is 50%-cheaper but only for latency-tolerant work; and **independent instances + multi-pass review** beat self-review and bigger context windows.",

    sections: [
      // ---- 4.1 System Prompts with Explicit Criteria --------------------
      {
        heading: "4.1 — System Prompts with Explicit Criteria",
        body: [
          { type: "p", text: "The biggest production prompt mistake is **vague instructions**. \"Be conservative,\" \"only report high-confidence findings,\" \"use your best judgement\" give the model no actionable decision boundary — which is exactly why the exam uses them as distractors." },
          { type: "p", text: "The fix is **explicit categorical criteria** defining precisely what to flag and what to skip. For a code-review pipeline, replace \"Review this code. Be conservative.\" with: *\"Flag comments only when claimed behaviour contradicts actual code behaviour. Report bugs and security vulnerabilities. Skip minor style preferences and local patterns.\"*" },
          { type: "callout", kind: "key", text: "Explicit categorical criteria always outperform vague instructions. Define what to flag (bugs, security) and what to skip (style, local patterns) using **concrete code examples for each severity level**. Never rely on \"be conservative\" or confidence-based filtering as the primary mechanism." },
          { type: "p", text: "**The false-positive trust problem**: a high false-positive rate in *one* category destroys trust in *all* categories — if \"documentation mismatch\" is wrong 40% of the time, developers stop reading your 98%-accurate \"security\" findings too. Trust bleeds across the whole output." },
          { type: "callout", kind: "warn", text: "Counterintuitive fix: **temporarily disable** the high-false-positive category to restore system-wide trust immediately, then iterate on its criteria with concrete code examples and re-enable once precision improves. This prioritises system-wide trust over category completeness — it is not abandoning the category." },
          { type: "p", text: "**Severity calibration needs code examples, not prose.** \"Issues that could cause system failures\" forces interpretation; a concrete `query = f\"SELECT * FROM users WHERE id = {user_input}\"` labelled *Critical* removes ambiguity and produces consistent classification across invocations." },
          { type: "callout", kind: "warn", text: "Why confidence-based filtering fails: **LLM self-reported confidence is poorly calibrated** — often confident about wrong findings, uncertain about right ones. The hierarchy is **explicit criteria first, confidence-based routing second** (routing is covered in 4.6). Never skip the first step." }
        ]
      },

      // ---- 4.2 Structured Output with Tool Use --------------------------
      {
        heading: "4.2 — Structured Output with Tool Use",
        body: [
          { type: "p", text: "For guaranteed schema-compliant output there's a clear reliability hierarchy: **`tool_use` with JSON schemas** (eliminates JSON syntax errors entirely) **> prompt-based JSON** (can produce malformed JSON). Prompt-based extraction has no structural guarantees and will periodically produce unparseable output in production." },
          { type: "p", text: "**`tool_choice` has three modes**: `\"auto\"` (model decides tool vs text), `\"any\"` (must call *some* tool — use for guaranteed structured output when the document type is unknown across multiple schemas), and `{\"type\":\"tool\",\"name\":\"...\"}` (must call that specific tool — forces a mandatory step)." },
          { type: "callout", kind: "key", text: "`tool_use` with JSON schemas eliminates **syntax** errors but NOT **semantic** errors. Make fields optional/nullable when source documents may lack information — this is the primary defence against fabrication. Use `tool_choice: \"any\"` for guaranteed structured output when the document type is unknown." },
          { type: "callout", kind: "warn", text: "What `tool_use` does NOT prevent: **sum discrepancies** (line items don't sum to total), **field-placement errors** (a date in an amount field when both are strings), and **fabrication** (inventing values for required fields the source lacks). The schema guarantees *structure*, not *correctness*." },
          { type: "code", lang: "json", body: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"invoice_number\": { \"type\": \"string\" },\n    \"vendor_name\":    { \"type\": \"string\" },\n    \"payment_terms\":  { \"type\": [\"string\", \"null\"] },\n    \"purchase_order\": { \"type\": [\"string\", \"null\"] }\n  },\n  \"required\": [\"invoice_number\", \"vendor_name\"]\n}" },
          { type: "p", text: "**Schema design for production**: make fields **optional/nullable** so the model can honestly return `null` instead of fabricating; add an **`\"unclear\"` enum value** for genuinely ambiguous cases; add **`\"other\"` + a freeform detail string** for extensible categorisation; and put **format-normalisation rules in the prompt** (the schema enforces structure, the prompt enforces formatting like ISO 8601 dates)." }
        ]
      },

      // ---- 4.3 Prompt Chaining and Validation-Retry Loops ---------------
      {
        heading: "4.3 — Prompt Chaining & Validation-Retry Loops",
        body: [
          { type: "p", text: "Extraction systems fail; the question is how the system responds. The **retry-with-error-feedback** pattern sends three things back to the model: the **original document**, the **failed extraction**, and the **specific validation error**. This is dramatically more effective than naive retries — without the specific error, the model just reproduces the same mistake." },
          { type: "callout", kind: "key", text: "Retry-with-error-feedback works by sending the original document + the failed extraction + the specific validation error. Retries fix format/structural errors but **cannot create information absent from the source**. Always identify whether a failure is fixable before retrying." },
          { type: "p", text: "**The retry effectiveness boundary** (most-tested here):" },
          { type: "bullets", items: [
            "**Effective for**: format mismatches (wrong date/currency), structural output errors (wrong fields, bad nesting), misplaced values (data present but extracted to the wrong field), mathematical errors (a missed line item).",
            "**NOT effective for**: information genuinely absent from the source, data that lives only in an external document not provided, fields needing knowledge the model lacks. Correct action: flag for human review or return `null` (if the schema allows)."
          ] },
          { type: "code", lang: "json", body: "{\n  \"line_items\": [\n    { \"description\": \"Widget A\", \"amount\": 150.00 },\n    { \"description\": \"Widget B\", \"amount\": 300.00 }\n  ],\n  \"calculated_total\": 450.00,\n  \"stated_total\": 500.00,\n  \"total_discrepancy\": true\n}" },
          { type: "p", text: "**Self-correction in the schema**: extract `calculated_total` (sum of line items) *and* `stated_total` (document's total) so a mismatch is an automatic discrepancy flag with no external logic; add `conflict_detected` booleans when the document contradicts itself; add `detected_pattern` fields to findings so you can analyse dismissals by pattern and feed a systematic prompt-improvement loop." },
          { type: "callout", kind: "warn", text: "Two error categories the exam separates: **schema syntax errors** (malformed JSON, missing fields, wrong types) are eliminated by `tool_use` (4.2); **semantic validation errors** (correct JSON, wrong values — bad sums, misplaced values, fabrication) need validation logic + retry loops. `tool_use` solves the first, not the second." }
        ]
      },

      // ---- 4.4 Few-Shot Prompting ---------------------------------------
      {
        heading: "4.4 — Few-Shot Prompting",
        body: [
          { type: "p", text: "Few-shot examples are the **most effective technique for consistency** — not more instructions, not confidence thresholds, not temperature. When output is inconsistent, examples are the first tool to reach for. The exam repeatedly pits \"add more instructions\" against \"add few-shot examples\"; the answer is almost always the latter." },
          { type: "p", text: "**Three triggers** for few-shot examples: (1) detailed instructions still produce inconsistent *formatting*; (2) the model makes inconsistent *judgement calls* on ambiguous cases; (3) extraction returns *empty/null* fields for information that exists but appears in an unexpected format (narrative text vs a table)." },
          { type: "callout", kind: "key", text: "Use **2–4 targeted examples**, and each must **show reasoning**, not just input→output. Reasoning teaches the model the general decision principle so it generalises to novel cases instead of literal pattern-matching. Target the examples at the specific failing scenarios." },
          { type: "code", lang: "text", body: "Input: \"check my order #12345\"\nSelected tool: lookup_order\nReasoning: The user gives an order number (#12345), a specific\n  identifier, so lookup_order is correct over get_customer. The\n  general principle: specific identifiers route to specific lookup tools." },
          { type: "p", text: "**Hallucination reduction**: examples covering varied document structures (inline citations vs bibliographies, narrative vs tables) teach the model to handle structural variety without inventing data — especially valuable for inconsistently formatted documents. **False-positive reduction**: in code review, examples that show both *what to flag* and *what to ignore* (e.g. benign variable shadowing in a small scope = minor) cut false positives while preserving detection of real issues." },
          { type: "callout", kind: "warn", text: "Match technique to problem: inconsistent formatting → few-shot; malformed JSON → `tool_use` schemas; fabricated values for missing fields → optional/nullable schema; wrong tool selection → better tool descriptions first, then few-shot; missed info in narrative text → few-shot showing narrative extraction; sum ≠ total → validation-retry loop. Don't answer \"add more detailed instructions\" when detailed instructions already exist." }
        ]
      },

      // ---- 4.5 Batch Processing and Prompt Optimisation -----------------
      {
        heading: "4.5 — Batch Processing & Prompt Optimisation",
        body: [
          { type: "p", text: "The **Message Batches API** is a cost tool with hard constraints: **50% cost savings**, an **up to 24-hour processing window**, **no guaranteed latency SLA**, **no multi-turn tool calling within a single batch request**, and **`custom_id` fields** to correlate request/response pairs." },
          { type: "callout", kind: "key", text: "The matching rule: **synchronous API for blocking workflows** (someone/something is waiting — pre-merge checks, real-time review) and **Batch API for latency-tolerant workflows** (overnight technical-debt reports, weekly audits, nightly test generation). The trap (sample Q11) is switching *everything* to batch for the savings — keep blocking work synchronous." },
          { type: "code", lang: "ts", body: "// Synchronous -- a developer is waiting\nawait client.messages.create({ model, max_tokens, messages });\n\n// Batch -- consumed tomorrow morning; correlate via custom_id\nawait client.batches.create({\n  requests: docs.map((doc, i) => ({\n    custom_id: `debt-report-${i}`,\n    params: { model, max_tokens, messages: [{ role: \"user\", content: doc }] }\n  }))\n});" },
          { type: "p", text: "**SLA calculation**: the Batch API guarantees results within 24h, so the final batch must be submitted ≥24h before the deadline. A 30-hour SLA leaves a 6-hour buffer (30 − 24) for collecting/validating inputs; submit fresh batches every 4–6 hours so one is always in flight." },
          { type: "p", text: "**Failure handling** (three steps): identify failures by `custom_id`; **resubmit only the failures** with modifications (chunk oversized docs, simplify prompts, add format-specific examples) — never the whole batch; and **refine prompts on a 5–10 doc sample BEFORE the full batch**. First-pass success dominates cost: 90% on 1,000 docs = 100 retries; 60% = 400 retries (4× the resubmission cost)." },
          { type: "callout", kind: "warn", text: "Traps: assuming batch results arrive quickly because they often do (there's **no SLA** — design around the 24h max), and using Batch for workflows that need **multi-turn tool calling** mid-request (unsupported — use the synchronous API for those steps)." }
        ]
      },

      // ---- 4.6 Multi-Instance Review and Output Validation --------------
      {
        heading: "4.6 — Multi-Instance Review & Output Validation",
        body: [
          { type: "p", text: "When Claude reviews its **own** output in the **same session**, it retains the reasoning chain from generation and tends to *confirm* rather than *challenge* its decisions. An **independent instance** — a separate invocation with no prior reasoning context — evaluates the output fresh and catches subtle issues far more effectively." },
          { type: "callout", kind: "key", text: "A model reviewing its own output in the same session retains reasoning context and is less likely to question its decisions. Use **independent instances** for review. Split large reviews into **per-file local passes + a cross-file integration pass**. **Calibrate confidence thresholds** against labelled validation sets before using them for routing." },
          { type: "callout", kind: "warn", text: "The exam's tempting wrong answer: \"switch to a higher-tier model with a larger context window\" to fix multi-file review. **A bigger window does not fix attention quality** — the model still gives uneven attention across files. Also wrong: adding \"please review carefully\" to the same session, or relying on extended thinking within the generating session." },
          { type: "p", text: "**Multi-pass review architecture** addresses attention dilution (detailed feedback on some files, superficial on others, bugs missed, contradictory findings): **Pass 1** analyses each file individually (consistent depth, full attention per file); **Pass 2** receives all per-file findings and checks cross-file issues — data flow between modules, consistent API usage, dependency conflicts, and contradictions among the per-file findings themselves." },
          { type: "p", text: "**Confidence-based routing**: report high-confidence findings directly, route low-confidence findings to human review. The confidence score is the model's *self-assessed certainty*, not measured accuracy — so **calibrate** it against labelled examples and set routing thresholds from that data." },
          { type: "callout", kind: "warn", text: "Distinguish **raw (uncalibrated) confidence** — unreliable for automated decisions — from **calibrated thresholds** validated against labelled sets, which are suitable for routing. Using uncalibrated confidence for automated decisions is an anti-pattern. The full architecture: generate → independent per-file review → integration review → confidence routing → continuous calibration loop." }
        ]
      }
    ],

    examFocus: [
      "Explicit categorical criteria (with code examples per severity) over vague 'be conservative'/confidence filtering.",
      "The false-positive trust problem: disable a noisy category to restore system-wide trust, then refine.",
      "tool_use schemas eliminate JSON syntax errors but not semantic errors; tool_choice auto/any/forced.",
      "Optional/nullable fields (+ 'unclear'/'other' enums) as the defence against fabrication.",
      "Retry-with-error-feedback and the retry effectiveness boundary: fix format/structure, can't invent absent data.",
      "Self-correction schema fields: calculated_total vs stated_total, conflict_detected, detected_pattern.",
      "Few-shot examples (2-4, with reasoning) as the first fix for inconsistency, hallucination, and false positives.",
      "Batch API economics: 50% savings, 24h window, no SLA, no multi-turn tools, custom_id; sync for blocking work.",
      "Independent-instance review + per-file/integration passes; bigger context window does NOT fix attention dilution.",
      "Calibrated confidence thresholds (labelled sets) vs raw self-reported confidence for routing."
    ],

    quickRef: [
      "Explicit categorical criteria + code examples per severity. Never 'be conservative' / confidence as primary filter.",
      "High false positives in one category kill trust in all → disable it, refine with examples, re-enable.",
      "Output reliability: tool_use JSON schemas > prompt-based JSON. Schema = structure, not correctness.",
      "tool_choice: auto (decide) · any (some tool — guaranteed structured output, unknown type) · {type:tool,name} (forced).",
      "Fabrication defence = optional/nullable fields + 'unclear'/'other' enums. Format rules go in the prompt.",
      "Retry feedback = original doc + failed extraction + specific error. Fixes format/structure, not absent info.",
      "Schema self-checks: calculated_total vs stated_total, conflict_detected, detected_pattern for dismissal analysis.",
      "Few-shot: 2-4 examples WITH reasoning; first fix for inconsistent format/judgement/empty-but-present fields.",
      "Batch API: 50% cheaper, up to 24h, no SLA, no multi-turn tools, custom_id correlation. Sync for blocking work.",
      "Batch SLA: submit ≥24h before deadline; refine prompts on a 5-10 doc sample; resubmit only failures.",
      "Review with an independent instance; per-file passes + cross-file integration pass. Bigger window ≠ fix.",
      "Calibrate confidence against labelled sets before routing; raw self-reported confidence is unreliable."
    ]
  };

  // ==========================================================================
  // STUDY GUIDE  — window.STUDY_CONTENT.D4
  // ==========================================================================
  window.STUDY_CONTENT.D4 = {
    title: "Domain 4 — Prompt Engineering & Structured Output",
    weight: "~20%",
    summary: "Writing explicit-criteria prompts, guaranteeing structure with tool_use schemas, building validation-retry loops, using few-shot examples for consistency, choosing batch vs synchronous processing, and validating output with independent multi-pass review.",
    examTips: [
      "Vague instructions (<strong>be conservative</strong>, <strong>high-confidence only</strong>) are distractors — choose <strong>explicit categorical criteria with code examples</strong>.",
      "<strong>tool_use schemas kill JSON syntax errors, not semantic ones.</strong> Make fields <strong>nullable</strong> to stop fabrication.",
      "Retries fix format/structure but <strong>cannot invent absent information</strong> — flag those for human review.",
      "Inconsistent output? <strong>Few-shot examples with reasoning</strong> first, not more instructions.",
      "<strong>Batch API</strong> = 50% cheaper but up to 24h, no SLA — only for non-blocking work; keep pre-merge checks synchronous.",
      "Review with an <strong>independent instance</strong> and <strong>per-file + integration passes</strong>; a bigger context window does NOT fix attention dilution."
    ],
    topics: [
      {
        id: "d4.1",
        title: "System Prompts with Explicit Criteria",
        intro: "Replace vague instructions with explicit categorical criteria and code-example severity calibration.",
        concepts: [
          "Vague instructions ('be conservative', 'high-confidence only', 'use your best judgement') give no actionable decision boundary and are exam distractors.",
          "Explicit categorical criteria define exactly what to flag (bugs, security) and what to skip (style, local patterns), with a specific trigger for each flag.",
          "Severity calibration needs concrete code examples per level, not prose like 'could cause system failures'.",
          "False-positive trust problem: high false positives in one category destroy trust in ALL categories.",
          "Hierarchy: explicit criteria first, confidence-based routing second; LLM self-reported confidence is poorly calibrated."
        ],
        antiPatterns: [
          "Choosing 'be conservative' or 'only report high-confidence findings' as a prompt improvement.",
          "Using confidence thresholds to fix false-positive problems (poorly calibrated).",
          "Defining severity in prose instead of concrete code examples.",
          "Keeping all categories active while iterating on a high-false-positive category."
        ],
        deepDive: [
          "The 40% false-positive scenario: documentation-mismatch findings are wrong 40% of the time, so developers ignore ALL categories including accurate security findings. The fix is to temporarily disable the documentation category to restore system-wide trust, then refine its criteria with explicit code examples and re-enable once precision improves — not 'add only report high-confidence' (vague) or temperature changes.",
          "Code-example severity: 'Critical -- unsanitised user input in SQL: query = f\"SELECT * FROM users WHERE id = {user_input}\"' classifies far more consistently than a prose definition because it removes interpretation."
        ],
        code: {
          title: "Vague vs explicit review criteria",
          body: "# Wrong\nReview this code. Be conservative. Only report high-confidence findings.\n\n# Right\nFlag comments only when claimed behaviour contradicts actual code behaviour.\nReport bugs and security vulnerabilities.\nSkip minor style preferences and local patterns."
        },
        compare: {
          bad: "Add 'only report high-confidence documentation issues' to the prompt",
          good: "Disable the noisy category, refine its criteria with code examples, re-enable"
        },
        examTip: "Vague = wrong. Choose explicit categorical criteria with per-severity code examples. High false positives in one category? Disable it to restore trust, then refine."
      },
      {
        id: "d4.2",
        title: "Structured Output with Tool Use",
        intro: "tool_use JSON schemas guarantee structure (not correctness); nullable fields prevent fabrication.",
        concepts: [
          "Reliability hierarchy: tool_use with JSON schemas (no syntax errors) > prompt-based JSON (can be malformed).",
          "tool_choice: 'auto' (tool or text), 'any' (must call some tool — guaranteed structured output, unknown type), forced {type:tool,name} (mandatory specific step).",
          "tool_use eliminates syntax errors but NOT semantic errors (sum discrepancies, field placement, fabrication).",
          "Optional/nullable fields are the primary defence against fabrication — the model can return null honestly.",
          "Schema design: 'unclear' enum for ambiguity; 'other' + detail string for extensibility; format-normalisation rules in the prompt."
        ],
        antiPatterns: [
          "Believing tool_use prevents all extraction errors (only syntax).",
          "Confusing tool_choice 'auto' (may return text) with 'any' (guarantees a tool call).",
          "Making all fields required, pressuring the model to fabricate missing values.",
          "Putting format-normalisation only in the schema (it enforces structure; the prompt enforces formatting)."
        ],
        deepDive: [
          "All-required-fields fabrication: with a strict schema where every field is required, the model invents plausible dates/amounts for documents lacking them. The root-cause fix is to make those fields optional/nullable so it can return null — better than an instruction not to hallucinate or a post-hoc validation step (helpful but not the root cause).",
          "tool_choice 'any' guarantees structured output while letting the model pick among extract_invoice/extract_receipt/extract_contract when the document type is unknown; forced selection guarantees a specific first step like extract_metadata."
        ],
        code: {
          title: "Nullable fields prevent fabrication",
          body: "{\n  \"properties\": {\n    \"invoice_number\": { \"type\": \"string\" },\n    \"payment_terms\":  { \"type\": [\"string\", \"null\"] }\n  },\n  \"required\": [\"invoice_number\"]\n}"
        },
        compare: {
          bad: "All fields required + 'do not hallucinate' instruction",
          good: "Optional/nullable fields so the model returns null when the source lacks data"
        },
        examTip: "tool_use = structure, not correctness. Unknown doc type needing structured output → tool_choice 'any'. Missing-data fabrication → nullable fields."
      },
      {
        id: "d4.3",
        title: "Prompt Chaining & Validation-Retry Loops",
        intro: "Retry with original doc + failed extraction + specific error; know what retries can and cannot fix.",
        concepts: [
          "Retry-with-error-feedback sends three things: the original document, the failed extraction, and the specific validation error.",
          "Retries ARE effective for format mismatches, structural output errors, misplaced values, and mathematical errors.",
          "Retries are NOT effective for information genuinely absent from the source — flag for human review or return null.",
          "Self-correction schema: calculated_total vs stated_total auto-flags discrepancies; conflict_detected flags contradictions.",
          "detected_pattern fields track which construct triggered a finding, enabling dismissal analysis and prompt refinement."
        ],
        antiPatterns: [
          "Assuming retries always work for extraction failures.",
          "Implementing retries without including the specific validation error (naive retries repeat the mistake).",
          "Relying on schema validation alone without semantic checks.",
          "Retrying documents whose required information is simply not present in the source."
        ],
        deepDive: [
          "The two-document scenario: Document A's line items sum to £450 but stated_total is £500 (a fixable mathematical/structural error → retry with the discrepancy error); Document B is missing the 'department' field entirely from the source (unfixable → flag for human review). Retrying both, or skipping both, is wrong — distinguish fixable from unfixable.",
          "Error categories: schema syntax errors (malformed JSON, missing fields, wrong types) are eliminated by tool_use; semantic validation errors (wrong sums, misplaced values, fabrication) need validation logic and retry loops. The overlap with 4.2 is intentional — tool_use solves the first category only."
        ],
        code: {
          title: "Retry message with error feedback",
          body: "Original document:\n<...>\nYour extraction:\n<failed JSON>\nValidation error: Line items sum to 450 but stated_total is 500.\nPlease re-extract, ensuring all line items are captured."
        },
        compare: {
          bad: "Retry both: the £500 mismatch AND the document missing 'department'",
          good: "Retry the mismatch; flag the missing-field document for human review"
        },
        examTip: "Retry feedback must include the specific error. Fixable (format/structure/sum) → retry; absent info → flag/return null. tool_use handles syntax, not semantics."
      },
      {
        id: "d4.4",
        title: "Few-Shot Prompting",
        intro: "2-4 reasoning-bearing examples are the first fix for inconsistency, hallucination, and false positives.",
        concepts: [
          "Few-shot examples are the most effective technique for consistent, well-formatted output — the first tool to reach for.",
          "Three triggers: detailed instructions still inconsistent; inconsistent judgement on ambiguous cases; empty fields for info that exists in an unexpected format.",
          "Use 2-4 targeted examples; each must show reasoning, not just input-output, so the model generalises the principle.",
          "Examples covering varied document structures reduce hallucination on inconsistently formatted documents.",
          "In code review, examples showing both what to flag and what to ignore reduce false positives while keeping detection."
        ],
        antiPatterns: [
          "Choosing 'add more detailed instructions' when detailed instructions already exist and output is still inconsistent.",
          "Thinking few-shot only teaches literal pattern-matching (reasoning enables generalisation).",
          "Using confidence thresholds to fix inconsistent judgement calls.",
          "Providing input-output pairs without the reasoning for the decision."
        ],
        deepDive: [
          "Narrative-vs-table extraction: the pipeline extracts correctly from structured tables but returns empty fields when the same info is in narrative paragraphs, despite detailed instructions. The first fix is few-shot examples showing correct extraction from BOTH structures — not a bigger context window, a pre-processing table-conversion step, or a blind re-extract retry.",
          "Reasoning generalises: an example routing 'check my order #12345' to lookup_order WITH reasoning ('a specific identifier routes to a specific lookup tool') teaches the principle; without it the model learns only 'order numbers go to lookup_order'."
        ],
        code: {
          title: "Few-shot example with reasoning",
          body: "Input: \"check my order #12345\"\nSelected tool: lookup_order\nReasoning: a specific order identifier means order-specific lookup,\n  so lookup_order over get_customer. Principle: specific identifiers\n  route to specific lookup tools."
        },
        compare: {
          bad: "Output still inconsistent? Add more detailed instructions",
          good: "Add 2-4 few-shot examples (with reasoning) covering the failing cases"
        },
        examTip: "Inconsistent output, ambiguous judgement, or empty-but-present fields → few-shot examples with reasoning. Don't 'add more instructions' if detailed ones already exist."
      },
      {
        id: "d4.5",
        title: "Batch Processing & Prompt Optimisation",
        intro: "Batch API: 50% cheaper, up to 24h, no SLA, no multi-turn tools; sync for blocking work.",
        concepts: [
          "Message Batches API: 50% cost savings, up to 24h processing window, no latency SLA, no multi-turn tool calling, custom_id correlation.",
          "Synchronous for blocking workflows (someone waiting); Batch for latency-tolerant workflows (consumed later).",
          "SLA: Batch guarantees within 24h, so submit the final batch >= 24h before the deadline.",
          "Failure handling: identify failures by custom_id and resubmit only the failures with modifications — not the whole batch.",
          "Refine prompts on a 5-10 doc sample before the full batch; first-pass success rate dominates total cost."
        ],
        antiPatterns: [
          "Switching all workflows (including blocking pre-merge checks) to batch for the cost savings.",
          "Assuming batch results arrive quickly because they often do (there is no SLA).",
          "Using the Batch API for workflows that need multi-turn tool calling mid-request.",
          "Resubmitting the entire batch on failure instead of only the failed custom_ids."
        ],
        deepDive: [
          "The manager proposal (sample Q11): a blocking pre-merge check and an overnight technical-debt report. Use Batch for the technical-debt reports only; keep real-time/synchronous for the pre-merge checks (developers wait, and Batch has no latency SLA). Switching both, or adding timeout fallbacks, is wrong.",
          "SLA math: a 30-hour SLA minus the 24-hour max window leaves a 6-hour buffer; submit fresh batches every 4-6 hours so one is always in flight. Prompt refinement on a sample dominates cost: 90% first-pass on 1,000 docs = 100 retries; 60% = 400 retries (4x)."
        ],
        code: {
          title: "Batch request with custom_id correlation",
          body: "client.batches.create({\n  requests: docs.map((doc, i) => ({\n    custom_id: `debt-report-${i}`,\n    params: { model, max_tokens, messages: [{ role: \"user\", content: doc }] }\n  }))\n});"
        },
        compare: {
          bad: "Switch the pre-merge check AND the overnight report to Batch for 50% savings",
          good: "Batch the overnight report only; keep the pre-merge check synchronous"
        },
        examTip: "Batch = non-blocking only (no SLA, up to 24h, no multi-turn tools). Keep blocking checks synchronous. Resubmit only failed custom_ids; refine on a sample first."
      },
      {
        id: "d4.6",
        title: "Multi-Instance Review & Output Validation",
        intro: "Independent instances + per-file/integration passes beat self-review; calibrate confidence before routing.",
        concepts: [
          "A model reviewing its own output in the same session retains reasoning context and tends to confirm rather than challenge it.",
          "An independent instance (separate invocation, no prior context) reviews fresh and catches subtle issues.",
          "Multi-pass review: Pass 1 per-file local analysis (consistent depth), Pass 2 cross-file integration (data flow, contradictions, API contracts).",
          "A larger context window does NOT fix attention dilution — it's an attention-quality problem, not a capacity problem.",
          "Confidence-based routing: high-confidence direct to developers, low-confidence to human review; calibrate thresholds with labelled sets."
        ],
        antiPatterns: [
          "Treating self-review in the same session as a viable review strategy.",
          "Using a single pass for large multi-file reviews (inconsistent depth, missed bugs, contradictions).",
          "Switching to a larger context window model to fix attention dilution.",
          "Using uncalibrated raw confidence scores for automated routing decisions."
        ],
        deepDive: [
          "The 14-file PR scenario: inconsistent depth, missed bugs, and contradictory findings (a pattern flagged in one file, approved in another). The fix is per-file local passes for consistent depth plus a separate cross-file integration pass for data-flow issues — not a larger context window, not majority-vote over three full-PR passes, and not forcing developers to split PRs.",
          "Confidence calibration: the score is the model's self-assessed certainty, not measured accuracy. Run labelled examples through the system, measure confidence-vs-accuracy, and set routing thresholds from that. Raw uncalibrated confidence is unreliable for automated decisions."
        ],
        code: {
          title: "Independent review instance (no prior context)",
          body: "// Anti-pattern: ask the SAME session to review its own code\n// Correct: a fresh instance with only the code to review\nclient.messages.create({ messages: [{ role: \"user\",\n  content: `Review this code for bugs, security, edge cases:\\n${code}` }] });"
        },
        compare: {
          bad: "Bigger context-window model so all 14 files get attention in one pass",
          good: "Per-file local passes + a separate cross-file integration pass"
        },
        examTip: "Review with an INDEPENDENT instance. Large reviews → per-file + integration passes (bigger window doesn't help). Calibrate confidence against labelled sets before routing."
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
  var D4_FLASHCARDS = [
    { front: "What beats vague instructions like 'be conservative' in a system prompt?", back: "Explicit categorical criteria: define exactly what to flag (bugs, security) and what to skip (style, local patterns), with concrete code examples for each severity level. Vague instructions give no actionable decision boundary." },
    { front: "What is the false-positive trust problem, and its fix?", back: "High false positives in ONE category destroy trust in ALL categories (developers ignore accurate findings too). Fix: temporarily disable the noisy category to restore system-wide trust, refine its criteria with code examples, then re-enable." },
    { front: "Why is severity defined with code examples, not prose?", back: "Prose like 'could cause system failures' forces interpretation; a labelled concrete pattern (e.g. unsanitised SQL = Critical) removes ambiguity and yields consistent classification across invocations." },
    { front: "Why does confidence-based filtering fail as a primary mechanism?", back: "LLM self-reported confidence is poorly calibrated — often confident about wrong findings. Hierarchy: explicit criteria first, confidence-based routing second (after calibration)." },
    { front: "What's the structured-output reliability hierarchy?", back: "tool_use with JSON schemas (eliminates JSON syntax errors) > prompt-based JSON (can be malformed). tool_use guarantees structure, not correctness." },
    { front: "tool_choice: auto vs any vs forced?", back: "auto = model decides tool or text. any = must call SOME tool (guaranteed structured output, unknown doc type). {type:tool,name} = must call THAT specific tool (mandatory step)." },
    { front: "What does tool_use NOT prevent?", back: "Semantic errors: sum discrepancies (line items don't total), field-placement errors, and fabrication of values for required fields the source lacks. The schema guarantees structure, not correctness." },
    { front: "Primary defence against the model fabricating missing values?", back: "Make fields optional/nullable when the source may lack them, so the model can honestly return null. Add 'unclear' and 'other'+detail enum values for ambiguity/extensibility." },
    { front: "What three things make retry-with-error-feedback effective?", back: "The original document, the failed extraction, and the specific validation error. Without the specific error, the model just reproduces the same mistake." },
    { front: "The retry effectiveness boundary?", back: "Retries fix format mismatches, structural errors, misplaced values, and math errors. They CANNOT create information genuinely absent from the source — flag those for human review or return null." },
    { front: "How do schemas self-detect discrepancies and conflicts?", back: "Extract calculated_total vs stated_total (mismatch = auto discrepancy flag) and conflict_detected booleans (contradictory source content). detected_pattern fields enable dismissal analysis for prompt refinement." },
    { front: "Schema syntax errors vs semantic validation errors?", back: "Syntax errors (malformed JSON, missing fields, wrong types) are eliminated by tool_use. Semantic errors (wrong sums, misplaced/fabricated values) need validation logic + retry loops." },
    { front: "First fix for inconsistent output (when detailed instructions already exist)?", back: "Few-shot examples — the most effective consistency technique. Not more instructions, not confidence thresholds, not temperature." },
    { front: "How many few-shot examples, and what must each include?", back: "2–4 targeted examples aimed at the failing scenarios, and each must include REASONING (not just input→output) so the model generalises the decision principle to novel cases." },
    { front: "Three triggers that call for few-shot examples?", back: "(1) detailed instructions still produce inconsistent formatting; (2) inconsistent judgement on ambiguous cases; (3) empty/null fields for information that exists in an unexpected format (e.g. narrative text)." },
    { front: "Key facts about the Message Batches API?", back: "~50% cost savings, up to 24-hour processing window, NO latency SLA, NO multi-turn tool calling in a single request, and custom_id fields to correlate requests/responses." },
    { front: "Synchronous vs Batch API — the matching rule?", back: "Synchronous for blocking workflows (someone waiting — pre-merge checks, real-time review). Batch for latency-tolerant workflows (overnight reports, weekly audits, nightly test generation)." },
    { front: "Correct batch failure handling?", back: "Identify failures by custom_id and resubmit ONLY those, with modifications (chunk oversized docs, simpler prompts, format-specific examples). Refine prompts on a 5–10 doc sample first — first-pass success dominates cost." },
    { front: "Why is self-review in the same session weak?", back: "The generating session retains its reasoning context and tends to confirm rather than challenge its own decisions. Use an independent instance (no prior context) for review." },
    { front: "Fix for inconsistent multi-file review (attention dilution)?", back: "Per-file local analysis passes (consistent depth) + a separate cross-file integration pass (data flow, contradictions, API contracts). A larger context window does NOT fix attention quality." },
    { front: "Raw vs calibrated confidence for routing?", back: "Raw self-reported confidence is uncalibrated and unreliable for automated decisions. Calibrate thresholds against labelled validation sets (confidence-vs-accuracy), then route low-confidence findings to human review." },
    { front: "What is the full production review architecture?", back: "Generate → independent per-file review → cross-file integration review → confidence-based routing (low-confidence to humans) → continuous calibration loop with labelled sets." }
  ];
  Array.prototype.push.apply(window.FLASHCARDS, D4_FLASHCARDS);
})();
