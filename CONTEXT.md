# CONTEXT.md — Claude Certified Architect Exam Prep: Source Guide, Research & Sync Log

> **What this file is:** the complete reference behind this repo's study content. It has
> three parts: (1) a full, verbatim transcription of the official Anthropic exam guide
> the user supplied (v0.2, 30 June 2026), (2) findings from live web research done to
> verify every technical claim currently taught by the app, and (3) a changelog of
> exactly what was checked, confirmed, or fixed in the 2026-07-22 sync pass. Treat this
> as the source of truth the next time the guide changes — diff the new PDF against
> Part 1, re-verify anything time-sensitive in Part 2, and append to Part 3.
>
> Compiled: 2026-07-22. Source PDF:
> `Claude_Certified_Architect_-_Foundations_-_Exam_Guide.pdf` (user-supplied, downloaded
> to `~/Downloads`), version 0.2, last updated 30 June 2026.

---

# Part 1 — Full Exam Guide Transcript (v0.2, 30 June 2026)

*Verbatim transcription of all 37 pages of the official PDF. Headings mirror the PDF's own structure.*

## Introduction

The Claude Certified Architect – Foundations certification validates that practitioners can make informed decisions about tradeoffs when implementing real-world solutions with Claude. This exam tests foundational knowledge across Claude Code, the Claude Agent SDK, the Claude API, and Model Context Protocol (MCP) — the core technologies used to build production-grade applications with Claude.

Questions on this exam are grounded in realistic scenarios drawn from actual customer use cases, including building agentic systems for customer support, designing multi-agent research pipelines, integrating Claude Code into CI/CD workflows, building developer productivity tools, and extracting structured data from unstructured documents. Candidates must demonstrate not only conceptual knowledge but practical judgment about architecture, configuration, and tradeoffs in production deployments.

This guide describes the exam content, lists the domains and task statements tested, provides sample questions, and recommends preparation strategies. Use it alongside hands-on experience to prepare effectively.

## Exam Details at a Glance

| Field | Value |
|---|---|
| Credential | Claude Certified Architect – Foundations |
| Number of questions | 60 |
| Time limit | 120 minutes |
| Response format | Multiple choice; one correct answer and three incorrect options |
| Exam structure | 4 scenarios drawn from a bank of 6 |
| Content domains | 5 (weightings in the Content Outline) |
| Delivery | Online proctored or at a test center |
| Exam fee | $125 USD |
| Scoring | Scaled score of 100–1,000; minimum passing score 720 |
| Validity period | 12 months from the date the credential is awarded |
| Result reporting | Pass or fail |

## Target Candidate Description

The ideal candidate for this certification is a solution architect who designs and implements production applications with Claude. This candidate has hands-on experience with:

- Building agentic applications using the Claude Agent SDK, including multi-agent orchestration, subagent delegation, tool integration, and lifecycle hooks
- Configuring and customizing Claude Code for team workflows using CLAUDE.md files, Agent Skills, MCP server integrations, and plan mode
- Designing Model Context Protocol (MCP) tool and resource interfaces for backend system integration
- Engineering prompts that produce reliable structured output, leveraging JSON schemas, few-shot examples, and extraction patterns
- Managing context windows effectively across long documents, multi-turn conversations, and multi-agent handoffs
- Integrating Claude into CI/CD pipelines for automated code review, test generation, and pull request feedback
- Making sound escalation and reliability decisions, including error handling, human-in-the-loop workflows, and self-evaluation patterns

The candidate typically has 6+ months of practical experience building with Claude APIs, Agent SDK, Claude Code, and MCP, understanding both the capabilities and limitations of large language models in production environments.

## Exam Content

### Response Types

All questions on the exam are multiple choice format. Each question has one correct response and three incorrect responses.

Select the single response that best completes the statement or answers the question. The incorrect options are designed to be plausible to a candidate with incomplete knowledge or experience.

The exam platform requires an answer to every question before you can advance, so no question is left unanswered.

### Exam Results

The exam has a pass or fail designation. The exam is scored against a minimum standard established by subject matter experts.

Your results are reported as a scaled score of 100–1,000. The minimum passing score is 720. Scaled scoring models help equate scores across multiple exam forms that might have slightly different difficulty levels.

### Content Outline

This exam guide includes weightings, content domains, and task statements for the exam. The exam has the following content domains and weightings:

- **Domain 1: Agentic Architecture & Orchestration** (27% of scored content)
- **Domain 2: Tool Design & MCP Integration** (18% of scored content)
- **Domain 3: Claude Code Configuration & Workflows** (20% of scored content)
- **Domain 4: Prompt Engineering & Structured Output** (20% of scored content)
- **Domain 5: Context Management & Reliability** (15% of scored content)

## Exam Scenarios

The exam uses scenario-based questions. Each scenario presents a realistic production context that frames a set of questions. During the exam, 4 scenarios will be presented and picked at random from the full set of the 6 scenarios below.

### Scenario 1: Customer Support Resolution Agent
You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.
**Primary domains:** Agentic Architecture & Orchestration, Tool Design & MCP Integration, Context Management & Reliability

### Scenario 2: Code Generation with Claude Code
You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.
**Primary domains:** Claude Code Configuration & Workflows, Context Management & Reliability

### Scenario 3: Multi-Agent Research System
You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.
**Primary domains:** Agentic Architecture & Orchestration, Tool Design & MCP Integration, Context Management & Reliability

### Scenario 4: Developer Productivity with Claude
You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.
**Primary domains:** Tool Design & MCP Integration, Claude Code Configuration & Workflows, Agentic Architecture & Orchestration

### Scenario 5: Claude Code for Continuous Integration
You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.
**Primary domains:** Claude Code Configuration & Workflows, Prompt Engineering & Structured Output

### Scenario 6: Structured Data Extraction
You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.
**Primary domains:** Prompt Engineering & Structured Output, Context Management & Reliability

## Domain 1: Agentic Architecture & Orchestration (27%)

### Task Statement 1.1: Design and implement agentic loops for autonomous task execution
**Knowledge of:** The agentic loop lifecycle: sending requests to Claude, inspecting stop_reason ("tool_use" vs "end_turn"), executing requested tools, and returning results for the next iteration · How tool results are appended to conversation history so the model can reason about the next action · The distinction between model-driven decision-making and pre-configured decision trees or tool sequences.
**Skills in:** Implementing agentic loop control flow that continues when stop_reason is "tool_use" and terminates when stop_reason is "end_turn" · Adding tool results to conversation context between iterations · Avoiding anti-patterns such as parsing natural language signals to determine loop termination, setting arbitrary iteration caps as the primary stopping mechanism, or checking for assistant text content as a completion indicator.

### Task Statement 1.2: Orchestrate multi-agent systems with coordinator-subagent patterns
**Knowledge of:** Hub-and-spoke architecture where a coordinator agent manages all inter-subagent communication, error handling, and information routing · How subagents operate with isolated context—they do not inherit the coordinator's conversation history automatically · The role of the coordinator in task decomposition, delegation, result aggregation, and deciding which subagents to invoke · Risks of overly narrow task decomposition leading to incomplete coverage.
**Skills in:** Designing coordinator agents that analyze query requirements and dynamically select subagents rather than always routing through the full pipeline · Partitioning research scope across subagents to minimize duplication · Implementing iterative refinement loops where the coordinator evaluates synthesis output for gaps and re-delegates · Routing all subagent communication through the coordinator.

### Task Statement 1.3: Configure subagent invocation, context passing, and spawning
**Knowledge of:** The Task tool as the mechanism for spawning subagents, and the requirement that allowedTools must include "Task" for a coordinator to invoke subagents · That subagent context must be explicitly provided in the prompt—subagents do not automatically inherit parent context or share memory between invocations · The AgentDefinition configuration including descriptions, system prompts, and tool restrictions · Fork-based session management for exploring divergent approaches from a shared analysis baseline.
**Skills in:** Including complete findings from prior agents directly in the subagent's prompt · Using structured data formats to separate content from metadata (source URLs, document names, page numbers) · Spawning parallel subagents by emitting multiple Task tool calls in a single coordinator response · Designing coordinator prompts that specify research goals and quality criteria rather than step-by-step procedural instructions.

### Task Statement 1.4: Implement multi-step workflows with enforcement and handoff patterns
**Knowledge of:** The difference between programmatic enforcement (hooks, prerequisite gates) and prompt-based guidance for workflow ordering · When deterministic compliance is required, prompt instructions alone have a non-zero failure rate · Structured handoff protocols for mid-process escalation that include customer details, root cause analysis, and recommended actions.
**Skills in:** Implementing programmatic prerequisites that block downstream tool calls until prerequisite steps have completed · Decomposing multi-concern customer requests into distinct items, investigating each in parallel with shared context, then synthesizing a unified resolution · Compiling structured handoff summaries (customer ID, root cause, refund amount, recommended action) when escalating to humans who lack access to the transcript.

### Task Statement 1.5: Apply Agent SDK hooks for tool call interception and data normalization
**Knowledge of:** Hook patterns (e.g., PostToolUse) that intercept tool results for transformation before the model processes them · Hook patterns that intercept outgoing tool calls to enforce compliance rules · The distinction between hooks for deterministic guarantees vs prompt instructions for probabilistic compliance.
**Skills in:** Implementing PostToolUse hooks to normalize heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes) · Implementing tool call interception hooks that block policy-violating actions and redirect to alternative workflows · Choosing hooks over prompt-based enforcement when business rules require guaranteed compliance.

### Task Statement 1.6: Design task decomposition strategies for complex workflows
**Knowledge of:** When to use fixed sequential pipelines (prompt chaining) vs dynamic adaptive decomposition based on intermediate findings · Prompt chaining patterns that break reviews into sequential steps · The value of adaptive investigation plans that generate subtasks based on what is discovered at each step.
**Skills in:** Selecting task decomposition patterns appropriate to the workflow · Splitting large code reviews into per-file local analysis passes plus a separate cross-file integration pass to avoid attention dilution · Decomposing open-ended tasks by first mapping structure, identifying high-impact areas, then creating a prioritized plan that adapts as dependencies are discovered.

### Task Statement 1.7: Manage session state, resumption, and forking
**Knowledge of:** Named session resumption using --resume <session-name> · fork_session for creating independent branches from a shared analysis baseline · The importance of informing the agent about changes to previously analyzed files when resuming · Why starting a new session with a structured summary is more reliable than resuming with stale tool results.
**Skills in:** Using --resume with session names to continue named investigation sessions · Using fork_session to create parallel exploration branches · Choosing between session resumption (valid context) and fresh start with injected summaries (stale context) · Informing a resumed session about specific file changes for targeted re-analysis.

## Domain 2: Tool Design & MCP Integration (18%)

### Task Statement 2.1: Design effective tool interfaces with clear descriptions and boundaries
**Knowledge of:** Tool descriptions as the primary mechanism LLMs use for tool selection; minimal descriptions lead to unreliable selection · The importance of including input formats, example queries, edge cases, boundary explanations · How ambiguous/overlapping descriptions cause misrouting · The impact of system prompt wording (keyword-sensitive instructions creating unintended tool associations).
**Skills in:** Writing tool descriptions that clearly differentiate purpose, inputs, outputs, and when to use vs similar alternatives · Renaming tools/updating descriptions to eliminate functional overlap · Splitting generic tools into purpose-specific tools with defined input/output contracts · Reviewing system prompts for keyword-sensitive instructions that override well-written tool descriptions.

### Task Statement 2.2: Implement structured error responses for MCP tools
**Knowledge of:** The MCP isError flag pattern · The distinction between transient, validation, business, and permission errors · Why uniform error responses prevent appropriate recovery decisions · The difference between retryable and non-retryable errors.
**Skills in:** Returning structured error metadata (errorCategory, isRetryable boolean, human-readable descriptions) · Including retriable:false flags and customer-friendly explanations for business rule violations · Implementing local error recovery within subagents for transient failures, propagating only unresolvable errors · Distinguishing access failures from valid empty results.

### Task Statement 2.3: Distribute tools appropriately across agents and configure tool choice
**Knowledge of:** Too many tools (e.g. 18 instead of 4-5) degrades tool selection reliability · Why agents with tools outside their specialization tend to misuse them · Scoped tool access with limited cross-role tools for high-frequency needs · tool_choice options: "auto", "any", forced tool selection.
**Skills in:** Restricting each subagent's tool set to those relevant to its role · Replacing generic tools with constrained alternatives · Providing scoped cross-role tools for high-frequency needs while routing complex cases through the coordinator · Using forced tool_choice to ensure a specific tool runs first · Setting tool_choice:"any" to guarantee a tool call.

### Task Statement 2.4: Integrate MCP servers into Claude Code and agent workflows
**Knowledge of:** MCP server scoping: project-level (.mcp.json) vs user-level (~/.claude.json) · Environment variable expansion in .mcp.json for credentials · Tools from all configured MCP servers discovered at connection time · MCP resources for exposing content catalogs to reduce exploratory tool calls.
**Skills in:** Configuring shared MCP servers in project-scoped .mcp.json with env-var expansion · Configuring personal/experimental servers in user-scoped ~/.claude.json · Enhancing MCP tool descriptions so the agent doesn't prefer built-in tools (like Grep) over more capable MCP tools · Choosing existing community MCP servers over custom implementations for standard integrations · Exposing content catalogs as MCP resources.

### Task Statement 2.5: Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively
**Knowledge of:** Grep for content search · Glob for file path pattern matching · Read/Write for full file operations; Edit for targeted modifications using unique text matching · Read+Write as fallback when Edit fails on non-unique matches.
**Skills in:** Selecting Grep for content search across a codebase · Selecting Glob for naming-pattern file discovery · Using Read then Write when Edit can't find a unique anchor · Building codebase understanding incrementally (Grep → Read, not reading everything upfront) · Tracing function usage across wrapper modules.

## Domain 3: Claude Code Configuration & Workflows (20%)

### Task Statement 3.1: Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization
**Knowledge of:** The CLAUDE.md hierarchy: user (~/.claude/CLAUDE.md), project (.claude/CLAUDE.md or root CLAUDE.md), directory-level · User-level settings apply only to that user, not shared via version control · The @import syntax for referencing external files · .claude/rules/ as an alternative to a monolithic CLAUDE.md.
**Skills in:** Diagnosing configuration hierarchy issues (new team member not receiving instructions because they're in user-level config) · Using @import to selectively include relevant standards files · Splitting large CLAUDE.md files into topic-specific .claude/rules/ files · Using /memory to verify which memory files are loaded.

### Task Statement 3.2: Create and configure custom slash commands and skills
**Knowledge of:** Project-scoped commands in .claude/commands/ (shared via version control) vs user-scoped ~/.claude/commands/ (personal) · Skills in .claude/skills/ with SKILL.md frontmatter (context: fork, allowed-tools, argument-hint) · The context:fork option for isolated sub-agent execution · Personal skill customization via differently-named variants in ~/.claude/skills/.
**Skills in:** Creating project-scoped slash commands for team-wide availability · Using context:fork to isolate verbose/exploratory skills · Configuring allowed-tools to restrict tool access during skill execution · Using argument-hint to prompt for required parameters · Choosing between skills (on-demand) and CLAUDE.md (always-loaded).

### Task Statement 3.3: Apply path-specific rules for conditional convention loading
**Knowledge of:** .claude/rules/ files with YAML frontmatter paths fields (glob patterns) for conditional activation · Path-scoped rules load only when editing matching files · Advantage of glob-pattern rules over directory-level CLAUDE.md for conventions spanning multiple directories.
**Skills in:** Creating .claude/rules/ files with YAML frontmatter path scoping · Using glob patterns to apply conventions by file type regardless of directory · Choosing path-specific rules over subdirectory CLAUDE.md files when conventions span the codebase.

### Task Statement 3.4: Determine when to use plan mode vs direct execution
**Knowledge of:** Plan mode for complex tasks: large-scale changes, multiple valid approaches, architectural decisions, multi-file modifications · Direct execution for simple, well-scoped changes · Plan mode enables safe exploration/design before committing to changes · The Explore subagent isolates verbose discovery output.
**Skills in:** Selecting plan mode for tasks with architectural implications · Selecting direct execution for well-understood, clear-scope changes · Using the Explore subagent during multi-phase tasks · Combining plan mode (investigation) with direct execution (implementation).

### Task Statement 3.5: Apply iterative refinement techniques for progressive improvement
**Knowledge of:** Concrete input/output examples as the most effective way to communicate expected transformations · Test-driven iteration (write tests first, iterate on failures) · The interview pattern (Claude asks clarifying questions before implementing) · When to batch interacting issues vs sequence independent ones.
**Skills in:** Providing 2-3 concrete input/output examples when prose produces inconsistent results · Writing test suites before implementation and iterating on failures · Using the interview pattern in unfamiliar domains · Providing specific test cases for edge-case handling · Batching interacting issues in one message vs sequential iteration for independent ones.

### Task Statement 3.6: Integrate Claude Code into CI/CD pipelines
**Knowledge of:** The -p (--print) flag for non-interactive mode · --output-format json and --json-schema for structured CI output · CLAUDE.md as the mechanism for CI project context · Session context isolation — why the generating session is a weaker reviewer of its own output.
**Skills in:** Running Claude Code in CI with -p to prevent hangs · Using --output-format json + --json-schema for machine-parseable PR comments · Including prior review findings to avoid duplicate comments on re-runs · Providing existing test files to avoid duplicate test suggestions · Documenting testing standards/fixtures in CLAUDE.md.

## Domain 4: Prompt Engineering & Structured Output (20%)

### Task Statement 4.1: Design prompts with explicit criteria to improve precision and reduce false positives
**Knowledge of:** Explicit criteria over vague instructions · General instructions ("be conservative") fail to improve precision vs specific categorical criteria · Impact of false-positive rates on developer trust.
**Skills in:** Writing specific review criteria for what to report vs skip · Temporarily disabling high false-positive categories while improving those prompts · Defining explicit severity criteria with concrete examples per level.

### Task Statement 4.2: Apply few-shot prompting to improve output consistency and quality
**Knowledge of:** Few-shot examples as the most effective technique for consistent, actionable output · Role of examples in demonstrating ambiguous-case handling · How examples enable generalization to novel patterns · Effectiveness for reducing hallucination in extraction.
**Skills in:** Creating 2-4 targeted few-shot examples showing reasoning for ambiguous scenarios · Including examples demonstrating desired output format · Distinguishing acceptable patterns from genuine issues to reduce false positives · Demonstrating correct handling of varied document structures · Addressing empty/null extraction of required fields.

### Task Statement 4.3: Enforce structured output using tool use and JSON schemas
**Knowledge of:** tool_use with JSON schemas as the most reliable approach for schema-compliant output · tool_choice: "auto" vs "any" vs forced selection · Strict schemas eliminate syntax errors but not semantic errors · Schema design: required vs optional, enum + "other"+detail patterns.
**Skills in:** Defining extraction tools with JSON schemas · Setting tool_choice:"any" when document type is unknown across multiple schemas · Forcing a specific tool to run first · Designing nullable/optional fields to prevent fabrication · Adding "unclear"/"other" enum values · Including format-normalization rules alongside schemas.

### Task Statement 4.4: Implement validation, retry, and feedback loops for extraction quality
**Knowledge of:** Retry-with-error-feedback: append specific validation errors on retry · Limits of retry (ineffective when info is simply absent from source) · Feedback loop design (detected_pattern field) · Semantic vs syntax validation errors.
**Skills in:** Implementing follow-up requests with document + failed extraction + specific validation errors · Identifying when retries will/won't help · Adding detected_pattern fields for dismissal-pattern analysis · Designing self-correction flows (calculated_total vs stated_total, conflict_detected booleans).

### Task Statement 4.5: Design efficient batch processing strategies
**Knowledge of:** Message Batches API: 50% cost savings, up to 24-hour window, no latency SLA · Appropriate for non-blocking/latency-tolerant workloads, not blocking workflows · No multi-turn tool calling within a batch request · custom_id for correlation.
**Skills in:** Matching API approach to latency requirements (sync for blocking, batch for overnight/weekly) · Calculating submission frequency against SLA constraints · Handling batch failures by resubmitting failed documents via custom_id · Refining prompts on a sample before large-scale batch runs.

### Task Statement 4.6: Design multi-instance and multi-pass review architectures
**Knowledge of:** Self-review limitations (model retains generation reasoning, less likely to self-challenge) · Independent review instances catch subtle issues better than self-review/extended thinking · Multi-pass review avoids attention dilution and contradictory findings.
**Skills in:** Using a second independent instance to review generated code · Splitting large multi-file reviews into per-file + integration passes · Running verification passes with self-reported confidence for calibrated routing.

## Domain 5: Context Management & Reliability (15%)

### Task Statement 5.1: Manage conversation context to preserve critical information across long interactions
**Knowledge of:** Progressive summarization risks (losing numbers, dates, expectations) · The "lost in the middle" effect · Tool results consuming tokens disproportionately to relevance · Importance of passing complete history for coherence.
**Skills in:** Extracting transactional facts into a persistent "case facts" block outside summarized history · Persisting structured issue data in a separate context layer · Trimming verbose tool outputs to relevant fields · Placing key findings at the start of aggregated inputs with section headers · Requiring subagent metadata for downstream synthesis · Returning structured data instead of verbose reasoning chains when downstream context budgets are limited.

### Task Statement 5.2: Design effective escalation and ambiguity resolution patterns
**Knowledge of:** Appropriate escalation triggers: explicit human request, policy gaps, inability to progress · Escalate-immediately-on-request vs offer-to-resolve distinction · Sentiment/self-reported confidence as unreliable proxies for complexity · Multiple customer matches require clarification, not heuristic selection.
**Skills in:** Adding explicit escalation criteria with few-shot examples · Honoring explicit human requests immediately · Acknowledging frustration while offering resolution within capability · Escalating on ambiguous/silent policy · Asking for additional identifiers on multiple matches.

### Task Statement 5.3: Implement error propagation strategies across multi-agent systems
**Knowledge of:** Structured error context (failure type, attempted query, partial results, alternatives) enables intelligent recovery · Access failures vs valid empty results · Generic error statuses hide context · Silent suppression and workflow termination are both anti-patterns.
**Skills in:** Returning structured error context for coordinator recovery · Distinguishing access failures from valid empty results · Local recovery for transient failures, propagating only unresolvable errors · Coverage annotations in synthesis output.

### Task Statement 5.4: Manage context effectively in large codebase exploration
**Knowledge of:** Context degradation in extended sessions (generic "typical patterns" answers) · Scratchpad files for persisting findings · Subagent delegation to isolate verbose output · Structured state persistence/manifests for crash recovery.
**Skills in:** Spawning subagents for specific investigation questions · Maintaining scratchpad files across questions · Summarizing findings before spawning the next phase's subagents · Designing crash recovery via state export manifests · Using /compact during extended sessions.

### Task Statement 5.5: Design human review workflows and confidence calibration
**Knowledge of:** Aggregate accuracy metrics can mask poor performance on specific segments · Stratified random sampling for error-rate measurement · Field-level confidence calibrated with labeled validation sets · Validating accuracy by document type/field before automating.
**Skills in:** Implementing stratified random sampling of high-confidence extractions · Analyzing accuracy by document type and field · Calibrating review thresholds using labeled validation sets · Routing low-confidence/ambiguous extractions to human review.

### Task Statement 5.6: Preserve information provenance and handle uncertainty in multi-source synthesis
**Knowledge of:** Source attribution lost during summarization without claim-source mappings · Importance of structured claim-source mappings preserved through synthesis · Annotating conflicting statistics with source attribution rather than arbitrary selection · Temporal data (publication/collection dates) to avoid misread contradictions.
**Skills in:** Requiring structured claim-source mappings preserved through synthesis · Structuring reports distinguishing well-established from contested findings · Completing analysis with conflicts explicitly annotated for coordinator reconciliation · Requiring publication/collection dates · Rendering content types appropriately (tables/prose/lists) rather than uniform format.

## Sample Questions (official, 12 total, verbatim with answers + rationale)

*See the full text with all four options and complete rationale in
`/private/tmp/.../scratchpad/exam-guide-v0.2-transcript.md` (session scratchpad) if
needed verbatim — condensed here to the tested principle per question to keep this file
scannable. All 12 were cross-checked against the app's current scenario/exam-bank content
during this sync (see Part 3).*

1. **(Support)** Agent skips `get_customer` 12% of the time → fix is a **programmatic prerequisite gate**, not a stronger prompt or few-shot examples. *(Correct: A)*
2. **(Support)** Agent confuses `get_customer` vs `lookup_order` due to minimal descriptions → fix is **expanding tool descriptions first**, before few-shot or a routing layer. *(Correct: B)*
3. **(Support)** 55% first-contact resolution, over-escalating straightforward cases → fix is **explicit escalation criteria + few-shot examples**, not confidence scores, a separate classifier, or sentiment analysis. *(Correct: A)*
4. **(Code Gen)** Team-wide `/review` command → belongs in **`.claude/commands/`** (project-scoped), not `~/.claude/commands/`, CLAUDE.md, or a nonexistent config file. *(Correct: A)*
5. **(Code Gen)** Monolith → microservices restructuring → **plan mode** first, not direct execution. *(Correct: A)*
6. **(Code Gen)** Test-file conventions spread across many directories → **`.claude/rules/` with glob `paths`**, not root CLAUDE.md, skills, or per-directory CLAUDE.md. *(Correct: A)*
7. **(Research)** Report misses whole categories (music/writing/film) → root cause is the **coordinator's narrow decomposition**, not the subagents. *(Correct: B)*
8. **(Research)** Web-search subagent times out → return **structured error context** (failure type, attempted query, partial results, alternatives) to the coordinator, not a generic status, silent success, or workflow termination. *(Correct: A)*
9. **(Research)** Synthesis agent needs frequent simple fact-checks (85% simple / 15% complex) → give it a **scoped `verify_fact` tool** for the common case; don't over-provision full web-search access or batch/cache speculatively. *(Correct: A)*
10. **(CI/CD)** Pipeline hangs waiting for input → use the **`-p`/`--print` flag**; `CLAUDE_HEADLESS` and `--batch` don't exist. *(Correct: A)*
11. **(CI/CD)** Batches API proposed for both a blocking pre-merge check and an overnight report → use batch **only for the overnight report**; pre-merge checks need real-time. *(Correct: A)*
12. **(CI/CD)** Single-pass review of 14 files gives inconsistent depth and contradictory verdicts → **split into per-file passes + a cross-file integration pass** (attention dilution), not a bigger model, smaller PRs, or majority-vote across 3 full-PR passes. *(Correct: A)*

*(The guide notes these are "drawn from the practice test," implying a separate official practice test exists beyond this guide.)*

## Preparation Exercises (4 exercises, 27 steps total)

1. **Build a Multi-Tool Agent with Escalation Logic** (steps 1–5) — MCP tools with careful descriptions, stop_reason-driven loop, structured error responses, a policy-enforcement hook, multi-concern decomposition. *Domains: D1, D2, D5.*
2. **Configure Claude Code for a Team Development Workflow** (steps 6–10) — project CLAUDE.md, `.claude/rules/` glob scoping, a `context:fork` skill, `.mcp.json` + personal `~/.claude.json`, plan-vs-direct across varying complexity. *Domains: D3, D2.*
3. **Build a Structured Data Extraction Pipeline** (steps 11–15) — JSON schema with nullable/enum fields, validation-retry loop, few-shot examples for varied formats, Batches API run with custom_id failure handling, confidence-based human review routing. *Domains: D4, D5.*
4. **Design and Debug a Multi-Agent Research Pipeline** (steps 16–20) — coordinator + subagents with explicit context passing, parallel Task calls, structured findings with provenance, simulated error propagation, conflicting-source synthesis. *Domains: D1, D2, D5.*
5. Steps 21–27 (unnumbered "Exam Preparation Recommendations" list): hands-on build reps across Agent SDK, Claude Code config, MCP tool design, extraction pipeline, prompt engineering, context management, and escalation/human-review patterns — one recommendation per domain area, restating the above at a higher level.

## Appendix

**Technologies and Concepts** (may appear on the exam): Claude Agent SDK (agent definitions, agentic loops, stop_reason, hooks, Task tool subagent spawning, allowedTools) · MCP (servers, tools, resources, isError, .mcp.json, env-var expansion) · Claude Code (CLAUDE.md hierarchy, `.claude/rules/` YAML path-scoping, `.claude/commands/`, `.claude/skills/` + SKILL.md frontmatter, plan mode, `/memory`, `/compact`, `--resume`, `fork_session`, Explore subagent) · Claude Code CLI (`-p`/`--print`, `--output-format json`, `--json-schema`) · Claude API (tool_use + JSON schemas, tool_choice, stop_reason values, max_tokens, system prompts) · Message Batches API (50% savings, 24h window, custom_id, no multi-turn tool calls) · JSON Schema (required/optional, enums, nullable, "other"+detail, strict mode) · Pydantic (validation, semantic errors, retry loops) · Built-in tools (Read/Write/Edit/Bash/Grep/Glob) · Few-shot prompting · Prompt chaining · Context window management (token budgets, progressive summarization, lost-in-the-middle, scratchpad files) · Session management (resumption, fork_session, isolation) · Confidence scoring (field-level, calibration, stratified sampling).

**In-Scope Topics** (18 bullets, explicitly tested): agentic loop implementation · multi-agent orchestration · subagent context management · tool interface design · MCP tool/resource design · MCP server configuration · error handling and propagation · escalation decision-making · CLAUDE.md configuration · custom commands and skills · plan mode vs direct execution · iterative refinement · structured output via tool_use · few-shot prompting · batch processing · context window optimization · human review workflows · information provenance.

**Out-of-Scope Topics** (explicitly NOT on the exam): fine-tuning/training custom models · Claude API auth/billing/account management · language/framework implementation details beyond tool/schema config · deploying/hosting MCP servers (infra, networking, containers) · Claude's internal architecture/training/model weights · Constitutional AI/RLHF/safety training methodology · embedding models/vector DB implementation · computer use (browser/desktop automation) · vision/image analysis · streaming API/SSE implementation · rate limiting/quotas/pricing calculations · OAuth/API key rotation/auth protocol details · specific cloud provider configs (AWS/GCP/Azure) · performance benchmarking/model comparison · prompt caching implementation details (beyond knowing it exists) · token counting/tokenization specifics.

**Exam Preparation Recommendations:** 7 numbered recommendations (21–27 in the PDF's continuous numbering with the exercises) — hands-on reps building with the Agent SDK, configuring Claude Code for a real project, designing/testing MCP tools, building an extraction pipeline, practicing prompt engineering techniques, studying context management patterns, and reviewing escalation/human-in-the-loop patterns.

**Footer:** *"Version 0.2 Last Updated: June 30 2026"*

---

# Part 2 — Web Research Findings (2026-07-22)

## The certification itself
- **Real and official.** Anthropic launched Claude Certified Architect on **March 12, 2026**. Official pages: [Anthropic Academy](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification), [Anthropic Skilljar](https://anthropic.skilljar.com/claude-certified-architect-foundations-certification/444989). Coverage: [zenvanriel.com](https://zenvanriel.com/ai-engineer-blog/claude-certified-architect-anthropic-certification-guide/), [lowcode.agency](https://www.lowcode.agency/blog/how-to-become-claude-certified-architect).
- Confirmed exam mechanics (matches the PDF exactly): 60 MC questions, 120 minutes, $125 USD, scaled score 100–1000, pass at 720 (=72%), 12-month validity, online-proctored or test center.
- Industry adoption: Accenture and IBM Consulting reportedly made CCA-F a prerequisite for some client engagements involving Claude.
- **As of July 2026, Anthropic expanded to a 4-exam family** via the Partner Academy: Associate (CCAO-F), Developer (CCDV-F), Architect – Foundations (CCAR-F, the one this app covers), and Architect – Professional (CCAR-P).
- v0.2 (30 June 2026) is the latest publicly known exam-guide version as of 2026-07-22 — no v0.3 found anywhere.
- Two other official PDFs exist (Certification Terms and Conditions; Anthropic Certification Exam Policy) — not needed for study content, just registration housekeeping.
- **Provenance note:** this repo's pre-existing content was built from **claudecertificationguide.com**, an *unofficial* community study site that tracks the official guide closely (its lesson URLs even mirror task-statement numbers, e.g. `/learn/3-claude-code-config/3-3-path-specific-rules`). Numerous other unofficial guides exist (daronyondem/claude-architect-exam-guide, dnacenta/claude-certified-architect, claudecertifications.com, panaversity.org, etc.). The official Anthropic PDF the user supplied is the authoritative source going forward.

## claudecertificationguide.com changelog — relevant entries (that unofficial site, cross-checked for corroboration)
- **8 Jul 2026:** "Domain 1 lessons and questions now lead with the exam guide's 'Task tool' terminology, with a note that current Claude Code renamed it to Agent in v2.1.63" — matches this repo's `data/d1.js` exactly (independently confirmed correct, see below).
- **15 May 2026:** "Lesson 2.3 (MCP Client Integration): Coordinator tool renamed from Task to Agent."
- **7 Jul 2026:** confirms 60 questions / 120 minutes (flagging their own past mistake of saying "60 minutes" — the same mistake this repo's `app.js` had, see Part 3), $125 fee, 12-month validity.
- **25 May 2026:** an internal mock-exam-engine fix (guarantee ≥3 questions/domain) — not exam content, just an engineering note for whoever maintains that other site's practice engine.

## Verified technical facts (official/current docs, cross-checked against the PDF and this repo)

### The Task → Agent tool rename
Official Claude Agent SDK docs ([code.claude.com/docs/en/agent-sdk/subagents](https://code.claude.com/docs/en/agent-sdk/subagents), fetched 2026-07-22) state verbatim:
> "The tool name was renamed from `"Task"` to `"Agent"` in Claude Code v2.1.63. Current SDK releases emit `"Agent"` in `tool_use` blocks but still use `"Task"` in the `system:init` tools list and in `result.permission_denials[].tool_name`."

**Conclusion:** this repo's `data/d1.js` claim is accurate and independently confirmed. The v0.2 exam guide itself still uses "Task tool" throughout (never "Agent") — presumably because the guide's own wording predates/doesn't track the rename. Recommendation followed: keep both names visible, since the guide's own phrasing says "Task" but the current, real product name is "Agent." No change was needed to `d1.js`; it already strikes this balance correctly.

Bonus finds (**out of the guide's explicit scope, not added to study content** — would be scope creep beyond what's testable): `AgentDefinition` now also supports `disallowedTools`, `skills`, `memory`, `mcpServers`, `initialPrompt`, `maxTurns`, `background`, `effort`, `permissionMode` fields; subagents run in the background by default since Claude Code v2.1.198; subagents can spawn their own subagents up to 5 levels deep since v2.1.172; a `Workflow` tool exists for orchestrating dozens-to-hundreds of agents outside the conversation context. None of this contradicts the guide — just additive real-world detail beyond what the certification tests.

### Slash commands / Skills unification (the other disputed claim)
Confirmed real: on **24 January 2026**, Anthropic merged slash commands into the Skills system — `.claude/commands/` is now a legacy-but-working alias feeding the same underlying Skills execution engine (multiple independent sources: [devgenius.io](https://blog.devgenius.io/why-did-anthropic-merge-slash-commands-into-skills-4bf6464c96ca), [Medium/Joe Njenga](https://medium.com/@joe.njenga/claude-code-merges-slash-commands-into-skills-dont-miss-your-update-8296f3989697), [jsmanifest.com](https://jsmanifest.com/claude-code-skills-slash-commands-unified-model)).

**However**, the v0.2 exam guide (30 June 2026 — five months after that merge) still tests `.claude/commands/` and `.claude/skills/` as **two separate task-relevant mechanisms** with separate scoping rules, and its own Sample Question 4 tests exactly this distinction with no mention of unification. **Resolution applied (Part 3):** rewrote the study content to teach the guide's own framing as primary (two related-but-distinct things to know), demoted the real-world unification to a footnote, and rewrote one graded practice question that had been asserting "unification" as the scored-correct answer.

### Plan mode / Explore subagent / session tools
- Confirmed: **Explore** is a read-only, Haiku-model subagent specialized for fast codebase search during discovery (matches the guide's "Explore subagent for isolating verbose discovery output"). Plan mode is a distinct research role during planning.
- Confirmed: **fork_session** creates a subagent/branch that inherits the full parent conversation history up to the fork point, then diverges — consistent with the guide's "independent branches from a shared analysis baseline."
- Confirmed: `/compact` and named-session `--resume` are both real, current Claude Code features.

### `.claude/rules/` YAML frontmatter `paths:` field
- Confirmed as documented, current Claude Code behavior (matches Task Statement 3.3 exactly).
- **Caveat (informational only, not exam-relevant):** several open GitHub issues (anthropics/claude-code #17204, #13905, #21858, #22170) report the documented `paths:` frontmatter sometimes failing to load in certain configurations (an undocumented `globs:` key reportedly works more reliably in some versions; user-level rules with `paths:` allegedly never load as of early 2026). This is implementation trivia — the exam tests the *documented* `paths:` behavior, so no study-content change was made, but it's worth knowing if you hit this in real usage.

### Claude Code CLI flags for CI/CD
Confirmed current and accurate: `-p`/`--print` for non-interactive mode, `--output-format json` + `--json-schema` for schema-validated output (returned in a `structured_output` field). Matches Task Statement 3.6 and this repo's content exactly.

### Message Batches API
Confirmed current: 50% discount on input+output tokens vs the synchronous Messages API, up to 24-hour processing window (often faster in practice, but the SLA is 24h), `custom_id` correlates request/response pairs, no multi-turn tool-calling mid-batch, up to 100k requests per batch. Matches Task Statement 4.5 and this repo's content exactly.

### MCP `isError` / tools vs resources
Confirmed current: `isError: true` in a CallToolResult signals tool-execution failure (vs a protocol-level JSON-RPC error); best practice distinguishes protocol errors from tool errors via descriptive `content`. Resources are app-driven context (the app decides when to fetch/pass them) vs tools which are model-controlled. Matches Domain 2 content and this repo's `antipatterns.js`/`d2.js` exactly.

---

# Part 3 — Sync Log: What Was Checked and What Changed (2026-07-22)

Full diff performed: the entire new v0.2 PDF (Part 1 above) against every study-content file
in the repo (`data/d1.js`–`d5.js`, `data/exam-d1.js`–`exam-d5.js` [279 questions total],
`data/scenarios.js` [6 scenarios], `data/antipatterns.js` [38 anti-patterns]), plus
`README.md`, `SESSION-HANDOFF.md`, and `app.js`'s exam-engine configuration.

## Confirmed accurate — no change needed
- Domain names, weights (27/18/20/20/15), and all task-statement content in `data/d2.js`, `data/d4.js`, `data/d5.js` — full match against Domains 2, 4, 5.
- `data/d1.js`'s Task→Agent tool rename note (v2.1.63) — independently verified against official docs (Part 2).
- All `.claude/rules/` `paths:` glob behavior, Message Batches API facts, MCP `isError` semantics, and Claude Code CLI flags (`-p`, `--output-format json`, `--json-schema`) across all files.
- `data/antipatterns.js`'s 38 entries — none teach anything on the guide's Out-of-Scope list (fine-tuning, RLHF, computer use, vision, streaming API, OAuth, cloud-provider specifics, prompt-caching internals, tokenization); all 18 In-Scope Topics bullets are covered somewhere across `antipatterns.js` + `d1–d5.js`.
- `data/exam-d1.js` through `exam-d5.js` — 49+50+60+60+60 = 279 questions, topic-tag ranges match each domain's task-statement count exactly, and a sample across all five files closely mirrors the guide's 12 official sample questions in structure and rigor.
- Exam mechanics already correctly stated in `README.md`/`SESSION-HANDOFF.md` prose (60 Q / 120 min / weights / 72% pass mark) — only `app.js`'s actual *default* was wrong (see below).

## Fixed: `data/d3.js` + `data/antipatterns.js` (`ap11b`) + `data/exam-d3.js` (`d3.2-extra-6`)
1. **"Commands and skills are now one unified system" overstatement.** The underlying merge is real (Jan 2026), but the guide tests them as two separate things (see Part 2). Rewrote:
   - `d3.js` §3.2 deep-dive body, `examFocus`, `quickRef`, `STUDY_CONTENT.D3` topic `d3.2` (`intro`, `concepts`), and both flashcards mentioning it — now teach project-scoped `.claude/commands/` vs `.claude/skills/`+SKILL.md as the primary framing, with the real-world unification kept as a single explicit footnote callout.
   - `exam-d3.js` id `d3.2-extra-6` — this was a **graded** question whose correct answer asserted the unification claim. Rewrote the question, options, and rationales to test the guide's actual distinction (plain command files vs SKILL.md frontmatter capabilities) instead.
2. **"There is no @import keyword" phrasing.** Technically correct (the literal syntax is bare `@path`, no reserved word) but read as if disputing the guide's own name for the feature ("the @import syntax"). Softened wording in `d3.js` (5 locations) and `antipatterns.js` `ap11b` to state both: the guide's name for the feature, and the literal syntax with no reserved keyword.

## Fixed: `data/scenarios.js` — domain-coverage gaps
Every scenario's `domainsTested` list previously covered fewer domains than the guide's own "Primary domains" tag for that scenario. Added one new decision/question per missing domain and updated `focus`/`domainsTested`/`strategy` accordingly:
- **Scenario 1** (guide: D1+D2+D5) — added a D2 tool-description decision (mirrors official Sample Q2); was D1+D5 only.
- **Scenario 2** (guide: D3+D5) — added a D5 stale-context/`--resume` decision; was D3 only.
- **Scenario 3** (guide: D1+D2+D5) — added a D2 scoped-tool (`verify_fact`) decision (mirrors official Sample Q9); was D1+D5 only.
- **Scenario 4** (guide: D1+D2+D3) — added a D1 agentic-loop decision and a D3 plan-mode decision; was D2 only.
- **Scenario 5** (guide: D3+D4) — retagged the Batches-API tradeoff decision from D3 to D4 (it's Task Statement 4.5 content, not 3.6); the `--output-format json` decision correctly stays D3.
- **Scenario 6** (guide: D4+D5) — added a D5 aggregate-accuracy/stratified-sampling decision; was D4 only.

## Fixed: `app.js` — Real Exam Simulation timer default
Defaulted to `time: 90` (90 minutes) despite the certification being unambiguously 60 questions in **120 minutes** (confirmed 3 independent ways in Part 2). Changed the default to 120; `timeOptions` already included 120 as a selectable value, so this was a default-value bug, not a missing feature. The separate, intentionally-lighter Mock Exam mode (`count: 40, time: 60`) was left untouched — it's not meant to replicate the real exam 1:1.

## Fixed: `README.md` / `SESSION-HANDOFF.md`
Neither file had ever recorded a guide version number. Added a pointer to this file (`CONTEXT.md`) in `README.md`, updated the Real Exam Simulation bullet to state "60 questions in 120 minutes" explicitly, and added a dated changelog entry to `SESSION-HANDOFF.md` summarizing all of the above.

## Verification performed
- `node --check` on every edited `.js` file (`data/d3.js`, `data/antipatterns.js`, `data/exam-d3.js`, `data/scenarios.js`, `app.js`) — all pass.
- Local static server smoke test — `index.html`, `app.js`, `styles.css`, and all 14 `data/*.js` files serve 200.
