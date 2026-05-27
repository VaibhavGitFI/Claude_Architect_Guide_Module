/*
 * Domain 4 — Exam-Sim Bank
 *
 * Original scenario-based questions authored from the public concepts in
 * Anthropic's docs (system prompts, tool_use & JSON schemas, validation/retry,
 * few-shot prompting, Message Batches API, multi-instance review) and the
 * deep-dive content in data/d4.js. Topic IDs match the study content (d4.1 – d4.6).
 *
 * Populates window.EXAM_BANK.D4. Schema per question:
 *   { id, source:"extra", domain:"D4", topic:"d4.X", topicTitle,
 *     question, options:[A,B,C,D], answer: 0-3 (pre-shuffle index),
 *     rationales:[whyA, whyB, whyC, whyD] }
 */
(function () {
  "use strict";

  window.EXAM_BANK = window.EXAM_BANK || {};

  var D4 = [
    // ====================================================================
    // 4.1 — System Prompts with Explicit Criteria
    // ====================================================================
    {
      id: "d4.1-extra-1", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "Your CI code review pipeline has a 40% false positive rate on \"documentation mismatch\" findings. Developers have stopped reading ALL review categories — including accurate security findings. What is the most effective immediate response?",
      options: [
        "Add `\"only report high-confidence documentation issues\"` to the system prompt",
        "Temporarily disable the documentation-mismatch category while refining its criteria with concrete code examples, then re-enable once precision improves",
        "Raise the temperature so the noisy outputs become more varied and easier to spot",
        "Add a second model pass that verifies each documentation finding before reporting it"
      ],
      answer: 1,
      rationales: [
        "\"High-confidence\" is a vague threshold the model has no actionable definition for. It will not move the false-positive rate meaningfully and won't restore trust in the other categories.",
        "High false positives in ONE category destroy trust in ALL categories. Temporarily disabling the noisy category instantly restores trust in the others; iterate on its criteria offline and re-enable when precision is acceptable.",
        "Temperature controls randomness, not precision. Higher temperature makes outputs more varied, often increasing the false-positive rate.",
        "A second pass with the same criteria reproduces the same misclassifications. Fix criteria first; consider a verifier only if needed afterwards."
      ]
    },
    {
      id: "d4.1-extra-2", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "Which system-prompt instruction gives the model the most ACTIONABLE decision boundary for a code-review task?",
      options: [
        "\"Be conservative and only flag issues you are highly confident about\"",
        "\"Use your best judgement to identify important code issues\"",
        "\"Flag comments only when claimed behaviour contradicts actual code behaviour. Report bugs and security vulnerabilities. Skip minor style preferences and local patterns.\"",
        "\"Try to minimise false positives while maintaining good coverage of real issues\""
      ],
      answer: 2,
      rationales: [
        "\"Conservative\" and \"highly confident\" are subjective; they leave the decision boundary undefined.",
        "\"Best judgement\" and \"important\" are precisely the kind of vague guidance that produces inconsistent classification.",
        "This defines specific trigger conditions (claimed vs actual behaviour), categories to REPORT (bugs, security), and categories to SKIP (style, local patterns). The model has actionable criteria.",
        "Describes the desired outcome but not the criteria. \"Minimise false positives\" gives the model nothing to apply."
      ]
    },
    {
      id: "d4.1-extra-3", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "You need to define severity levels for a code-review system that produce consistent classification across invocations. Which approach is most effective?",
      options: [
        "Prose definitions: \"Critical = issues that could cause system failures or data loss; Minor = issues that affect readability\"",
        "Concrete code examples for each severity level — e.g. an unsanitised SQL injection labelled Critical, an inconsistent variable name labelled Minor",
        "A confidence threshold: findings with confidence > 0.9 are Critical; < 0.5 are Minor",
        "A decision tree keyed on file type (e.g. all DB code is Critical, all UI code is Minor)"
      ],
      answer: 1,
      rationales: [
        "Prose like \"could cause system failures\" forces the model to interpret abstract language; interpretation varies across calls, producing inconsistent classification.",
        "Concrete code examples remove ambiguity. The model sees actual patterns labelled at each level and reproduces the classification consistently.",
        "LLM self-reported confidence is poorly calibrated and does not reliably correlate with actual severity.",
        "File type is not a reliable proxy for severity. A critical SQL injection can appear in any file type, and benign code can appear in DB files."
      ]
    },
    {
      id: "d4.1-extra-4", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "A developer proposes \"only report findings with self-reported confidence > 0.85\" as the precision fix. Why is this approach insufficient?",
      options: [
        "0.85 is too high a threshold — 0.70 would catch more true positives",
        "LLM self-reported confidence is poorly calibrated: models are often confidently wrong on hard cases and unnecessarily uncertain on easy ones",
        "Confidence filtering only works with the Batches API",
        "The model ignores numeric thresholds embedded in system prompts"
      ],
      answer: 1,
      rationales: [
        "Tuning the threshold does not change the fundamental calibration problem; either it suppresses real issues or admits false positives.",
        "Self-reported confidence is poorly calibrated. Explicit categorical criteria are the right FIRST step; confidence-based ROUTING (with calibrated thresholds against labelled data) is a secondary technique.",
        "Confidence is reported in the model output regardless of API. Calibration quality is the issue, not API choice.",
        "Models do apply such instructions — the problem is that the underlying confidence signal is unreliable."
      ]
    },
    {
      id: "d4.1-extra-5", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "Your code-review system has 5 categories. \"Unused imports\" runs a 45% false-positive rate; the other four average 8%. Developers have stopped reading any of the review output. What should you do first?",
      options: [
        "Retrain the system on more code examples to improve overall accuracy",
        "Apply a global confidence threshold to all five categories",
        "Temporarily disable \"unused imports\" while refining its criteria with concrete code examples — this restores trust in the four working categories immediately",
        "Permanently remove \"unused imports\" since 45% FP is unacceptable"
      ],
      answer: 2,
      rationales: [
        "Retraining is heavy and treats this as a model-capability problem. The other four categories already work; only one is poisoning trust.",
        "A global threshold suppresses valid findings in the four working categories, making the trust problem worse, not better.",
        "Disabling the noisy category restores trust in the working four. Iterate on the disabled category with explicit criteria + code examples, then re-enable when precision is acceptable. Trust-recovery first, completeness second.",
        "Permanent removal throws away a useful category that's almost certainly fixable with better criteria. Disable temporarily, then refine."
      ]
    },
    {
      id: "d4.1-extra-6", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "What is the correct HIERARCHY for improving precision in a production code-review system?",
      options: [
        "Confidence thresholds first; explicit criteria only if thresholds are insufficient",
        "Explicit categorical criteria first; confidence-based routing (with calibrated thresholds against labelled data) as a secondary technique",
        "Few-shot examples first; then explicit criteria; then confidence thresholds",
        "Temperature adjustment first; then criteria refinement; then confidence routing"
      ],
      answer: 1,
      rationales: [
        "Confidence thresholds without explicit criteria float on a poorly calibrated signal; this inverts the hierarchy.",
        "Explicit criteria define what is a valid finding. Calibrated confidence routing is a secondary technique once criteria are established.",
        "Few-shot examples are an excellent consistency technique (Task Statement 4.4), but explicit criteria for what constitutes a valid finding come first for precision.",
        "Temperature changes randomness, not precision. It is not part of the precision improvement hierarchy."
      ]
    },
    {
      id: "d4.1-extra-7", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "A reviewer prompt says \"Flag SQL injection risk and similar vulnerabilities.\" The model flags many false positives on parameterised queries. What is the most direct fix?",
      options: [
        "Add: \"don't flag false positives\" to the prompt",
        "Define the criterion concretely: flag SQL injection ONLY when user input is concatenated/templated into the SQL string. Add code examples — concatenated string with user input (Critical) versus a parameterised query (skip)",
        "Remove the security-vulnerability check entirely and rely on a separate static analyser",
        "Increase max_tokens so the model has more room to explain itself"
      ],
      answer: 1,
      rationales: [
        "\"Don't flag false positives\" is meaningless to the model — it doesn't know which of its findings are false positives.",
        "Concrete trigger conditions plus side-by-side code examples (positive vs negative case) is the textbook fix: it gives the model an actionable decision boundary and a pattern to imitate.",
        "Removing the check loses a valuable category. Refine the criteria first.",
        "max_tokens affects output length, not classification accuracy."
      ]
    },
    {
      id: "d4.1-extra-8", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "Why does \"high false positives in one category destroy trust in ALL categories\" follow from how developers actually use review output?",
      options: [
        "The model shares confidence across categories internally, so noise in one bleeds into the others",
        "Developers ration attention — when one category trains them to ignore findings, they generalise that scepticism to the whole review, missing accurate findings in other categories",
        "Review tools deduplicate findings across categories, so noise in one suppresses the others",
        "It only destroys trust within the noisy category; the other categories remain trusted"
      ],
      answer: 1,
      rationales: [
        "Categories are independent; there is no shared internal confidence carrier.",
        "Developer attention is the limiting resource. Once a category trains them to skip review output, they stop reading the rest. Trust is a property of the WORKFLOW, not just per-category precision.",
        "Deduplication does not cross categories; this is not how review tools behave.",
        "Empirically, developer scepticism generalises. The whole point of the trust-recovery pattern is recognising that one noisy category poisons the entire workflow's trust."
      ]
    },
    {
      id: "d4.1-extra-9", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "Which of these is NOT a good way to define severity levels?",
      options: [
        "Provide code examples for each level (a Critical example, a High example, a Medium example)",
        "Define each level by the specific code patterns that qualify, with code samples",
        "Define each level by abstract prose like \"could cause system failures\" without concrete examples",
        "Pair the level with the recommended remediation timeline"
      ],
      answer: 2,
      rationales: [
        "Per-level code examples produce consistent classification across calls. Good practice.",
        "Pattern-anchored definitions with samples are the recommended approach.",
        "Abstract prose is the documented anti-pattern. \"Could cause system failures\" still requires the model to interpret what that means — and interpretations vary across calls.",
        "Pairing severity with remediation timelines is fine; it doesn't replace the need for concrete pattern examples but it doesn't undermine consistency either."
      ]
    },
    {
      id: "d4.1-extra-10", source: "extra",
      domain: "D4", topic: "d4.1", topicTitle: "System Prompts with Explicit Criteria",
      question: "A team adds the line \"err on the side of caution and report anything unusual\" to a code-review prompt to catch more issues. False positives rise sharply. What went wrong?",
      options: [
        "\"Anything unusual\" is an open-ended invitation to flag patterns that may be perfectly correct. Explicit criteria specifying what to flag AND what to skip would produce more reliable behaviour",
        "The system prompt was placed after the user message instead of before it",
        "The model needs a higher temperature to be appropriately cautious",
        "Cautious behaviour requires fine-tuning, not prompt engineering"
      ],
      answer: 0,
      rationales: [
        "Vague calls to err cautiously inflate the candidate set without explicit criteria. The fix is paired positive/negative criteria — what to flag AND what to skip — anchored with examples.",
        "System-prompt position is not the cause of imprecise criteria.",
        "Higher temperature does not produce cautious behaviour; it produces more variable behaviour.",
        "Fine-tuning is not required. Explicit prompt criteria solve this."
      ]
    },

    // ====================================================================
    // 4.2 — Structured Output with Tool Use
    // ====================================================================
    {
      id: "d4.2-extra-1", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "Your extraction system uses `tool_use` with a strict JSON schema where every field is required. Testers report the model invents plausible dates and amounts for documents that lack the information. What is the best fix?",
      options: [
        "Add an instruction telling the model not to hallucinate values",
        "Switch to prompt-based JSON extraction so the model can omit fields",
        "Make optional fields nullable (e.g. `type: [\"string\", \"null\"]`) and remove them from `required` when the source document may not contain the information",
        "Add a post-extraction validation step that checks every field against the source document"
      ],
      answer: 2,
      rationales: [
        "Vague instructions do not override schema-level pressure. The model is still being told the field is required.",
        "Moving back to prompt-based JSON reintroduces syntax errors and does not fix the fabrication root cause.",
        "Schema-level fix: optional + nullable fields let the model honestly return null when the source lacks the information, instead of being structurally pressured to invent values.",
        "Post-hoc validation catches some symptoms but does not eliminate the structural pressure that produces fabrication in the first place."
      ]
    },
    {
      id: "d4.2-extra-2", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "You have three extraction tools (`extract_invoice`, `extract_receipt`, `extract_contract`) and a stream of documents of unknown type. You need GUARANTEED structured output. Which `tool_choice` setting is correct?",
      options: [
        "`tool_choice: { type: \"auto\" }`",
        "`tool_choice: { type: \"any\" }`",
        "`tool_choice: { type: \"tool\", name: \"extract_invoice\" }`",
        "Do not set `tool_choice` and rely on the default"
      ],
      answer: 1,
      rationales: [
        "`auto` lets the model decide between text and a tool call. If you need GUARANTEED structured output, `auto` is wrong.",
        "`any` guarantees the model will call SOME tool while still allowing it to choose which one fits the document. This is exactly the use case for `any`.",
        "Forcing `extract_invoice` processes every document as an invoice, even receipts and contracts.",
        "The default is `auto`, which has the same problem as option A."
      ]
    },
    {
      id: "d4.2-extra-3", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "Which of the following errors does `tool_use` with a JSON schema definitively PREVENT?",
      options: [
        "Line items that do not sum to the stated total",
        "Malformed JSON: missing brackets, trailing commas, unquoted keys",
        "Values placed in the wrong fields (e.g. a date string in an amount field where both are strings)",
        "Fabricated data for information absent from the source document"
      ],
      answer: 1,
      rationales: [
        "Sum discrepancies are semantic errors. The schema cannot check arithmetic.",
        "JSON syntax errors are eliminated entirely by `tool_use`. The API guarantees schema-compliant structure: brackets balanced, fields typed, keys present.",
        "Field-placement errors between same-typed fields are semantic. The schema only enforces types, not semantic correctness of which value goes where.",
        "Fabrication is semantic. The schema forces the model to produce a value of the right type but cannot verify whether that value is true."
      ]
    },
    {
      id: "d4.2-extra-4", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "Your schema has `\"category\": { \"enum\": [\"invoice\", \"receipt\", \"contract\"] }`. Processing reveals documents that don't fit any of those categories, and the model forces incorrect classifications. What is the recommended schema fix?",
      options: [
        "Remove the enum and use a freeform string",
        "Add `\"unclear\"` for genuinely ambiguous documents AND `\"other\"` paired with a separate freeform `category_detail` string field for edge cases that do not match the predefined categories",
        "Add a self-reported confidence score on the category and discard low-confidence assignments",
        "Expand the enum to enumerate every possible document type the team can imagine"
      ],
      answer: 1,
      rationales: [
        "Removing the enum loses the classification structure that downstream processing depends on.",
        "Pairing an `\"unclear\"` value (for ambiguous evidence) with `\"other\" + freeform detail` (for documents outside the known categories) gives the model honest exits and keeps the classification structured.",
        "Confidence scores are poorly calibrated and do not solve a missing-category problem.",
        "You cannot enumerate every possible document type — and the schema would balloon. The `other + detail` pattern is extensible without constant schema changes."
      ]
    },
    {
      id: "d4.2-extra-5", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "When is `tool_choice: { type: \"tool\", name: \"extract_metadata\" }` the right choice rather than `\"any\"`?",
      options: [
        "When you want the model to choose the most appropriate extraction tool",
        "When you need to force a MANDATORY first step — e.g. metadata extraction must run before any enrichment tool, regardless of model preference",
        "When you want guaranteed structured output with unknown document types",
        "When you want the model to optionally return text if no tool fits"
      ],
      answer: 1,
      rationales: [
        "Flexible selection is `\"any\"`, not forced selection.",
        "Forced selection guarantees a specific tool runs as the first step. Use it for mandatory workflow ordering (e.g. always extract metadata first, then enrich).",
        "Guaranteed output across unknown types is `\"any\"` so the model picks the right schema.",
        "Optional text output is `\"auto\"`."
      ]
    },
    {
      id: "d4.2-extra-6", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "You are designing a JSON schema for financial extraction. Some documents include a tax ID; many do not. How should you define the `tax_id` field?",
      options: [
        "`{ \"type\": \"string\" }` and include `tax_id` in `required`",
        "`{ \"type\": [\"string\", \"null\"] }` and OMIT `tax_id` from `required`",
        "`{ \"type\": \"string\", \"default\": \"N/A\" }` to fill in absent values",
        "Omit the field entirely and add it later via post-processing if found"
      ],
      answer: 1,
      rationales: [
        "Required + non-nullable structurally pressures the model to fabricate a plausible-looking tax number when the document lacks one.",
        "Nullable type plus optional status lets the model honestly return null when the information is absent — and you can distinguish \"not present\" from \"forgot to extract\" downstream.",
        "Defaulting to \"N/A\" is still fabrication: the field contains a placeholder that may pass downstream type checks without representing truth.",
        "Omitting the field loses the ability to distinguish \"absent\" from \"not extracted\"; the nullable+optional pattern is the right design."
      ]
    },
    {
      id: "d4.2-extra-7", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "Your schema has `\"amount\": { \"type\": \"number\" }`. The model sometimes returns `\"amount\": \"1,250.00\"` (a string with a thousands separator). What does this tell you?",
      options: [
        "`tool_use` does not enforce primitive types — only structure",
        "The schema is being violated; either the validation step is missing, or this is an older non-strict implementation. With strict tool_use validation, the API does not accept a string for a `number` field",
        "Numbers with thousands separators are accepted as valid numeric values by the API",
        "The model is correctly reporting the source document's literal text"
      ],
      answer: 1,
      rationales: [
        "`tool_use` with JSON schemas enforces both structure AND types. A `\"number\"` constraint excludes string values.",
        "Either the API call is not actually enforcing the schema (non-strict mode or missing validation) or the output is being processed before validation. With strict tool_use, this output would not appear.",
        "Strings with thousands separators are NOT numbers in JSON; they fail type validation.",
        "The model is supposed to translate the source value into the schema's required type — it should produce the number `1250.00`, not a string."
      ]
    },
    {
      id: "d4.2-extra-8", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "What is the reliability HIERARCHY for getting structured output from Claude?",
      options: [
        "Prompt-based JSON > tool_use with JSON schemas > forced response shapes via temperature 0",
        "tool_use with JSON schemas > prompt-based JSON. tool_use eliminates JSON syntax errors entirely; prompt-based JSON does not",
        "Both are equivalent — use whichever is more convenient",
        "Markdown JSON code blocks > tool_use > prompt-based JSON"
      ],
      answer: 1,
      rationales: [
        "Prompt-based JSON is the LESS reliable option; this reverses the hierarchy.",
        "Schema-bound tool_use is the documented top of the reliability hierarchy for structured output. Prompt-based JSON is a fallback that introduces parser-breaking errors.",
        "They are not equivalent. tool_use is strictly more reliable for structure.",
        "Markdown-fenced JSON adds parsing complexity without solving syntax-error risk."
      ]
    },
    {
      id: "d4.2-extra-9", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "Which use of `tool_use` would be a misuse of the structured-output mechanism?",
      options: [
        "Extracting structured invoice data with required fields for invoice number and vendor",
        "Forcing a structured response by registering a tool whose only purpose is to wrap the model's free-form text as a single string field",
        "Pairing strict typed fields with nullable optional fields where the source document may legitimately not contain them",
        "Using `tool_choice: \"any\"` to guarantee a structured response across multiple schemas of unknown document type"
      ],
      answer: 1,
      rationales: [
        "Standard correct use of structured extraction.",
        "Wrapping freeform text in a single-string tool field defeats the purpose of structured output. You get tool_use's overhead with none of the structural validation benefit — the field is just freeform text.",
        "Correct application of the nullable+optional pattern for fields that may be absent in the source.",
        "Correct use of `\"any\"` when the schema choice depends on the document."
      ]
    },
    {
      id: "d4.2-extra-10", source: "extra",
      domain: "D4", topic: "d4.2", topicTitle: "Structured Output with Tool Use",
      question: "Your extraction tool's schema includes `\"line_items\": { \"type\": \"array\", \"items\": { \"type\": \"object\", \"properties\": { \"description\": ..., \"amount\": ... } } }` with `\"line_items\"` required. The model returns an empty `\"line_items\": []` for a document that has no line items on it. Is this a fabrication?",
      options: [
        "Yes — required arrays must contain at least one item; the empty array is a fabricated structure",
        "No — an empty array is a HONEST shape that says \"this document has no line items\". Required arrays may be empty unless the schema also specifies `minItems`",
        "Yes — the model should have returned `null` instead",
        "Yes — the model invented a non-existent line_items section"
      ],
      answer: 1,
      rationales: [
        "JSON Schema does not require non-empty arrays unless `minItems` is set. An empty array satisfies a required array field.",
        "Empty arrays honestly represent \"no items found.\" If the application semantics require at least one item, add `\"minItems\": 1` to the schema; if not, an empty array is a valid honest answer.",
        "Returning null would VIOLATE the schema for a required array unless the type is `[\"array\", \"null\"]`. `[]` is the right honest answer.",
        "The model didn't invent line items — it returned zero of them. That's the opposite of fabrication."
      ]
    },

    // ====================================================================
    // 4.3 — Prompt Chaining and Validation-Retry Loops
    // ====================================================================
    {
      id: "d4.3-extra-1", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Your pipeline validates that line-item amounts sum to the stated total. For Document A, calculated sum is £450 but stated total is £500. For Document B, the `department` field is absent from the source text entirely. Which retry strategy is correct?",
      options: [
        "Retry both with the validation errors and ask the model to re-extract all fields",
        "Retry Document A with the discrepancy error; flag Document B for human review since the information is genuinely absent from the source",
        "Retry both with identical prompts since extraction is non-deterministic",
        "Skip retries for both and flag everything for human review"
      ],
      answer: 1,
      rationales: [
        "Document B cannot be fixed by retrying — the data does not exist. Retrying will tend to produce a fabricated value or another null.",
        "Document A's discrepancy is exactly the kind of error that retry-with-feedback fixes: the model can re-read the source and likely find the missed line item. Document B's information is absent; retrying cannot create it.",
        "Non-determinism does not create absent information. Document A may benefit; Document B will not.",
        "Skipping the retry on Document A wastes the model's self-correction capability on a fixable error."
      ]
    },
    {
      id: "d4.3-extra-2", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Which three pieces of information should a retry message include for maximum self-correction effectiveness?",
      options: [
        "The original prompt, the model's confidence score, and a request to try again",
        "The ORIGINAL DOCUMENT, the FAILED EXTRACTION, and the SPECIFIC VALIDATION ERROR",
        "The failed extraction, a corrected example, and instructions to match the example",
        "The original document, a list of all possible errors, and a higher temperature setting"
      ],
      answer: 1,
      rationales: [
        "Confidence scores are poorly calibrated; the original prompt alone gives the model no signal about what went wrong.",
        "These three are the documented retry-with-error-feedback ingredients: the source (to re-examine), the failed output (to see what it produced), and the specific error (to target self-correction).",
        "Providing a corrected example removes the model's need to self-correct and risks anchoring on your possibly-wrong example.",
        "A vague \"list of all possible errors\" gives no targeted guidance; higher temperature does not improve accuracy."
      ]
    },
    {
      id: "d4.3-extra-3", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Your schema includes both `calculated_total` (sum of line items) and `stated_total` (from the document). For a particular extraction, both are £720 but `total_discrepancy` is set to true. What does this indicate?",
      options: [
        "The extraction is correct; the discrepancy flag is harmless metadata",
        "A semantic error in flag-setting: the two totals match, so `total_discrepancy` should be false. A retry should send back the specific error \"total_discrepancy set to true but calculated_total equals stated_total\"",
        "The schema is misconfigured and the two totals should be one field",
        "The model correctly identified a hidden discrepancy you should investigate manually"
      ],
      answer: 1,
      rationales: [
        "Incorrect flag values are not harmless — they trigger downstream alerts or routing. This is a semantic error worth retrying.",
        "When the values agree but the flag disagrees, the flag is wrong. A targeted retry with the specific contradiction is the documented fix.",
        "Separate fields are exactly what make automatic discrepancy detection possible. Don't collapse them.",
        "The totals match; there is no hidden discrepancy. The flag is incorrect."
      ]
    },
    {
      id: "d4.3-extra-4", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Developers consistently dismiss code-review findings tagged with `detected_pattern: \"variable shadowing in nested scope\"`. What is the most productive response?",
      options: [
        "Remove the variable-shadowing detection from the system altogether",
        "Add a confidence threshold and suppress low-confidence shadowing findings",
        "Analyse the dismissal data tied to that `detected_pattern`, then refine the criteria — likely adding code examples that distinguish benign shadowing (small arrow-function scope) from problematic shadowing (long function body, reassigned)",
        "Require developers to provide justification for each dismissal before it counts"
      ],
      answer: 2,
      rationales: [
        "Some shadowing cases are real bugs. Removing the category loses valid findings.",
        "Confidence thresholds are poorly calibrated and do not address the criteria root cause.",
        "`detected_pattern` tracking is the systematic improvement loop. Dismissal rates per pattern are a signal for criteria refinement, usually with code examples that show benign vs problematic cases.",
        "Adding friction in the dismissal flow does not improve precision; it just frustrates developers."
      ]
    },
    {
      id: "d4.3-extra-5", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Which error type is most likely FIXABLE by a retry-with-error-feedback loop?",
      options: [
        "A document genuinely lacking a vendor tax identification number",
        "Line items summing to £450 when the stated total is £500, suggesting a missed line item",
        "A field requiring an external database lookup not available to the model",
        "Information that exists only in a separate document not provided to the model"
      ],
      answer: 1,
      rationales: [
        "Absent information cannot be created by retrying.",
        "A sum discrepancy is a structural / mathematical error; the missing line item is almost certainly in the source. Retrying with the discrepancy error tells the model exactly where to look.",
        "External data not available to the model is out of scope for any retry.",
        "Data in a separate, unprovided document is also out of scope."
      ]
    },
    {
      id: "d4.3-extra-6", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "What is the distinction between SCHEMA SYNTAX errors and SEMANTIC VALIDATION errors in `tool_use` extraction?",
      options: [
        "Schema syntax errors are caught at compile time; semantic errors are caught at runtime",
        "Schema syntax errors (malformed JSON, wrong types, missing required fields) are eliminated by tool_use. Semantic errors (wrong sums, misplaced values, fabricated data) require validation logic and retry loops",
        "tool_use with strict JSON schemas eliminates both kinds of errors",
        "Schema syntax errors are minor cosmetic issues; semantic errors are critical"
      ],
      answer: 1,
      rationales: [
        "Not a compile-vs-runtime distinction; this is about what the API can structurally enforce vs what must be checked in application logic.",
        "tool_use guarantees schema-compliant structure (no malformed JSON, no wrong types) but cannot verify whether the values are accurate. Semantic correctness needs explicit validation and a retry loop.",
        "tool_use does not check semantic correctness — that's the whole point of needing validation + retry.",
        "Both kinds can be critical; the distinction is what prevents them, not their severity."
      ]
    },
    {
      id: "d4.3-extra-7", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Your retry loop has no cap. The validator keeps reporting the same error and the model keeps producing the same broken output. What is the appropriate safeguard?",
      options: [
        "Retry forever — eventually the model will get it right",
        "Cap retries at a small number (e.g. 2–3) and on exhaustion: flag the item for human review and log the failure with the validator output and prior model attempts",
        "Increase temperature on each retry to force divergence",
        "Switch to prompt-based JSON to bypass the schema entirely"
      ],
      answer: 1,
      rationales: [
        "Unbounded retry burns tokens, breaks SLAs, and trains nothing. There must be a safety bound.",
        "A small retry cap plus human-review escalation on exhaustion is the standard pattern. Log the validator output and the model's prior attempts to feed offline criteria improvement.",
        "Temperature increases produce more random output, not more accurate output, and often make the problem worse.",
        "Dropping the schema sacrifices structural reliability and doesn't address the semantic error."
      ]
    },
    {
      id: "d4.3-extra-8", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "A `conflict_detected: true` field appears in extracted output. What is the appropriate downstream behaviour?",
      options: [
        "Treat the extraction as failed and discard it",
        "Surface the conflict to the validator / human review queue — `conflict_detected` is a designed self-correction signal that the document contained contradictory information; the model honestly flagged it instead of silently picking one",
        "Retry immediately with the same prompt",
        "Lower the confidence threshold so the conflict is suppressed"
      ],
      answer: 1,
      rationales: [
        "Discarding loses valuable structured output that includes both candidate values.",
        "`conflict_detected` is a designed schema affordance: when the document is genuinely contradictory, the model should set this flag rather than silently choosing one. Surface it for review and resolution.",
        "Retrying on a conflict produces the same conflict because the source itself is contradictory. This is a fix-the-source or human-review case.",
        "Suppressing the conflict produces silently incorrect output downstream."
      ]
    },
    {
      id: "d4.3-extra-9", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "A team's retry loop sends back only \"Validation failed, please try again\" with no specifics. The retry rarely improves output. Why?",
      options: [
        "Generic feedback gives the model no targetable signal — it doesn't know WHAT failed. The retry should include the specific validation error (e.g. \"line items sum to £450 but stated_total is £500\") so the model can self-correct on the right axis",
        "Validators should always retry silently to avoid biasing the model",
        "Including the validation error in the retry counts as prompt injection and is unsafe",
        "Retries only work without feedback because feedback contaminates the original instruction"
      ],
      answer: 0,
      rationales: [
        "Generic feedback is the documented failure mode. Specific validation errors are the input the model uses to self-correct on the right thing.",
        "Silent retries are no different from re-running the same prompt; they don't address the model's failure to self-correct.",
        "Feeding back the validator's structured error is a legitimate engineering practice, not a security risk.",
        "Specific feedback in retries is the documented best practice; contamination is not a concern with a well-structured retry message."
      ]
    },
    {
      id: "d4.3-extra-10", source: "extra",
      domain: "D4", topic: "d4.3", topicTitle: "Prompt Chaining & Validation-Retry Loops",
      question: "Which scenario most benefits from a `calculated_total` vs `stated_total` self-correction field pair?",
      options: [
        "A free-text summarisation task with no numeric fields",
        "A multi-line-item financial extraction where errors in line-item capture should be detectable without external arithmetic",
        "A binary classification with two enum values",
        "A timestamp extraction task with a single field"
      ],
      answer: 1,
      rationales: [
        "Self-correction field pairs only help when there's something to cross-check; pure free-text summaries don't have a numeric invariant.",
        "Extracting separate `calculated_total` (sum of line items) and `stated_total` (from the document) turns sum discrepancies into automatic self-checks without any external arithmetic logic.",
        "Binary classification has no internal cross-check; this pattern doesn't fit.",
        "A single timestamp has nothing to cross-check against."
      ]
    },

    // ====================================================================
    // 4.4 — Few-Shot Prompting
    // ====================================================================
    {
      id: "d4.4-extra-1", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "Your extraction pipeline correctly identifies research data in structured tables but returns EMPTY FIELDS when the same information appears in narrative paragraphs. Detailed instructions already specify all required fields and their formats. What should you try first?",
      options: [
        "Increase the model context window",
        "Add 2–4 few-shot examples demonstrating correct extraction from both structured tables AND narrative paragraphs",
        "Add a pre-processing step to convert narrative text into tables before extraction",
        "Add a post-processing retry that re-extracts any fields returned as empty"
      ],
      answer: 1,
      rationales: [
        "Context size isn't the issue — the model is reading the narrative; it just isn't extracting from it.",
        "Few-shot examples spanning both structural variants is the documented first response. Detailed instructions already exist; what the model needs is demonstrations of correct narrative extraction.",
        "Pre-processing adds infrastructure complexity for a problem few-shot examples solve directly.",
        "A blind retry without new guidance produces the same empty results."
      ]
    },
    {
      id: "d4.4-extra-2", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "Your code-review tool flags variable shadowing as \"critical\" in one file and \"minor\" in another. The instructions are detailed and specify severity criteria. What is the most effective fix?",
      options: [
        "Make the severity criteria even more detailed",
        "Add a confidence threshold and only report findings above 0.8",
        "Add 2–3 few-shot examples showing variable shadowing at different severity levels, each with reasoning explaining the classification (e.g. shadowing in a small arrow scope = Minor; shadowing across a long mutating block = Critical)",
        "Increase temperature for variety and majority-vote across three calls"
      ],
      answer: 2,
      rationales: [
        "More prose doesn't fix inconsistent judgement when prose-based criteria already exist.",
        "Confidence thresholds are poorly calibrated and don't address judgement consistency.",
        "Few-shot examples WITH REASONING teach the general decision principle, not just the surface pattern. The model generalises consistent judgement to novel shadowing cases.",
        "Temperature + voting adds cost and complexity without addressing the underlying inconsistency."
      ]
    },
    {
      id: "d4.4-extra-3", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "How many few-shot examples should you typically include for an ambiguous classification task?",
      options: [
        "1 example, to minimise tokens",
        "2–4 targeted examples covering the specific ambiguous scenarios",
        "8–10 examples for comprehensive coverage",
        "As many as will fit in the context window"
      ],
      answer: 1,
      rationales: [
        "One example does not establish a pattern; the model cannot generalise from a single case.",
        "2–4 targeted examples is the documented sweet spot — enough to establish a pattern, few enough to avoid token waste. Target them at the specific ambiguous scenarios causing problems.",
        "Diminishing returns; tokens are wasted without proportional improvement.",
        "Filling the context with examples crowds out the actual task and reduces output quality."
      ]
    },
    {
      id: "d4.4-extra-4", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "What is the critical difference between few-shot examples that teach LITERAL PATTERN MATCHING versus examples that teach GENERALISATION?",
      options: [
        "Pattern-matching uses structured data; generalisation uses unstructured text",
        "Pattern-matching examples show input → output pairs only; generalisation examples include the REASONING for why the decision was made, enabling the model to apply the underlying principle to novel cases",
        "Pattern-matching uses 2 examples; generalisation uses 4 or more",
        "Pattern-matching is for extraction; generalisation is for classification"
      ],
      answer: 1,
      rationales: [
        "Data format isn't the lever — reasoning is.",
        "Examples without reasoning teach surface pattern matching (\"order numbers go to lookup_order\"). Examples WITH reasoning teach the general principle (\"specific identifiers route to specific lookup tools\"), enabling generalisation.",
        "The count doesn't determine generalisation; the presence of reasoning does.",
        "Both extraction and classification can benefit from either approach; reasoning vs no-reasoning is the differentiator."
      ]
    },
    {
      id: "d4.4-extra-5", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "Your extraction system produces malformed JSON (missing brackets, trailing commas) in roughly 5% of responses. Which technique should you apply?",
      options: [
        "Add few-shot examples showing correctly formatted JSON output",
        "Use `tool_use` with JSON schemas to eliminate JSON syntax errors entirely",
        "Add a JSON validation step that retries on malformed output",
        "Increase `max_tokens` to ensure space for complete JSON"
      ],
      answer: 1,
      rationales: [
        "Few-shot examples improve consistency but do not eliminate JSON syntax errors. They reduce frequency, not the structural risk.",
        "tool_use with JSON schemas eliminates JSON syntax errors at the API level. This is the reliability hierarchy: tool_use for structure, few-shot for consistency. The right tool for this specific problem.",
        "Retry adds latency and cost. Prevent the error at the API level instead.",
        "Truncation may contribute, but tool_use is the definitive fix for structural correctness."
      ]
    },
    {
      id: "d4.4-extra-6", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "A financial report has expenses in a table on page 1 and in a narrative paragraph on page 3. Without few-shot examples, the model extracts correctly from the table but FABRICATES values from the narrative section. What explains this behaviour?",
      options: [
        "The context window cannot reach page 3",
        "The model lacks training data for financial narrative extraction",
        "Without examples of correct narrative extraction, the model defaults to producing structurally-conformant output, which under schema pressure becomes fabrication rather than honest absence",
        "The model intentionally prioritises tables over narrative"
      ],
      answer: 2,
      rationales: [
        "Page 3 is well within standard context windows.",
        "The model has broad training data; the issue is task-specific guidance, not general capability.",
        "Schema pressure (required fields) plus no demonstration of how to honestly extract from narrative leads the model to fill the fields anyway — fabrication. Examples of correct narrative extraction (including honest null where appropriate) fix this.",
        "The model has no built-in table preference; the failure is from lacking demonstrations of narrative extraction."
      ]
    },
    {
      id: "d4.4-extra-7", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "A team's few-shot examples cover only the happy path. The model handles standard cases consistently but produces erratic outputs on edge cases. What is the fix?",
      options: [
        "Drop the examples and use only detailed prose criteria",
        "Add 1–2 additional examples that demonstrate the specific EDGE CASES (e.g. empty list, null source field, multi-currency value) and the correct handling for each",
        "Increase the number of happy-path examples until they crowd out the edge-case behaviour",
        "Switch to higher temperature so the model explores edge cases more creatively"
      ],
      answer: 1,
      rationales: [
        "Dropping examples for prose reintroduces the interpretation-inconsistency problem few-shot solves.",
        "Edge cases need their own demonstrations. Adding 1–2 examples that show exactly the right behaviour on the failing edge cases is the targeted fix.",
        "More happy-path examples don't teach edge-case behaviour; they reinforce the happy path.",
        "Temperature increases randomness, not edge-case correctness."
      ]
    },
    {
      id: "d4.4-extra-8", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "Which is the correct ordering of refinement techniques to consider when the model is implementing a KNOWN transformation inconsistently across runs?",
      options: [
        "Interview pattern first → then examples → then tests if still failing",
        "Concrete input/output examples first → add edge-case examples as gaps are observed → escalate to test-driven iteration if the case set grows large",
        "Always start with comprehensive test-driven iteration regardless of complexity",
        "Lower temperature → increase max_tokens → then try examples"
      ],
      answer: 1,
      rationales: [
        "Interview pattern is for UNFAMILIAR-DOMAIN problems, not \"known transformation, inconsistent implementation.\"",
        "Examples-first is the documented response for inconsistent-prose-interpretation. Widen the example set as edge cases surface; escalate to TDD when the edge-case matrix is large enough to warrant machine-checkable specs.",
        "Comprehensive TDD upfront is heavier than necessary for simple transformations; examples are faster.",
        "Hyperparameter tweaks don't address ambiguous-input problems."
      ]
    },
    {
      id: "d4.4-extra-9", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "Why is the INTERVIEW PATTERN sometimes preferable to few-shot examples, despite few-shot being the usual first response?",
      options: [
        "Interview pattern is faster than writing examples",
        "Use the interview pattern when you, the developer, are in an UNFAMILIAR DOMAIN and might miss requirements. Few-shot is for inconsistent interpretation of a known transformation; interview pattern is for unknown unknowns",
        "Interview pattern always produces better outputs than few-shot",
        "Interview pattern is project-scoped while few-shot is user-scoped"
      ],
      answer: 1,
      rationales: [
        "Speed isn't the decision criterion.",
        "They solve different problems. Few-shot fixes \"I know the transformation; the model is interpreting it inconsistently.\" Interview pattern fixes \"I'm not sure what I should even be asking for in this domain.\" Match the technique to the problem.",
        "Neither is universally better; it depends on whether interpretation inconsistency or missing requirements is the issue.",
        "Both are interaction-level techniques; scope doesn't apply."
      ]
    },
    {
      id: "d4.4-extra-10", source: "extra",
      domain: "D4", topic: "d4.4", topicTitle: "Few-Shot Prompting",
      question: "A team's few-shot examples are 100 lines each. The prompt is mostly examples by token count, and outputs have started to take on stylistic quirks from the examples. What's wrong?",
      options: [
        "Few-shot is unsuitable for this task; remove all examples",
        "Examples are too long and too numerous. Trim each to the essential decision-relevant fragments, keep 2–4 total, and ensure the examples target the specific ambiguous scenarios — not entire reference solutions",
        "Add more examples to dilute the stylistic influence",
        "Raise the temperature so the model breaks out of the example style"
      ],
      answer: 1,
      rationales: [
        "Few-shot isn't the wrong technique; the implementation is wrong.",
        "Targeted, compact 2–4 examples are the documented pattern. Lengthy reference-solution examples consume tokens AND impose stylistic noise on outputs. Trim to the decision-relevant fragments.",
        "More examples worsens both problems (more tokens, more stylistic noise).",
        "Temperature won't undo too-long examples; trimming them will."
      ]
    },

    // ====================================================================
    // 4.5 — Batch Processing & Prompt Optimisation
    // ====================================================================
    {
      id: "d4.5-extra-1", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "Your manager proposes switching BOTH your blocking pre-merge code-review check AND your overnight technical-debt report to the Message Batches API for 50% cost savings. How should you evaluate this?",
      options: [
        "Switch both with status polling to track completion",
        "Use the Batches API for the overnight technical-debt report only; keep the pre-merge check on the synchronous API",
        "Keep both on the synchronous API to avoid batch result-ordering issues",
        "Switch both with a timeout fallback to the synchronous API if a batch takes too long"
      ],
      answer: 1,
      rationales: [
        "Polling doesn't change the fundamental constraint: the Batches API has no latency SLA and may take up to 24h.",
        "Pre-merge checks are BLOCKING — developers wait for the result. 24h-window batch is unacceptable. The overnight technical-debt report is latency-tolerant; that's an ideal Batches API use case at 50% savings.",
        "Batches API correlates requests via custom_id; ordering isn't the concern. Latency is.",
        "Timeout fallbacks add complexity without solving the right problem. Match each workflow to the appropriate API."
      ]
    },
    {
      id: "d4.5-extra-2", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "You need a weekly code-audit report delivered by Monday 09:00. You want to use the Message Batches API. What is the LATEST you should submit the batch?",
      options: [
        "Sunday 09:00 — exactly 24 hours before the deadline",
        "Sunday 03:00 — 30 hours before, leaving a 6-hour buffer beyond the 24-hour maximum processing window",
        "Monday 06:00 — three hours before, since batches usually complete quickly",
        "Friday 09:00 — 72 hours before, to be safe"
      ],
      answer: 1,
      rationales: [
        "Submitting at exactly 24h before leaves zero buffer; if the batch takes the full window, you hit the deadline with no margin and no recovery path.",
        "Plan for the worst case (full 24h) plus a buffer for issues. 30h gives a reasonable 6h buffer.",
        "\"Usually completes quickly\" is not a guarantee. The Batches API has no latency SLA; designing around best-case timing is unreliable.",
        "Excessively conservative; 6h buffer beyond the 24h ceiling is adequate."
      ]
    },
    {
      id: "d4.5-extra-3", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "A batch of 500 documents completes with 450 successes and 50 failures. What is the correct failure-handling approach?",
      options: [
        "Resubmit the entire batch of 500 for consistency",
        "Identify the 50 failures by `custom_id`, apply targeted modifications (e.g. chunk oversize documents, simplify prompts for unusual structures, add format-specific examples) and resubmit only those 50",
        "Discard the failures and report only the 450 successful extractions",
        "Reduce batch size to 50 and reprocess everything in smaller batches"
      ],
      answer: 1,
      rationales: [
        "Resubmitting 500 wastes cost on the 450 already-successful items.",
        "`custom_id` correlation lets you isolate failures. Apply targeted modifications based on the failure mode and resubmit only the failed subset.",
        "Discarding 10% reduces completeness; most failures are fixable with targeted retry.",
        "Batch size isn't the issue — failure-specific modifications are. Splitting everything into smaller batches doesn't address why the 50 failed."
      ]
    },
    {
      id: "d4.5-extra-4", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "Your extraction workflow needs Claude to call a tool mid-request, use the tool result, and continue processing within the SAME request. Which API supports this?",
      options: [
        "Message Batches API with tool definitions included",
        "Synchronous Messages API — the Batches API does not support multi-turn tool calling within a single batch request",
        "Message Batches API with webhooks to handle tool calls asynchronously",
        "Either API; tool calling works the same in both"
      ],
      answer: 1,
      rationales: [
        "Tool definitions can be passed to a batch request, but multi-turn tool calling within a single batch request is not supported.",
        "Multi-turn tool calling — where the model calls a tool, uses the result, and continues in the same request — requires the synchronous Messages API. The Batches API does not support this within a single batch item.",
        "Webhooks do not inject tool results back into an in-progress batch request.",
        "Tool-calling semantics differ between the APIs. Batches lacks multi-turn tool calling within a single request."
      ]
    },
    {
      id: "d4.5-extra-5", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "Before submitting a batch of 1,000 documents, a colleague suggests testing prompts on a 5-document representative sample first. Why is this the correct approach?",
      options: [
        "To verify API connectivity and authentication before a large submission",
        "To refine prompts and maximise first-pass success rate, dramatically reducing resubmission cost",
        "To estimate processing time so you can plan the submission schedule",
        "To verify the model supports the document format before committing to full processing"
      ],
      answer: 1,
      rationales: [
        "Connectivity testing is an operational check, not the primary purpose of sample testing.",
        "Prompt refinement on a representative sample maximises first-pass success. A 90% success rate means 100 retries on 1,000 documents; 60% means 400 — four times the resubmission cost. Sample testing is the lever.",
        "The Batches API has no latency SLA; sample timings don't generalise reliably.",
        "Format support is a secondary check. The primary benefit is prompt quality improvement before large-scale submission."
      ]
    },
    {
      id: "d4.5-extra-6", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "Which of the following is NOT a valid Batches API use case?",
      options: [
        "Nightly generation of test cases from code documentation",
        "Weekly audit summary of code-review findings",
        "Pre-merge check that must complete before a developer can merge a pull request",
        "Overnight extraction of financial data from 2,000 invoices"
      ],
      answer: 2,
      rationales: [
        "Nightly test generation is latency-tolerant; results consumed next business day. Valid.",
        "Weekly audits have no real-time dependency. Valid.",
        "Pre-merge checks are BLOCKING — developers wait. The 24h batch window is unacceptable for blocking workflows. Use the synchronous API.",
        "Overnight extraction consumed the next morning is exactly the kind of workload the Batches API is designed for."
      ]
    },
    {
      id: "d4.5-extra-7", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "Your batch result file is large. To process failures cleanly, what should you rely on?",
      options: [
        "The order of items in the response — they match the order of the original requests",
        "The `custom_id` field on each result, which correlates back to the matching field on each request",
        "A SHA hash of the input prompt",
        "Timestamps embedded in each result"
      ],
      answer: 1,
      rationales: [
        "Order is not a reliable correlation key in the Batches API.",
        "`custom_id` is the designed correlation mechanism: set it on each request, read it on each result. This is what lets you identify and re-target failures.",
        "Prompt hashes are fragile (any whitespace change breaks them) and not the designed mechanism.",
        "Timestamps don't uniquely identify items, especially in large batches."
      ]
    },
    {
      id: "d4.5-extra-8", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "A team's daily batch was running well at ~12-hour completion. After scaling up the document count by 5x, completion times have crept up against the 24h ceiling and occasionally fail to deliver by morning. What is the appropriate response?",
      options: [
        "Increase the batch size further to amortise overhead",
        "Split the workload into multiple smaller batches submitted at staggered times, or move the workload to off-peak windows — the 24h ceiling is a hard limit, not a target",
        "Switch to the synchronous API for everything",
        "Pad the batch with no-op requests to reduce average processing time"
      ],
      answer: 1,
      rationales: [
        "Larger batches don't help — the 24h window is a per-batch ceiling.",
        "Multiple smaller batches and / or scheduling further from the deadline gives you buffer. Treat the 24h ceiling as a hard limit and plan around it.",
        "Moving high-volume workloads to synchronous loses the 50% cost benefit and is unnecessary if the work is genuinely latency-tolerant; better scheduling is the right lever.",
        "Padding does nothing to reduce real processing time."
      ]
    },
    {
      id: "d4.5-extra-9", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "Which prompt-optimisation step has the LARGEST effect on total Batches API cost?",
      options: [
        "Reducing every prompt by 5% in word count",
        "Maximising first-pass success rate via prompt refinement on a representative sample BEFORE the large batch — retries multiply cost dramatically",
        "Lowering temperature to 0",
        "Using `tool_choice: \"any\"` instead of `\"auto\"`"
      ],
      answer: 1,
      rationales: [
        "A 5% word reduction is a minor improvement compared to the resubmission cost of failure retries.",
        "First-pass success is the dominant cost driver. Improving it from 60% to 90% means 100 retries instead of 400 on a 1,000-document batch — a 4x retry-cost reduction, much larger than any per-prompt token reduction.",
        "Temperature affects randomness, not cost directly, and isn't a cost lever.",
        "tool_choice mode affects structural reliability, not batch cost per se."
      ]
    },
    {
      id: "d4.5-extra-10", source: "extra",
      domain: "D4", topic: "d4.5", topicTitle: "Batch Processing & Prompt Optimisation",
      question: "When ALL of these are true — workload is latency-tolerant, requests are independent, you want ~50% cost savings, and you don't need multi-turn tool calling — which API is the best fit?",
      options: [
        "Synchronous Messages API",
        "Message Batches API",
        "Streaming Messages API",
        "It doesn't matter; performance is identical"
      ],
      answer: 1,
      rationales: [
        "Synchronous gives no cost benefit; for latency-tolerant independent work it's overkill.",
        "Latency-tolerant + independent + 50%-cost-saving + no multi-turn tool calling = the textbook Batches API profile.",
        "Streaming is for low-latency token-by-token delivery, the opposite of latency-tolerant.",
        "They are not equivalent; cost and latency characteristics differ substantially."
      ]
    },

    // ====================================================================
    // 4.6 — Multi-Instance Review and Output Validation
    // ====================================================================
    {
      id: "d4.6-extra-1", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "A pull request modifying 14 files receives inconsistent review: detailed feedback on some files, superficial comments on others, obvious bugs missed in the middle, and CONTRADICTORY findings (the same pattern flagged in one file but approved in another). How should you restructure?",
      options: [
        "Switch to a higher-tier model with a larger context window to handle all 14 files in one pass",
        "Run three independent passes on the full PR and only flag issues found in at least two of three runs",
        "Split into PER-FILE local analysis passes for consistent depth, plus a separate cross-file integration pass for data-flow issues and contradictions",
        "Require developers to split large PRs into smaller submissions of 3–4 files"
      ],
      answer: 2,
      rationales: [
        "Larger context windows do not solve ATTENTION-QUALITY issues. The model can hold more text but still allocate uneven attention across many items.",
        "Majority voting suppresses real but intermittently-detected bugs and doesn't address why depth varies across files.",
        "Per-file analysis gives each file consistent attention; the cross-file integration pass catches contradictions and data-flow issues no single-file review identifies. This is the documented multi-pass architecture.",
        "Shifting burden to developers doesn't fix the review system itself."
      ]
    },
    {
      id: "d4.6-extra-2", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "Why is SELF-REVIEW (asking the same session to review its own output) less effective than INDEPENDENT REVIEW?",
      options: [
        "The model forgets earlier output and can't compare it accurately",
        "Self-review uses more tokens, which reduces output quality",
        "The model retains its REASONING CONTEXT from generation and tends to confirm — rather than challenge — its own decisions. An independent instance approaches the artefact fresh, without that bias",
        "Self-review is slower because the model re-processes the conversation history"
      ],
      answer: 2,
      rationales: [
        "The model doesn't forget — retention is precisely the problem.",
        "Token usage isn't the issue; bias is.",
        "Same-session review carries forward the rationalisations that supported the original decision. An independent invocation arrives with no such anchor and is more likely to challenge.",
        "Speed isn't the differentiator; review QUALITY is."
      ]
    },
    {
      id: "d4.6-extra-3", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "Your multi-pass review runs per-file analysis on each of 10 files. What should the CROSS-FILE INTEGRATION pass check for?",
      options: [
        "Grammar and spelling consistency across file comments",
        "Data-flow inconsistencies between modules, contradictory findings across files, and API-contract violations that cross file boundaries",
        "Whether each file compiles independently",
        "Total line count and code-complexity metrics across the PR"
      ],
      answer: 1,
      rationales: [
        "Grammar isn't the integration concern.",
        "The integration pass catches systemic issues no single-file pass can see: cross-module data-flow problems, contradictions in per-file findings, and API-contract violations between files. This is its specific purpose.",
        "Compilation is a build concern, not a review concern.",
        "Metrics collection is separate from review quality; the integration pass is about cross-file logical issues."
      ]
    },
    {
      id: "d4.6-extra-4", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "Your review system adds self-reported confidence scores. A finding with confidence 0.92 is later shown to be incorrect via independent verification. What does this indicate?",
      options: [
        "The model is defective and should be replaced",
        "Raw self-reported confidence is poorly calibrated. Before relying on confidence for automated routing, calibrate it against labelled validation sets so thresholds correspond to actual accuracy",
        "Confidence > 0.90 should always be auto-accepted; the verifier is wrong",
        "Independent verification is unreliable; trust the self-reported confidence"
      ],
      answer: 1,
      rationales: [
        "Poor calibration is a known characteristic of self-reported confidence, not a defect.",
        "Calibration with labelled data reveals the actual confidence-vs-accuracy relationship. Until calibrated, raw confidence numbers should not drive automated routing of findings.",
        "This question is precisely an instance where 0.92 confidence was wrong; auto-acceptance would have admitted the error.",
        "Independent verification is exactly the mechanism that surfaces calibration problems; trusting raw confidence over verification is the wrong direction."
      ]
    },
    {
      id: "d4.6-extra-5", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "How should you calibrate confidence thresholds for routing findings to human review?",
      options: [
        "Set the threshold at 0.5 as a balanced midpoint",
        "Ask the model to self-calibrate by reporting its own historical accuracy",
        "Run labelled validation sets (where the truth is known) through the system, measure the actual relationship between reported confidence and correctness, and set thresholds where the empirical accuracy crosses your acceptance criterion",
        "Gradually lower the threshold until no findings reach human review"
      ],
      answer: 2,
      rationales: [
        "An arbitrary midpoint has no empirical basis; confidence-vs-accuracy varies by task.",
        "The model's self-assessment of its accuracy inherits the same calibration problem.",
        "Labelled validation data provides ground truth. Empirically measured calibration is the only reliable basis for threshold routing.",
        "Eliminating human review removes the safety net for uncertain findings."
      ]
    },
    {
      id: "d4.6-extra-6", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "A production review architecture combines generation, per-file review, cross-file integration review, confidence routing, and calibration. It is significantly more expensive than single-pass review. WHEN is the cost justified?",
      options: [
        "Always — quality should never be compromised",
        "When review quality directly affects production reliability: CI/CD pipelines, financial extraction, compliance analysis, security review — anywhere missed issues have real downstream consequences",
        "Only for codebases larger than 100 files",
        "Only when using the Batches API to offset multi-pass cost with 50% savings"
      ],
      answer: 1,
      rationales: [
        "Cost-quality trade-offs are necessary; not every review warrants multi-pass.",
        "Multi-pass cost is justified when missed issues have real downstream consequences. For a typo PR, single-pass is fine; for a payments pipeline, multi-pass.",
        "Codebase size isn't the right axis; a 5-file PR in a payments system may warrant multi-pass.",
        "The Batches API addresses cost timing, not whether multi-pass is the right depth for the task."
      ]
    },
    {
      id: "d4.6-extra-7", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "What is the difference between SAME-SESSION self-review and SHARED-CONTEXT review across multiple passes?",
      options: [
        "They are the same thing under two names",
        "Same-session self-review reuses the entire reasoning context from generation (biased confirmation likely). Shared-context multi-pass review can use multiple independent invocations that each receive only the artefact (and possibly prior findings as context) — no carried-over reasoning. The reviewer arrives fresh",
        "Same-session is faster and equally effective",
        "Shared-context review is always cheaper than same-session"
      ],
      answer: 1,
      rationales: [
        "They are not the same — bias profiles differ substantially.",
        "Same-session reviewers inherit reasoning context; independent invocations don't. The architectural choice is to deliberately strip the reasoning context (separate invocations) to remove the confirmation bias.",
        "Same-session is biased; speed isn't the issue.",
        "Multi-pass typically costs MORE than same-session because of repeated invocations; the justification is quality, not cost."
      ]
    },
    {
      id: "d4.6-extra-8", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "A team adds a generation pass and a separate independent-review pass for security findings. Per-file review still occasionally produces inconsistent severity calls. Adding a cross-file integration pass surfaces a new class of contradictions across files (\"this pattern was Critical on auth.ts but approved on session.ts\"). What's the appropriate next move?",
      options: [
        "Drop the cross-file integration pass; per-file review is enough",
        "Use the contradictions surfaced by the cross-file pass as INPUT to refine the per-file severity criteria and add representative code examples — close the loop between detection and criteria improvement",
        "Add a fourth pass that votes on each contradiction",
        "Treat the contradictions as noise and ignore them"
      ],
      answer: 1,
      rationales: [
        "Dropping the integration pass throws away the very signal that's helping you find the inconsistency.",
        "Contradictions are valuable signal: each is a calibration failure point. Feed them back into criteria refinement (often with per-severity code examples) so future per-file reviews are more consistent.",
        "A voting pass adds latency and cost without improving criteria. The criteria themselves are what need refinement.",
        "These contradictions are diagnostic of criteria gaps. Ignoring them lets inconsistency persist."
      ]
    },
    {
      id: "d4.6-extra-9", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "Which of these is a documented PURPOSE of multi-pass review architecture?",
      options: [
        "Reducing API cost",
        "Increasing model speed",
        "Producing CONSISTENT DEPTH across many items (per-file passes) and catching CROSS-ITEM issues (integration pass) that no single-pass review reliably finds",
        "Eliminating the need for human reviewers"
      ],
      answer: 2,
      rationales: [
        "Multi-pass review typically COSTS MORE than single-pass; cost reduction isn't the purpose.",
        "Speed is not the purpose; quality is.",
        "Multi-pass exists to ensure each item gets focused attention (per-file) and that cross-item issues (data flow, contradictions, contract violations) are detected (integration). These are exactly the gaps single-pass review leaves.",
        "Multi-pass complements human review (especially via confidence-calibrated routing); it doesn't eliminate it."
      ]
    },
    {
      id: "d4.6-extra-10", source: "extra",
      domain: "D4", topic: "d4.6", topicTitle: "Multi-Instance Review & Output Validation",
      question: "A team's review pipeline routes any finding with confidence < 0.70 to human review. After calibration on a labelled set, they discover that 0.70 corresponds to ~84% actual accuracy. What do they do?",
      options: [
        "Lower the threshold to 0.50 to reduce human review load",
        "Adjust the threshold up or down based on the BUSINESS acceptance criterion — if the business needs ≥95% accuracy, raise the threshold (route more findings to humans); if 80% is acceptable, lower it. The right threshold is whatever maps to the business's accuracy bar",
        "Keep the threshold at 0.70 since it is a round number",
        "Add a second confidence model to reconcile differences"
      ],
      answer: 1,
      rationales: [
        "Threshold choice should be driven by accuracy targets, not by review-load convenience.",
        "Calibration data gives you the confidence-vs-accuracy mapping; the threshold is then a business decision about what accuracy level is acceptable for automated reporting. Set the threshold where the calibrated accuracy matches the business bar.",
        "Round numbers have no special status; calibrated thresholds do.",
        "A second model adds complexity without addressing the underlying calibration-vs-business-target question."
      ]
    }
  ];

  window.EXAM_BANK.D4 = D4;
})();
