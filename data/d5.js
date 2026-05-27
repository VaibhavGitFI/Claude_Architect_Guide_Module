/*
 * Domain 5 — Context Management & Reliability  (~15% of exam)
 * Source: claudecertificationguide.com  (sections 5.1–5.6)
 *
 * Additively populates the shared globals for Domain 5 only:
 *   window.DOMAIN_DEEPDIVE.D5   — the "Domains" deep-dive view
 *   window.STUDY_CONTENT.D5     — the "Study Guide" view
 *   window.QUESTIONS (+= D5)    — the "Domain Quiz" / "Mock Exam" banks
 *   window.FLASHCARDS (+= D5)   — the "Flashcards" view
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
  // DEEP DIVE  — window.DOMAIN_DEEPDIVE.D5
  // ==========================================================================
  window.DOMAIN_DEEPDIVE.D5 = {
    number: 5,
    weight: "~15%",
    title: "Context Management & Reliability",
    tagline: "Keeping critical facts alive in context, escalating wisely, propagating errors honestly, and preserving provenance through synthesis.",
    why: "This domain is about what makes a system **trustworthy in production**: don't let summarisation eat transactional facts; escalate on the *three valid triggers* (not sentiment or self-confidence); propagate **structured** errors instead of suppressing or crashing; treat **context degradation** as an attention problem (not a token-count one); never trust **aggregate accuracy**; and keep **claim→source provenance** alive through every synthesis step.",

    sections: [
      // ---- 5.1 Context Window Management --------------------------------
      {
        heading: "5.1 — Context Window Management",
        body: [
          { type: "p", text: "Reliable multi-turn systems live or die by what goes into the context window. The **progressive summarisation trap**: summarising earlier turns to free tokens systematically destroys the most critical information — numerical values, dates, percentages, order numbers, customer-stated expectations. \"Refund of $247.83 for order #8891 placed March 3rd\" becomes \"customer wants a refund for a recent order.\"" },
          { type: "callout", kind: "key", text: "The **persistent case facts block** is the single most important pattern here: extract transactional facts (amounts, dates, order numbers, statuses) into a structured block included in **every** prompt, **outside** the summarised history — it is never summarised. This is the fix for progressive summarisation and the foundation for reliable multi-turn systems." },
          { type: "code", lang: "json", body: "{\n  \"caseFactsBlock\": {\n    \"customerId\": \"C-4421\",\n    \"issues\": [{\n      \"orderId\": \"#8891\",\n      \"orderDate\": \"2024-03-03\",\n      \"refundAmount\": \"$247.83\",\n      \"status\": \"pending_refund\"\n    }]\n  }\n}" },
          { type: "p", text: "**Lost in the middle**: models process the beginning and end of long inputs reliably but may miss findings buried in the middle. The fix is **structural, not prompt-based** — place a *Key Findings Summary* at the **start** of aggregated inputs and use explicit section headers throughout. Telling the model to \"pay attention to everything\" doesn't work." },
          { type: "callout", kind: "warn", text: "**Tool-result trimming**: an order lookup returning 40+ fields when you need 5 burns tokens every subsequent turn as history grows. Trim verbose tool outputs to relevant fields **before** they enter the conversation (in a PostToolUse hook or the tool itself) — once verbose data is in context, it stays for every turn. The API is **stateless** (each request must include full history), so trimming + the case-facts block beat truncating the history." },
          { type: "p", text: "**Upstream agent optimisation**: have upstream agents return **structured data** (key facts, citations, relevance scores, dates) instead of verbose reasoning chains a downstream agent can't use — saving tokens *and* enabling synthesis without re-parsing prose." }
        ]
      },

      // ---- 5.2 Escalation & Ambiguity Resolution ------------------------
      {
        heading: "5.2 — Escalation & Ambiguity Resolution",
        body: [
          { type: "p", text: "Miscalibrated escalation directly destroys first-contact resolution. There are exactly **three valid escalation triggers**:" },
          { type: "bullets", items: [
            "**Customer explicitly requests a human** — honour it *immediately*, no \"let me try first.\" An absolute rule with no exceptions.",
            "**Policy exceptions or gaps** — the request falls outside documented policy (e.g. competitor price-matching when policy covers only own-site). Gaps need human judgement. (A *violation* with a documented answer, like a refund outside the return window, does NOT need escalation.)",
            "**Inability to make meaningful progress** — the agent actually attempted resolution and cannot advance (tool errors local retries can't fix, missing access, a bug needing engineering). \"I might not handle this\" is not enough — it must have tried."
          ] },
          { type: "callout", kind: "warn", text: "**Two unreliable triggers** the exam tests as anti-patterns: **sentiment-based escalation** (frustration doesn't correlate with complexity — a furious customer with a late delivery is easy; a calm customer with a policy gap needs a human) and **self-reported confidence scores** (poorly calibrated — confident on hard cases, uncertain on easy ones)." },
          { type: "p", text: "**The frustration nuance**: a frustrated customer with a *resolvable* issue → acknowledge and resolve (don't escalate). If they *reiterate* wanting a human after you offer help → escalate. If they ask for a human *from the start* → escalate immediately, no investigation." },
          { type: "callout", kind: "key", text: "Three valid triggers (explicit human request, policy *gaps*, inability to progress); two unreliable ones (sentiment, self-confidence). For **ambiguous customer matches**, never pick by 'most recent'/'most active' heuristic — that risks privacy violations and wrong-account actions; the only safe response is to **ask for additional identifiers** (email, phone, order number)." },
          { type: "p", text: "The proportionate fix for poor escalation calibration is **explicit escalation criteria with few-shot examples in the system prompt** — prompt optimisation before infrastructure like classifier models or sentiment analysis." }
        ]
      },

      // ---- 5.3 Error Propagation in Multi-Agent Systems -----------------
      {
        heading: "5.3 — Error Propagation in Multi-Agent Systems",
        body: [
          { type: "p", text: "How a subagent's failure flows back to the coordinator decides whether the system recovers or fails silently. A failing subagent must return **structured error context** with four elements: **failure type** (transient/validation/business/permission), **what was attempted** (tool, query, parameters), **partial results** gathered before failure, and **potential alternative approaches**." },
          { type: "code", lang: "json", body: "{\n  \"status\": \"partial_failure\",\n  \"failureType\": \"transient\",\n  \"attemptedAction\": { \"tool\": \"search_academic_db\", \"query\": \"renewable energy policy\" },\n  \"partialResults\": [{ \"title\": \"EU Renewable Energy Directive 2023\", \"retrieved\": true }],\n  \"alternativeApproaches\": [\"Narrow the date range\", \"Try government_publications\", \"Use cached results\"]\n}" },
          { type: "callout", kind: "warn", text: "**Two anti-patterns**: **silent suppression** — returning empty results marked as success (the worst: the coordinator thinks the search ran and found nothing, never retries, and silently omits a whole research area — invisible gaps); and **workflow termination** — killing the entire pipeline on one failure, throwing away the other agents' completed work. The correct middle ground is structured error propagation." },
          { type: "callout", kind: "key", text: "Structured error context (failure type, attempted action, partial results, alternatives) enables intelligent coordinator recovery. **Access failure** (couldn't reach the source — timeout/connection/permission; query didn't execute) → consider retry. **Valid empty result** (query executed, no matches) → that IS the answer, don't retry. Conflating them means either never retrying when you should, or wasting retries on a query that always returns nothing." },
          { type: "p", text: "**Coverage annotations**: when synthesising, note which topics are well-supported and which have gaps (\"geothermal section limited due to unavailable journal access\") — far better than silently omitting a topic, which looks like irrelevance rather than an unavailable source. **Local recovery first**: subagents retry transient failures locally (with fallbacks) and only propagate what they can't resolve, always including what was attempted and any partial results — this keeps coordinator complexity down." }
        ]
      },

      // ---- 5.4 Codebase Exploration & Context Degradation ---------------
      {
        heading: "5.4 — Codebase Exploration & Context Degradation",
        body: [
          { type: "p", text: "**Context degradation** shows up as the model referencing *\"typical patterns\"* instead of the specific classes, methods, and dependency chains it discovered earlier — because verbose discovery output accumulates and pushes precise earlier findings out of attention." },
          { type: "callout", kind: "key", text: "Context degradation is **NOT a token-limit problem** — a bigger context window doesn't fix it; the model loses grip on specific details as verbose output buries them. The primary mitigation is **scratchpad files**: write key findings to a file and read it for subsequent questions, persisting knowledge *outside* the conversation context where it's immune to degradation. Maintain them from the start of any extended exploration, not as a fallback." },
          { type: "p", text: "**Subagent delegation** is the second mitigation — and it's about **context isolation**, not just parallelisation. Delegate specific questions (\"find all test files for the order service and report coverage\") to subagents that explore verbosely in their own isolated context and return a structured summary, keeping the main agent's context clean for coordination." },
          { type: "p", text: "**Summary injection between phases**: summarise Phase 1 findings and inject them into Phase 2 subagent prompts, preventing the cold-start problem where Phase 2 re-explores what Phase 1 already found. The **`/compact`** command reduces context usage during long sessions — use it **proactively** to maintain context *quality*, not just when you hit limits." },
          { type: "callout", kind: "warn", text: "**Crash recovery via structured state manifests**: each agent exports its state (explored paths, key findings, current phase, next steps) to a known file. On resume, the coordinator loads the manifest and injects it so the agent continues without repeating work. Restarting a session to fix degradation **without** saving state loses all accumulated knowledge." }
        ]
      },

      // ---- 5.5 Human Review & Confidence Calibration --------------------
      {
        heading: "5.5 — Human Review & Confidence Calibration",
        body: [
          { type: "p", text: "Human review is the safety net; the challenge is allocating limited reviewer capacity to maximise accuracy at minimum cost. The biggest misconception is the **aggregate metrics trap**: a system reports 97% overall accuracy, so the team automates all high-confidence extractions — but the aggregate **hides catastrophic per-segment failure** (standard invoices 99.5%, handwritten receipts 60%, scanned PDFs 72%, international formats 45%). High-volume easy segments mask the rest." },
          { type: "callout", kind: "key", text: "97% aggregate accuracy can hide 40%+ error rates on specific document types. **Always validate accuracy by document type AND field segment** before automating — never on aggregate metrics alone. Raw model confidence is **not calibrated**: 0.90 on dates might be 94% accurate but 0.90 on amounts only 82% — calibrate against **labelled validation sets** before using confidence to route." },
          { type: "p", text: "**Stratified random sampling**: sample a representative set from each stratum (document type, confidence band, field) for human verification — and crucially **sample high-confidence extractions too**, not just low-confidence ones. Low-confidence items already go to humans; only sampling high-confidence automated items catches a *novel* error pattern affecting them. It serves ongoing accuracy measurement *and* novel-error detection." },
          { type: "callout", kind: "warn", text: "**Reviewer capacity prioritisation**: route the **highest-uncertainty items first** (low confidence, ambiguous/contradictory sources, historically poor document types), and order the queue **dynamically**. Do NOT spread reviewer capacity evenly — that wastes time on items the model handles well and starves the uncertain ones that actually need human judgement." },
          { type: "p", text: "The correct sequence: (1) measure accuracy by document type and field, (2) calibrate confidence with labelled sets, (3) set calibrated thresholds, (4) add stratified sampling for ongoing verification, and **only then** (5) reduce human review on segments with consistent, validated accuracy. Jumping to step 5 on aggregate metrics is the trap." }
        ]
      },

      // ---- 5.6 Information Provenance & Multi-Source Synthesis ----------
      {
        heading: "5.6 — Information Provenance & Multi-Source Synthesis",
        body: [
          { type: "p", text: "Provenance — knowing where every claim comes from and how much to trust it — separates a trustworthy research system from plausible fiction. Every finding must carry a **structured claim-source mapping**: claim, source URL, document name, relevant excerpt, and publication date." },
          { type: "code", lang: "json", body: "{\n  \"claim\": \"Global renewable energy investment reached $495 billion in 2023\",\n  \"sourceUrl\": \"https://example.com/iea-report-2024\",\n  \"documentName\": \"IEA World Energy Investment Report 2024\",\n  \"relevantExcerpt\": \"...reached approximately $495 billion in calendar year 2023...\",\n  \"publicationDate\": \"2024-06-15\"\n}" },
          { type: "callout", kind: "warn", text: "**Attribution dies during summarisation** — a synthesis agent paraphrases findings into \"investment has grown significantly\" with no amount, source, or date unless explicitly instructed to preserve and merge claim-source mappings through every step. The most common failure point is the synthesis step." },
          { type: "callout", kind: "key", text: "When two credible sources **conflict**, never arbitrarily pick one (not 'most recent', not an average, not 'most authoritative') — **annotate both values with full attribution and dates** and let the consumer decide. And **temporal awareness**: different publication/data-collection dates often explain different numbers — 8% (2023) and 12% (2024) is a *trend*, not a contradiction. Require dates in all structured outputs." },
          { type: "p", text: "**Content-appropriate rendering**: don't flatten everything into one format — **financial data → tables**, **news/current events → prose**, **technical findings → structured lists**. Reports should distinguish well-established findings (multiple independent sources) from contested ones, preserving source characterisations. When analysis hits conflicting values, **complete the analysis with the conflict intact and annotated** (e.g. audited vs preliminary, fiscal vs calendar year) and leave resolution to the coordinator or consumer." }
        ]
      }
    ],

    examFocus: [
      "Persistent case facts block (never summarised) as the fix for progressive summarisation destroying transactional data.",
      "Lost-in-the-middle: structural fix (key findings first, section headers), not a prompt reminder. Trim verbose tool results.",
      "Three valid escalation triggers (explicit human request, policy gaps, inability to progress) vs two unreliable (sentiment, self-confidence).",
      "Ambiguous customer matches: ask for identifiers, never select by heuristic (privacy risk).",
      "Structured error context (type, attempted action, partial results, alternatives); avoid silent suppression and workflow termination.",
      "Access failure (retry) vs valid empty result (don't retry); local recovery first; coverage annotations.",
      "Context degradation is attention, not tokens — scratchpad files, subagent isolation, /compact, state manifests for crash recovery.",
      "Aggregate metrics trap: validate by document type AND field; calibrate confidence with labelled sets; sample high-confidence items too.",
      "Reviewer capacity: prioritise highest-uncertainty items dynamically, not evenly.",
      "Claim-source provenance survives synthesis only if explicitly preserved; annotate conflicts with both values + dates; content-appropriate rendering."
    ],

    quickRef: [
      "Progressive summarisation destroys amounts/dates/IDs → persistent case facts block, included every prompt, never summarised.",
      "Lost in the middle → key findings at the START + section headers (structural, not 'pay attention').",
      "Trim 40-field tool results to the ~5 you need BEFORE they enter context (PostToolUse hook). API is stateless.",
      "Escalate on: explicit human request (now), policy GAP (not violation), inability to progress (after trying).",
      "Don't escalate on sentiment or self-reported confidence. Ambiguous match → ask for identifiers, never heuristic-pick.",
      "Structured error = failureType + attemptedAction + partialResults + alternativeApproaches.",
      "Anti-patterns: silent suppression (empty=success) and workflow termination (kill on one failure).",
      "Access failure → consider retry; valid empty result → don't retry (that IS the answer).",
      "Context degradation ≠ token limit. Scratchpad files, subagent context isolation, /compact (proactive), state manifests.",
      "97% aggregate hides per-type failure → validate by document type AND field; calibrate confidence with labelled sets.",
      "Stratified sampling includes HIGH-confidence items; route highest-uncertainty items to reviewers first, dynamically.",
      "Provenance: claim + sourceUrl + documentName + excerpt + date. Conflicts → annotate both + dates. Tables/prose/lists per content type."
    ]
  };

  // ==========================================================================
  // STUDY GUIDE  — window.STUDY_CONTENT.D5
  // ==========================================================================
  window.STUDY_CONTENT.D5 = {
    title: "Domain 5 — Context Management & Reliability",
    weight: "~15%",
    summary: "Protecting critical facts from summarisation, calibrating escalation, propagating errors as structured context, surviving context degradation in long sessions, calibrating confidence and human review, and preserving claim-source provenance through synthesis.",
    examTips: [
      "Summarisation eats amounts/dates/IDs — protect them in a <strong>persistent case facts block</strong> that's never summarised.",
      "Escalate only on the <strong>three valid triggers</strong>; <strong>sentiment</strong> and <strong>self-reported confidence</strong> are unreliable.",
      "Subagent failure? Return <strong>structured error context</strong>; never silently suppress or kill the whole pipeline.",
      "<strong>Context degradation is an attention problem, not a token-limit one</strong> — scratchpad files, not a bigger window.",
      "<strong>Never trust aggregate accuracy</strong> — validate by document type AND field, and calibrate confidence with labelled sets.",
      "Keep <strong>claim→source provenance</strong> through synthesis; annotate conflicting sources with both values and dates."
    ],
    topics: [
      {
        id: "d5.1",
        title: "Context Window Management",
        intro: "The persistent case facts block protects transactional data from the progressive summarisation trap.",
        concepts: [
          "Progressive summarisation systematically destroys numerical values, dates, percentages, IDs, and customer-stated expectations.",
          "The persistent case facts block holds transactional facts in a structured block included in every prompt, outside (never) summarised history.",
          "Lost-in-the-middle: models reliably process the start and end of long inputs; the fix is structural — key findings first + section headers.",
          "Trim verbose tool results (40+ fields -> the ~5 needed) before they enter context, in a PostToolUse hook or the tool itself.",
          "The Claude API is stateless: each request must include the full conversation history; use case-facts + summarisation, not truncation."
        ],
        antiPatterns: [
          "Believing progressive summarisation is safe for transactional data.",
          "Trying to fix lost-in-the-middle by telling the model to 'pay attention to everything'.",
          "Keeping full tool results in context 'in case the model needs them later'.",
          "Selectively truncating conversation history (breaks coherence on a stateless API)."
        ],
        deepDive: [
          "Multi-issue support scenario: after several summarised turns the agent says 'your recent refund request' instead of '$247.83 for order #8891'. The fix is a persistent case facts block holding amounts/dates/order numbers, included in every prompt outside summarised history — not a bigger context window, not 'preserve numbers during summarisation' (still unreliable), not an external DB retrieval.",
          "Upstream agent optimisation: have upstream agents return structured data (key facts, citations, relevance scores, dates) instead of verbose reasoning chains, so a downstream synthesis agent with a limited budget isn't wasting tokens on reasoning it can't use."
        ],
        code: {
          title: "Persistent case facts block",
          body: "{\n  \"caseFactsBlock\": {\n    \"customerId\": \"C-4421\",\n    \"issues\": [{ \"orderId\": \"#8891\", \"orderDate\": \"2024-03-03\",\n                 \"refundAmount\": \"$247.83\", \"status\": \"pending_refund\" }]\n  }\n}  // included every prompt, never summarised"
        },
        compare: {
          bad: "Summarise earlier turns to save tokens (loses $247.83, #8891, March 3rd)",
          good: "Persistent case facts block carries transactional facts outside summarised history"
        },
        examTip: "Agent forgets a specific amount/order after summarisation → persistent case facts block (never summarised). Lost-in-the-middle → key findings first (structural)."
      },
      {
        id: "d5.2",
        title: "Escalation & Ambiguity Resolution",
        intro: "Three valid escalation triggers, two unreliable ones, and safe handling of ambiguous customer matches.",
        concepts: [
          "Valid trigger 1: customer explicitly requests a human — escalate immediately, no 'let me try first' (absolute rule).",
          "Valid trigger 2: policy exceptions/gaps (policy is silent) — distinct from violations (documented answer, no escalation).",
          "Valid trigger 3: inability to make meaningful progress — after the agent actually attempted resolution.",
          "Unreliable triggers: sentiment-based escalation (frustration != complexity) and self-reported confidence (poorly calibrated).",
          "Ambiguous customer matches: ask for additional identifiers; never select by most-recent/most-active heuristic."
        ],
        antiPatterns: [
          "Escalating on negative sentiment / frustration scores.",
          "Escalating when self-reported confidence drops below a threshold.",
          "Attempting to resolve before honouring an explicit human request.",
          "Selecting from ambiguous matches by heuristic (privacy violations, wrong-account actions)."
        ],
        deepDive: [
          "55% first-contact resolution scenario: the agent escalates straightforward damage replacements but autonomously attempts complex policy exceptions. The fix is explicit escalation criteria with few-shot examples in the system prompt (prompt optimisation before infrastructure) — not sentiment analysis, not self-reported confidence routing, not a separate classifier model as the first step.",
          "Frustration nuance: frustrated + resolvable -> acknowledge and resolve; reiterates wanting a human after an offer -> escalate; explicitly asks for a human from the start -> escalate immediately with no investigation."
        ],
        code: {
          title: "Explicit escalation criteria (system prompt sketch)",
          body: "Escalate ONLY when: (1) the customer explicitly asks for a human;\n  (2) the request falls outside documented policy (a gap);\n  (3) you attempted resolution and cannot progress.\nDo NOT escalate on frustration alone or a self-rated confidence score.\nMultiple customer matches -> ask for email/phone/order number."
        },
        compare: {
          bad: "Escalate when sentiment is negative or self-confidence < threshold",
          good: "Escalate on explicit human request / policy gap / inability to progress; few-shot examples in the prompt"
        },
        examTip: "Three valid triggers, two unreliable (sentiment, self-confidence). Explicit human request = escalate now. Ambiguous match = ask for identifiers, never heuristic-pick."
      },
      {
        id: "d5.3",
        title: "Error Propagation in Multi-Agent Systems",
        intro: "Structured error context enables recovery; access failures and valid empty results are not the same.",
        concepts: [
          "Structured error context has four elements: failure type, what was attempted, partial results, and alternative approaches.",
          "Failure types: transient (retry), validation (fix input), business (escalate/alternative), permission (authorisation change).",
          "Silent suppression (empty results marked success) is the worst anti-pattern — the coordinator never retries and silently omits content.",
          "Workflow termination (kill the pipeline on one failure) wastes other agents' completed work.",
          "Access failure (couldn't reach source; didn't execute) -> consider retry; valid empty result (executed, no matches) -> don't retry."
        ],
        antiPatterns: [
          "Catching a timeout and returning empty results marked successful (silent suppression).",
          "Terminating the entire pipeline when one subagent times out.",
          "Returning a generic 'search unavailable' status that hides query, partial results, and alternatives.",
          "Retrying a valid empty result because it looks like a failure."
        ],
        deepDive: [
          "Web search subagent timeout: the best design returns structured error context (failure type, attempted query, partial results, alternative approaches) so the coordinator can retry, try an alternative, proceed with partial results, or escalate. Generic 'search unavailable' after retries, empty-as-success, and pipeline termination are all wrong.",
          "Local recovery first: subagents retry transient failures locally (e.g. exponential backoff, fallback sources) and only propagate what they can't resolve, always including what was attempted and partial results — reducing coordinator complexity. Coverage annotations note gaps in synthesis instead of silently omitting topics."
        ],
        code: {
          title: "Access failure vs valid empty result",
          body: "// Access failure -- consider retry\n{ \"status\": \"error\", \"failureType\": \"transient\",\n  \"message\": \"Connection timeout after 30s\", \"shouldRetry\": true }\n\n// Valid empty result -- do NOT retry\n{ \"status\": \"success\", \"results\": [],\n  \"message\": \"Query executed; no matching records.\", \"shouldRetry\": false }"
        },
        compare: {
          bad: "Timeout -> return { results: [], status: 'success' } (silent suppression)",
          good: "Return structured error context; coordinator decides retry/alternative/partial/escalate"
        },
        examTip: "Subagent failure → structured error context (type/attempted/partial/alternatives). Access failure → retry; valid empty result → don't. Never suppress or kill the pipeline."
      },
      {
        id: "d5.4",
        title: "Codebase Exploration & Context Degradation",
        intro: "Degradation is an attention problem; scratchpad files, subagent isolation, /compact, and state manifests are the fixes.",
        concepts: [
          "Context degradation: the model references 'typical patterns' instead of specific classes/methods/dependency chains found earlier.",
          "It is NOT a token-limit problem — a bigger context window doesn't fix it; verbose output buries precise earlier findings.",
          "Scratchpad files persist key findings outside the conversation context, immune to degradation — maintain them from the start.",
          "Subagent delegation provides context isolation (not just parallelisation): verbose exploration stays out of the main context.",
          "/compact reduces context usage proactively to maintain quality; state manifests enable crash recovery across sessions."
        ],
        antiPatterns: [
          "Increasing the context window to solve context degradation.",
          "Thinking subagent delegation is only about parallelisation.",
          "Restarting a session to fix degradation without saving state (loses accumulated knowledge).",
          "Using /compact only when hitting context limits rather than proactively."
        ],
        deepDive: [
          "Productivity agent scenario: after investigating several modules it references 'typical repository patterns' instead of 'OrderRepository at src/repos/order.ts implements Repository<T> with custom findById caching'. The fix is scratchpad files recording key findings to read for subsequent questions — not a bigger window, not restarting, not pre-loading the whole codebase.",
          "Summary injection between phases prevents Phase 2 subagents from re-exploring Phase 1; crash recovery manifests record explored paths, key findings, current phase, and next steps so the coordinator can resume without repeating work."
        ],
        code: {
          title: "Crash-recovery state manifest",
          body: "{\n  \"sessionId\": \"explore-order-service-001\",\n  \"phase\": 2,\n  \"exploredPaths\": [\"src/repos/order.ts\", \"src/services/order.ts\"],\n  \"keyFindings\": { \"criticalIssue\": \"RefundProcessor has no Stripe retry logic\" },\n  \"nextSteps\": [\"Investigate PaymentGateway error handling\"]\n}"
        },
        compare: {
          bad: "Increase the context window so all discovery output fits",
          good: "Scratchpad files + subagent isolation persist specific findings outside context"
        },
        examTip: "Model drifts to 'typical patterns' = context degradation (attention, not tokens). Fix: scratchpad files; subagent isolation; /compact proactively; state manifests for recovery."
      },
      {
        id: "d5.5",
        title: "Human Review & Confidence Calibration",
        intro: "Aggregate accuracy hides per-segment failure; calibrate confidence and prioritise reviewers on uncertainty.",
        concepts: [
          "Aggregate metrics trap: 97% overall can hide 40%+ error on specific document types (high-volume easy segments mask the rest).",
          "Always validate accuracy by document type AND field segment before automating — never on aggregate alone.",
          "Raw model confidence is not calibrated; the same score means different accuracy per field/document type.",
          "Calibrate confidence against labelled validation sets, then set calibrated thresholds for automation vs human review.",
          "Stratified random sampling must include HIGH-confidence (automated) items to catch novel error patterns."
        ],
        antiPatterns: [
          "Using aggregate accuracy to justify automating all high-confidence extractions.",
          "Only sampling low-confidence extractions for human review.",
          "Using raw model confidence scores without calibration.",
          "Spreading reviewer capacity evenly across all extractions."
        ],
        deepDive: [
          "97% scenario: automating all extractions above 95% confidence is risky because the aggregate masks poor per-type performance (handwritten receipts 60%, international 45%) and confidence scores need calibration against labelled sets first. The risk isn't the threshold value or 'overconfidence over time' — it's hidden per-segment failure plus uncalibrated confidence.",
          "Reviewer capacity prioritisation: route the highest-uncertainty items first (low confidence, ambiguous/contradictory sources, historically poor document types) and order the queue dynamically — serve the next-highest-uncertainty item when a reviewer frees up, not chronological order. Even distribution wastes capacity on items the model handles well."
        ],
        code: {
          title: "Per-segment accuracy (the aggregate hides this)",
          body: "Document type        Date acc  Amount acc\nStandard invoices    99.5%     98.2%\nHandwritten receipts 60.1%     55.3%\nInternational        45.2%     52.1%\nAggregate            97.0%     96.1%   <- masks the failures"
        },
        compare: {
          bad: "Automate everything above 95% confidence based on 97% aggregate accuracy",
          good: "Validate by document type+field, calibrate confidence on labelled sets, then automate validated segments"
        },
        examTip: "Aggregate accuracy is a trap — validate by document type AND field. Calibrate confidence on labelled sets. Stratified-sample high-confidence items; prioritise reviewers on uncertainty."
      },
      {
        id: "d5.6",
        title: "Information Provenance & Multi-Source Synthesis",
        intro: "Preserve claim-source mappings through synthesis; annotate conflicts and respect temporal context.",
        concepts: [
          "Every finding carries a structured claim-source mapping: claim, source URL, document name, relevant excerpt, publication date.",
          "Attribution dies during summarisation unless the synthesis agent is explicitly told to preserve and merge claim-source mappings.",
          "Conflicting credible sources: annotate both values with full attribution and dates — never arbitrarily pick one or average.",
          "Temporal awareness: different publication/data-collection dates often explain different numbers (a trend, not a contradiction).",
          "Content-appropriate rendering: financial data -> tables, news -> prose, technical findings -> structured lists."
        ],
        antiPatterns: [
          "Selecting the most recent (or most authoritative, or averaged) source when two credible sources conflict.",
          "Assuming different numbers from different-dated sources are contradictions.",
          "Letting the synthesis agent paraphrase without preserving claim-source mappings.",
          "Rendering all content in a single uniform format (all prose, all tables, or all lists)."
        ],
        deepDive: [
          "Conflict scenario: Source A reports 12% growth (2023 data), Source B 8% (2024 data) and the synthesis agent picks the more recent. The correct approach is to annotate both values with source attribution and publication dates and let the consumer decide — selecting one destroys information and presents false certainty; escalating to a human isn't necessary when both can simply be presented with context.",
          "Attribution must survive every pipeline step (research -> analysis -> synthesis -> report), with the synthesis step the most common failure point. When analysis hits conflicting values (e.g. audited vs preliminary, fiscal vs calendar year), complete the analysis with the conflict intact and annotated, leaving resolution to the coordinator or consumer."
        ],
        code: {
          title: "Structured claim-source mapping",
          body: "{\n  \"claim\": \"Renewable investment reached $495B in 2023\",\n  \"sourceUrl\": \"https://example.com/iea-report-2024\",\n  \"documentName\": \"IEA World Energy Investment Report 2024\",\n  \"relevantExcerpt\": \"...approximately $495 billion in calendar year 2023...\",\n  \"publicationDate\": \"2024-06-15\"\n}"
        },
        compare: {
          bad: "Two sources conflict -> report only the most recent value",
          good: "Annotate both values with sources + dates; let the consumer interpret the difference"
        },
        examTip: "Provenance = claim+source+document+excerpt+date, preserved through synthesis. Conflicts → annotate both + dates (different dates = trend, not contradiction). Render per content type."
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
  var D5_FLASHCARDS = [
    { front: "What is the progressive summarisation trap?", back: "Summarising earlier turns to save tokens systematically destroys critical transactional data — amounts, dates, percentages, order numbers, and customer-stated expectations. The default behaviour for transactional data." },
    { front: "What is the persistent case facts block?", back: "A structured block of transactional facts (amounts, dates, order numbers, statuses) included in EVERY prompt, OUTSIDE the summarised history, that is never summarised. The single most important context-management pattern and the fix for progressive summarisation." },
    { front: "How do you fix the 'lost in the middle' effect?", back: "Structurally, not with prompts: place a key findings summary at the BEGINNING of aggregated inputs and use explicit section headers. Models process the start and end of long inputs reliably; the middle can be missed." },
    { front: "Why trim verbose tool results before they enter context?", back: "Untrimmed results (e.g. 40+ fields when you need 5) consume tokens in every subsequent turn as history accumulates (the API is stateless). Trim to relevant fields in a PostToolUse hook or the tool itself." },
    { front: "The three valid escalation triggers?", back: "(1) Customer explicitly requests a human (escalate immediately, no 'let me try first'); (2) policy exceptions/gaps (policy is silent — needs human judgement); (3) inability to make meaningful progress (after actually attempting resolution)." },
    { front: "The two UNRELIABLE escalation triggers?", back: "Sentiment-based escalation (frustration doesn't correlate with case complexity) and self-reported confidence scores (poorly calibrated — confident on hard cases, uncertain on easy ones)." },
    { front: "Policy gap vs policy violation for escalation?", back: "A gap (policy is silent on the situation) needs escalation for human judgement. A violation (a documented 'no', e.g. refund outside the return window) does NOT need escalation — the agent already has the answer." },
    { front: "How to handle ambiguous customer matches (e.g. three 'John Smith')?", back: "Ask for additional identifiers (email, phone, order number). NEVER select by 'most recent' or 'most active' heuristic — that risks privacy violations and wrong-account actions." },
    { front: "What four elements make up structured error context?", back: "Failure type (transient/validation/business/permission), what was attempted (tool, query, parameters), partial results gathered before failure, and potential alternative approaches." },
    { front: "The two error-propagation anti-patterns?", back: "Silent suppression (returning empty results marked as success — invisible gaps, no recovery — the worst) and workflow termination (killing the whole pipeline on one failure, wasting other agents' completed work)." },
    { front: "Access failure vs valid empty result?", back: "Access failure = tool couldn't reach the source (timeout/connection/permission); query didn't execute → consider retry. Valid empty result = query executed and found no matches → that IS the answer; don't retry." },
    { front: "What are coverage annotations?", back: "Notes in synthesis output stating which topics are well-supported and which have gaps (e.g. 'geothermal section limited due to unavailable journal access') — far better than silently omitting a topic, which looks like irrelevance." },
    { front: "What is context degradation, and is it a token-limit problem?", back: "The model references 'typical patterns' instead of specific classes/methods/dependency chains found earlier, because verbose output buries them. It is NOT a token-limit problem — a bigger context window does not fix it." },
    { front: "Primary mitigation for context degradation?", back: "Scratchpad files: write key findings to a file and read it for subsequent questions, persisting knowledge outside the conversation context where it's immune to degradation. Maintain from the start of extended exploration." },
    { front: "Why delegate codebase exploration to subagents (beyond parallelisation)?", back: "Context isolation: each subagent explores verbosely in its own context and returns a structured summary, keeping the main agent's context clean for coordination." },
    { front: "What does /compact do, and when to use it?", back: "Reduces context usage during long sessions by summarising the conversation while preserving key info. Use it PROACTIVELY to maintain context quality, not just when you hit limits. State manifests handle crash recovery." },
    { front: "What is the aggregate metrics trap?", back: "A high overall accuracy (e.g. 97%) hides catastrophic failure on specific segments (handwritten receipts 60%, international 45%) because high-volume easy documents dominate. Always validate by document type AND field before automating." },
    { front: "Why must confidence scores be calibrated, and how?", back: "Raw model confidence is relative, not absolute — 0.90 on dates might be 94% accurate but 0.90 on amounts only 82%. Calibrate against labelled validation sets to map confidence to actual accuracy, then set thresholds." },
    { front: "Why include high-confidence items in stratified sampling?", back: "Low-confidence items already go to human review; only sampling the high-confidence (automated) items can detect a novel error pattern affecting them. It serves both ongoing accuracy measurement and novel-error detection." },
    { front: "How should limited reviewer capacity be allocated?", back: "Prioritise the highest-uncertainty items first (low confidence, ambiguous/contradictory sources, historically poor document types) and order the queue dynamically. Never spread capacity evenly." },
    { front: "What must a structured claim-source mapping include?", back: "Claim, source URL, document name, relevant excerpt, and publication date. Attribution dies during summarisation unless the synthesis agent is explicitly told to preserve and merge these mappings." },
    { front: "How to handle two credible sources that conflict?", back: "Annotate BOTH values with full source attribution and publication dates and let the consumer decide — never arbitrarily pick the most recent, most authoritative, or the average. Different dates often explain the difference as a trend, not a contradiction." },
    { front: "Content-appropriate rendering in synthesis?", back: "Financial data → tables; news/current events → prose; technical findings → structured lists. Flattening everything into one uniform format degrades readability and comprehension." }
  ];
  Array.prototype.push.apply(window.FLASHCARDS, D5_FLASHCARDS);
})();
