/*
 * Domain 3 — Claude Code Configuration & Workflows  (~20% of exam)
 * Source: claudecertificationguide.com  (sections 3.1–3.6)
 *
 * Additively populates the shared globals for Domain 3 only:
 *   window.DOMAIN_DEEPDIVE.D3   — the "Domains" deep-dive view
 *   window.STUDY_CONTENT.D3     — the "Study Guide" view
 *   window.QUESTIONS (+= D3)    — the "Domain Quiz" / "Mock Exam" banks
 *   window.FLASHCARDS (+= D3)   — the "Flashcards" view
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
  // DEEP DIVE  — window.DOMAIN_DEEPDIVE.D3
  // ==========================================================================
  window.DOMAIN_DEEPDIVE.D3 = {
    number: 3,
    weight: "~20%",
    title: "Claude Code Configuration & Workflows",
    tagline: "Configuring Claude Code correctly — memory hierarchy, skills, path-scoped rules, execution modes, refinement, and CI/CD.",
    why: "This domain is full of **scoping and mechanism** questions with one recurring theme: **`.claude/` (project) is shared via git; `~/.claude/` (user) is personal.** It also tests precise facts — CLAUDE.md is *concatenated guidance*, not a precedence layer (move hard rules to `settings.json`/hooks); the `@path` import syntax; path-scoped `.claude/rules/`; ambiguity (not difficulty) picks plan vs direct; examples-before-prose for refinement; and the **`-p` flag** for non-interactive CI.",

    sections: [
      // ---- 3.1 CLAUDE.md Hierarchy --------------------------------------
      {
        heading: "3.1 — CLAUDE.md Hierarchy, Scoping & Modular Organisation",
        body: [
          { type: "p", text: "Claude Code reads CLAUDE.md at **three levels**: **user** (`~/.claude/CLAUDE.md`, personal, not in git), **project** (`.claude/CLAUDE.md` or root `CLAUDE.md`, version-controlled, shared with everyone who clones), and **directory** (a `CLAUDE.md` in a subdirectory, applying to that directory only)." },
          { type: "callout", kind: "key", text: "CLAUDE.md is **not** a strict-precedence config — all discovered files are **concatenated into context**, not overriding each other. Load order runs broadest → most specific (root down to your working dir; `CLAUDE.local.md` appended after `CLAUDE.md`), but if two rules contradict, Claude may pick one arbitrarily. CLAUDE.md is delivered as a *user message*, not the system prompt — no guarantee of strict compliance." },
          { type: "callout", kind: "warn", text: "Don't confuse CLAUDE.md with `settings.json`. **`settings.json` has a strict precedence chain** (managed > local > project > user, managed always wins) and is **enforced by the client**. CLAUDE.md only *shapes* behaviour. If a rule must hold every run (blocked tool, required formatter, permission policy), encode it in `settings.json` or a **hook** — not CLAUDE.md scoping. Reject distractors claiming \"more specific scope wins\" or \"user overrides project.\"" },
          { type: "p", text: "**Modular organisation** uses `@path` imports — the directive is just `@` followed by a path (there is **no `@import` keyword**). Each `@<path>` line is inlined at load time. But imports load **eagerly**: splitting a 600-line file into six 100-line imports makes the *source* nicer but the context Claude sees is the same size. To actually shrink per-session context, use path-scoped `.claude/rules/` (see 3.3)." },
          { type: "code", lang: "markdown", body: "# .claude/CLAUDE.md\nCoding standards:\n\n@./standards/naming-conventions.md\n@./standards/error-handling.md\n@./standards/testing-requirements.md" },
          { type: "p", text: "**`CLAUDE.local.md`** sits next to `CLAUDE.md` at any level, loads after it (last word on conflicts at that level), is gitignored by convention, and is for your own per-repo quirks — a project-scoped version of `~/.claude/CLAUDE.md`. The **`.claude/rules/`** directory is an alternative holding topic-specific rule files; without frontmatter they load for all sessions. The **`/memory`** command **reveals which memory files are loaded — it does NOT load them**; use it to diagnose, not to activate." },
          { type: "callout", kind: "warn", text: "The favourite trap: a **new team member gets inconsistent behaviour** while a veteran's Claude follows all conventions. Root cause is always that the conventions live in the veteran's **user-level `~/.claude/CLAUDE.md`** (not shared via git), so the new dev never received them. Fix: move them to **project-level** `.claude/CLAUDE.md`." }
        ]
      },

      // ---- 3.2 Custom Slash Commands and Skills -------------------------
      {
        heading: "3.2 — Custom Slash Commands and Skills",
        body: [
          { type: "p", text: "Commands and skills are now one **unified Skills system**. Files at either `.claude/skills/` (canonical) or `.claude/commands/` (backward-compatible alias) create identical `/commands`. E.g. `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy`." },
          { type: "callout", kind: "key", text: "The scoping pattern is consistent across Claude Code: **project (`.claude/`) is shared via git; user (`~/.claude/`) is personal.** This applies to CLAUDE.md, commands/skills, and rules. Both `.claude/commands/` and `.claude/skills/` are project-scoped and equivalent." },
          { type: "p", text: "`.claude/skills/` adds optional **YAML frontmatter**, a supporting-files directory, and auto-discovery. The three critical frontmatter options:" },
          { type: "bullets", items: [
            "**`context: fork`** — runs the skill in an isolated sub-agent so verbose output stays contained and the main conversation stays clean. Essential for codebase analysis, brainstorming, any noisy exploratory task. Without it, skill output floods the context window.",
            "**`allowed-tools`** — restricts which tools the skill can use (a security boundary): a read-only analysis skill should not have Write or Bash.",
            "**`argument-hint`** — prompts the developer for required parameters when invoked without arguments."
          ] },
          { type: "code", lang: "yaml", body: "---\ncontext: fork\nallowed-tools:\n  - Read\n  - Grep\n  - Glob\nargument-hint: \"Provide a feature description or area of the codebase to analyse\"\n---" },
          { type: "callout", kind: "warn", text: "**Skills vs CLAUDE.md** (tested directly): Skills are **on-demand, task-specific workflows** — their descriptions stay in context so Claude knows they exist, but the body loads only when invoked (explicitly via `/name`, or auto when the description/`paths` matches). CLAUDE.md (and `.claude/rules/`) are **always-loaded** standards. Don't put task-specific procedures in CLAUDE.md; don't put always-on reference material in a skill. For always-on conventions on a file type, use path-scoped `.claude/rules/` — not a skill." },
          { type: "p", text: "Personal customisation: create variants in `~/.claude/skills/` with a **different name** (e.g. `/deep-analyse`) so they don't conflict with the team's `/analyse`. Putting a team-shared command in a user path is the classic scoping error." }
        ]
      },

      // ---- 3.3 Path-Specific Rules --------------------------------------
      {
        heading: "3.3 — Path-Specific Rules for Conditional Convention Loading",
        body: [
          { type: "p", text: "Path-specific rules apply conventions **conditionally based on which files you edit** — solving what neither root nor directory CLAUDE.md handle: conventions for a *file type spread across many directories*. Rule files live in `.claude/rules/` with YAML frontmatter `paths` glob patterns; the rules load only when you edit matching files." },
          { type: "code", lang: "yaml", body: "---\npaths: [\"**/*.test.ts\", \"**/*.test.tsx\", \"**/*.spec.ts\"]\n---\n# Test Conventions\n- Use describe/it blocks with sentence-like names\n- Each file needs a happy path and an error case\n- Use factory functions for test data, not inline literals\n- Mock at the module boundary; assert behaviour, not implementation" },
          { type: "callout", kind: "key", text: "Glob patterns match **across the entire codebase**: one `**/*.test.tsx` rule covers every test file in every directory. Path-scoped rules are also more **token-efficient** than root CLAUDE.md — they load ONLY when editing matching files, keeping irrelevant conventions (Terraform rules while editing React) out of context." },
          { type: "p", text: "**Why not directory-level CLAUDE.md?** Tests co-located across 50+ directories would need a copy per directory — duplication, drift, and a copy for every new directory. **Why not root CLAUDE.md?** It loads for *every* session regardless of which files you touch, wasting tokens." },
          { type: "callout", kind: "warn", text: "Both skills and `.claude/rules/` can auto-activate via a `paths` field, but they differ: **rules stay in context as background guidance shaping every matching edit; skills load on-demand as task-style workflows.** When the question asks about automatic, always-on convention loading for a file type, the answer is **path-specific rules**, not a skill, not a per-directory CLAUDE.md, not root CLAUDE.md." }
        ]
      },

      // ---- 3.4 Plan Mode vs Direct Execution ----------------------------
      {
        heading: "3.4 — Plan Mode vs Direct Execution",
        body: [
          { type: "p", text: "Two modes. **Plan mode** is for complex tasks needing exploration and design before changes: large-scale/architectural restructuring, multiple valid approaches, multi-file modifications (e.g. a 45-file migration), or codebase exploration. Claude reads and analyses *without modifying files*. **Direct execution** is for well-understood, limited-scope changes where the approach is already known: a single-file bug fix with a clear stack trace, a validation conditional, a config value." },
          { type: "callout", kind: "key", text: "The decision is about **ambiguity, not difficulty**. A *difficult but well-defined* bug fix (clear stack trace, single function, known cause) is direct execution. A *simple-sounding* feature that could be built three ways and touches multiple modules is plan mode." },
          { type: "p", text: "The **Explore subagent** isolates verbose discovery output (file listings, dependency graphs, excerpts) from the main conversation — it runs exploration in isolation and returns summaries, keeping the main context clean for implementation." },
          { type: "p", text: "The **hybrid: plan THEN execute** is common and tested — plan mode to investigate/design, then direct execution to implement file-by-file. Example: a logging-library migration across 30 files — plan the migration pattern and edge cases, then apply it consistently." },
          { type: "callout", kind: "warn", text: "Trap: starting in direct execution and switching to plan mode only **if** complexity emerges. When the requirements already state the task is complex (\"restructure the monolith into microservices\"), choose plan mode **upfront** — the complexity is stated, not speculative." }
        ]
      },

      // ---- 3.5 Iterative Refinement Techniques --------------------------
      {
        heading: "3.5 — Iterative Refinement Techniques",
        body: [
          { type: "p", text: "Working with Claude Code is iterative; there's a clear **technique hierarchy** for guiding it to the right result:" },
          { type: "bullets", items: [
            "**Concrete input/output examples** — most effective when prose is interpreted inconsistently. 2–3 before/after pairs let the model generalise more reliably than any prose. The *first* thing to reach for on inconsistent interpretation.",
            "**Test-driven iteration** — most effective for complex transformations with many edge cases. Write tests first (happy path, edge cases, perf), then share the failures: \"Expected X, got Y\" is unambiguous feedback.",
            "**Interview pattern** — most effective in unfamiliar domains: have Claude ask clarifying questions before implementing, surfacing considerations (cache invalidation, TTL, consistency, failure modes) you'd miss."
          ] },
          { type: "callout", kind: "key", text: "Don't confuse the techniques: the **interview pattern** is for *unfamiliar domains* (you might miss considerations); **concrete examples** are for when you *know the exact transformation* but the model interprets it inconsistently. Different problems, different fixes." },
          { type: "p", text: "**Batch vs sequential feedback**: deliver fixes in a **single message when they interact** (e.g. error-code field + structured logging of it + SDK type changes — the model needs all constraints at once). Iterate **sequentially when issues are independent** (naming vs indentation) so batching doesn't confuse which feedback applies where." },
          { type: "callout", kind: "warn", text: "Trap: refining the *prose* with more precise language when the model interprets it inconsistently. More precise prose still relies on interpretation — the answer is **concrete examples first**, not better prose. Two or three well-chosen examples (standard case + a key edge case) are enough; you don't need every case." }
        ]
      },

      // ---- 3.6 CI/CD Integration ----------------------------------------
      {
        heading: "3.6 — CI/CD Integration",
        body: [
          { type: "p", text: "In CI, Claude Code becomes an automated review/generation engine. Claude Code defaults to **interactive mode**; in a pipeline there's no keyboard, so without the right flag the job **hangs forever** waiting for input." },
          { type: "callout", kind: "key", text: "The **`-p` (`--print`) flag** runs Claude Code non-interactively: it processes the prompt, prints to stdout, and exits. This is the single most directly-tested fact in Domain 3 (sample Q10). When a CI job hangs with logs showing Claude waiting for input, the answer is **`-p`** — NOT `CLAUDE_HEADLESS=true` (doesn't exist), NOT `--batch` (doesn't exist), NOT stdin redirection from /dev/null." },
          { type: "code", lang: "bash", body: "# WRONG -- hangs in CI\nclaude \"Analyse this pull request for security issues\"\n\n# CORRECT -- non-interactive print mode\nclaude -p \"Analyse this pull request for security issues\"" },
          { type: "p", text: "**Structured output**: `--output-format json` forces JSON; `--json-schema` enforces a specific structure, so automated systems can parse findings, post them as inline PR comments at exact file/line, filter by severity, and track across runs." },
          { type: "callout", kind: "warn", text: "**Session context isolation**: the same session that generated code is weaker at reviewing it — it retains the reasoning that justified its choices. Use an **independent review invocation** (separate `claude -p`, no shared context) to evaluate code on its own merits. Connects to Domain 4 (multi-instance review) and Domain 5 (context management)." },
          { type: "p", text: "**Incremental review context**: include prior findings and instruct Claude to report only *new* or *still-unaddressed* issues — otherwise every push re-reports the same comments and developers stop reading them. **CLAUDE.md for CI**: Claude reads it in CI too, so testing standards, fixtures, and review criteria there make generated output follow team patterns instead of boilerplate; include existing tests to avoid duplicate suggestions." },
          { type: "callout", kind: "warn", text: "**Batch API vs real-time**: the Message Batches API saves ~50% but has up to 24-hour processing and no latency SLA. **Pre-merge (blocking) checks → real-time/synchronous** (developers wait). **Overnight debt reports, weekly audits, nightly test generation → Batch API** (latency-tolerant). Using Batch for a blocking pre-merge check is the trap (sample Q11)." }
        ]
      }
    ],

    examFocus: [
      "The scoping pattern everywhere: .claude/ (project, shared via git) vs ~/.claude/ (user, personal).",
      "CLAUDE.md is concatenated guidance, not precedence; hard rules go in settings.json or hooks. /memory diagnoses, doesn't load.",
      "Diagnosing the new-team-member trap: conventions stuck in user-level config instead of project-level.",
      "@path import syntax (no @import keyword); imports load eagerly; use .claude/rules/ to actually shrink context.",
      "Skills (on-demand workflows) vs CLAUDE.md/.claude/rules (always-on); context: fork, allowed-tools, argument-hint.",
      "Path-specific rules with glob patterns for a file type across many directories — token-efficient, conditional loading.",
      "Plan vs direct by ambiguity not difficulty; plan-then-execute hybrid; Explore subagent; choose plan upfront for stated complexity.",
      "Refinement hierarchy: examples-before-prose, test-driven for complex, interview for unfamiliar; batch interacting fixes, sequence independent ones.",
      "CI: the -p flag for non-interactive; JSON + json-schema output; independent review session; incremental context; Batch vs real-time."
    ],

    quickRef: [
      "Project = .claude/ (shared via git). User = ~/.claude/ (personal). Same pattern for CLAUDE.md, skills, rules.",
      "CLAUDE.md = concatenated guidance, conflicts may resolve arbitrarily. Hard enforcement → settings.json (client-enforced) or hooks.",
      "settings.json precedence: managed > local > project > user (managed always wins).",
      "@path imports inline eagerly (no @import keyword). Shrink context with path-scoped .claude/rules/, not imports.",
      "/memory reveals loaded memory files; it does not load them.",
      "New-member inconsistency → conventions in ~/.claude/CLAUDE.md; move to project .claude/CLAUDE.md.",
      ".claude/skills/ (canonical) == .claude/commands/ (alias). Frontmatter: context:fork, allowed-tools, argument-hint.",
      "Skills = on-demand workflows; CLAUDE.md/.claude/rules = always-on. Don't swap them.",
      "Path rules: .claude/rules/*.md with paths globs; load only for matching files; cover a type across many dirs.",
      "Plan vs direct = ambiguity, not difficulty. Plan-then-execute for migrations. Explore subagent isolates discovery.",
      "Refinement: examples-first (inconsistent prose) · tests (complex) · interview (unfamiliar). Batch interacting, sequence independent.",
      "CI: -p / --print (non-interactive) · --output-format json + --json-schema · independent review session · incremental findings · Batch API only for non-blocking."
    ]
  };

  // ==========================================================================
  // STUDY GUIDE  — window.STUDY_CONTENT.D3
  // ==========================================================================
  window.STUDY_CONTENT.D3 = {
    title: "Domain 3 — Claude Code Configuration & Workflows",
    weight: "~20%",
    summary: "Configuring Claude Code's memory hierarchy and skills, scoping conventions with path-specific rules, choosing plan vs direct execution, refining output iteratively, and integrating Claude Code into CI/CD.",
    examTips: [
      "<strong>.claude/ = project (shared via git); ~/.claude/ = user (personal).</strong> This single pattern answers many Domain 3 questions.",
      "CLAUDE.md is <strong>concatenated guidance, not precedence</strong> — for guaranteed enforcement use settings.json or a hook. <strong>/memory diagnoses, it doesn't load.</strong>",
      "New team member gets inconsistent behaviour? Conventions are in <strong>user-level config</strong>; move them to <strong>project-level</strong>.",
      "Path-specific <strong>.claude/rules/</strong> with glob paths handle a file type across many directories and load only when relevant.",
      "Plan vs direct is about <strong>ambiguity, not difficulty</strong>. For inconsistent prose, switch to <strong>concrete examples first</strong>.",
      "CI job hanging on input? The fix is the <strong>-p (--print)</strong> flag. Use Batch API only for non-blocking workflows."
    ],
    topics: [
      {
        id: "d3.1",
        title: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
        intro: "Three levels of CLAUDE.md, why it's concatenated guidance (not precedence), @path imports, and the new-team-member trap.",
        concepts: [
          "Three levels: user (~/.claude/CLAUDE.md, personal, not in git), project (.claude/CLAUDE.md or root CLAUDE.md, shared), directory (subdirectory CLAUDE.md, that directory only).",
          "All discovered CLAUDE.md files are concatenated into context, not overriding each other; load order is broadest -> most specific; conflicts may resolve arbitrarily.",
          "CLAUDE.md is delivered as a user message with no guarantee of strict compliance; settings.json (managed>local>project>user) is client-enforced.",
          "@path imports inline files eagerly (no @import keyword); they don't shrink context — path-scoped .claude/rules/ does.",
          "CLAUDE.local.md loads after CLAUDE.md at a level (gitignored by convention); /memory reveals loaded memory files, it does not load them."
        ],
        antiPatterns: [
          "Storing team conventions in user-level ~/.claude/CLAUDE.md (not shared) so new members never receive them.",
          "Thinking /memory triggers loading — it only reveals what's already loaded.",
          "Relying on CLAUDE.md scoping to enforce a must-hold rule instead of settings.json or a hook.",
          "Believing 'more specific scope wins' or 'user overrides project' for CLAUDE.md — the docs never claim that."
        ],
        deepDive: [
          "The new-team-member trap (exam favourite): a veteran's Claude follows all conventions but a new dev on the same repo/branch gets inconsistent results. Root cause is always that the conventions live in the veteran's user-level ~/.claude/CLAUDE.md, which git doesn't share. Fix: move them to project-level .claude/CLAUDE.md. When you see 'new team member' + 'inconsistent behaviour', check where the config lives.",
          "For rules that must hold every run (blocked tool, required formatter, permission policy), use settings.json (enforced by the client regardless of what Claude decides) or a hook (fires at a fixed lifecycle event). CLAUDE.md shapes behaviour but is not a hard enforcement layer."
        ],
        code: {
          title: "@path imports in CLAUDE.md (no @import keyword)",
          body: "# .claude/CLAUDE.md\nCoding standards:\n\n@./standards/naming-conventions.md\n@./standards/error-handling.md\n@./standards/testing-requirements.md"
        },
        compare: {
          bad: "Team API conventions in ~/.claude/CLAUDE.md -> new dev never gets them",
          good: "Team API conventions in .claude/CLAUDE.md -> shared via git on clone"
        },
        examTip: "New member + inconsistent behaviour = conventions in user-level config; move to project-level. For guaranteed enforcement, settings.json or a hook, never CLAUDE.md scoping."
      },
      {
        id: "d3.2",
        title: "Custom Slash Commands and Skills",
        intro: "The unified Skills system, project vs user scoping, SKILL.md frontmatter, and skills-vs-CLAUDE.md.",
        concepts: [
          "Commands and skills are unified: .claude/skills/ (canonical) and .claude/commands/ (alias) both create identical /commands.",
          ".claude/skills/ SKILL.md adds optional YAML frontmatter, a supporting-files dir, and auto-discovery.",
          "Frontmatter: context: fork (isolated sub-agent, keeps verbose output out of main context); allowed-tools (security boundary); argument-hint (prompts for params).",
          "Scoping pattern: project .claude/ is shared via git; user ~/.claude/ is personal. Both .claude/ command paths are equivalent.",
          "Skills are on-demand task workflows (descriptions stay in context, body loads on invocation); CLAUDE.md/.claude/rules are always-loaded."
        ],
        antiPatterns: [
          "Placing a team-shared command in a user path (~/.claude/commands/ or ~/.claude/skills/) instead of project scope.",
          "Treating skills like CLAUDE.md for always-on guidance.",
          "Omitting context: fork for verbose skills, polluting the main context window.",
          "Putting task-specific workflows in CLAUDE.md (it's for always-loaded universal standards)."
        ],
        deepDive: [
          "Skills vs CLAUDE.md (tested directly): API naming conventions that must apply to every code-gen task belong in CLAUDE.md (or .claude/rules/); a multi-step codebase-analysis workflow run occasionally belongs in a skill. For conventions tied to a file type (e.g. test files), path-scoped .claude/rules/ is best because it loads as always-on context alongside matching files.",
          "context: fork runs the skill in an isolated sub-agent and returns only a summary to the main conversation — essential for codebase analysis or brainstorming whose verbose output would otherwise fill the context window and degrade later responses."
        ],
        code: {
          title: "SKILL.md frontmatter",
          body: "---\ncontext: fork\nallowed-tools:\n  - Read\n  - Grep\n  - Glob\nargument-hint: \"Provide a feature description or area to analyse\"\n---"
        },
        compare: {
          bad: "Team /review placed in ~/.claude/commands/ (personal, not shared)",
          good: "Team /review in .claude/commands/ (project, shared); personal /brainstorm in ~/.claude/skills/ with context: fork"
        },
        examTip: "Always-on conventions for a file type -> CLAUDE.md or .claude/rules/, not a skill. Verbose exploratory skill -> context: fork. Team command -> project scope."
      },
      {
        id: "d3.3",
        title: "Path-Specific Rules for Conditional Convention Loading",
        intro: "Glob-scoped rule files that load only when editing matching files — for a file type spread across many directories.",
        concepts: [
          "Rule files in .claude/rules/ with YAML frontmatter paths globs load only when you edit matching files.",
          "Glob patterns match across the entire codebase: one **/*.test.tsx rule covers every test file in every directory.",
          "Path-scoped rules are more token-efficient than root CLAUDE.md — irrelevant conventions don't load.",
          "Without a paths frontmatter, .claude/rules/ files load for all sessions.",
          "Rules stay in context as background guidance for matching edits; skills load on-demand as task workflows."
        ],
        antiPatterns: [
          "Choosing directory-level CLAUDE.md for cross-directory conventions (a copy per directory — duplication and drift).",
          "Putting file-type conventions in root CLAUDE.md (loads every session regardless of which files you edit).",
          "Using a skill for automatic, always-on convention loading for a file type.",
          "Expecting glob rules to require manual activation — they load automatically for matching files."
        ],
        deepDive: [
          "Exam favourite: test files co-located with source across 50+ directories (Button.test.tsx next to Button.tsx). The maintainable answer is one .claude/rules/ file with paths: ['**/*.test.tsx','**/*.test.ts']. Directory CLAUDE.md would need 50+ copies; root CLAUDE.md wastes tokens on every session; a skill requires invocation.",
          "Separating rules by path (testing.md, api-conventions.md, terraform.md) means Terraform rules never consume tokens during React/API work — /memory while editing a test file shows testing.md loaded but not the API or Terraform rules."
        ],
        code: {
          title: "Path-scoped rule file",
          body: "---\npaths: [\"**/*.test.ts\", \"**/*.test.tsx\", \"**/*.spec.ts\"]\n---\n# Test Conventions\n- describe/it blocks with sentence-like names\n- happy path + error case per file\n- factory functions for test data; mock at module boundary"
        },
        compare: {
          bad: "Put test conventions in a CLAUDE.md inside every directory that has tests",
          good: "One .claude/rules/testing.md with paths: ['**/*.test.tsx','**/*.test.ts']"
        },
        examTip: "Conventions for a file type across many directories = path-specific rules with glob patterns. They load only for matching files (token-efficient)."
      },
      {
        id: "d3.4",
        title: "Plan Mode vs Direct Execution",
        intro: "Choose by ambiguity, not difficulty; use the Explore subagent; and apply the plan-then-execute hybrid.",
        concepts: [
          "Plan mode: explore and design before changes — architectural restructuring, multiple valid approaches, multi-file modifications, codebase exploration. No files modified during planning.",
          "Direct execution: well-scoped, known-approach changes — single-file bug fix with a clear stack trace, a validation conditional, a config value.",
          "The decision is about ambiguity, not difficulty: a hard but well-defined fix is direct; a simple-sounding multi-approach feature is plan.",
          "The Explore subagent isolates verbose discovery output and returns summaries, keeping the main context clean.",
          "Hybrid plan-then-execute: plan the strategy, then switch to direct execution to implement it file by file."
        ],
        antiPatterns: [
          "Defaulting to direct execution for multi-file architectural changes (risks costly rework).",
          "Using plan mode for a single-file fix with a clear stack trace (unnecessary overhead).",
          "Not recognising the plan-then-execute hybrid for migrations.",
          "Starting direct and switching to plan only when complexity emerges, even though the requirements already state it's complex."
        ],
        deepDive: [
          "Three-task scenario: (1) restructure a monolith into microservices -> plan mode; (2) fix a null pointer in one function with a clear stack trace -> direct execution; (3) migrate a logging library across 30 files -> plan then direct execution. Plan for (1) and (3); direct for (2).",
          "When complexity is stated in the requirements ('restructure the monolith'), choose plan mode upfront — the complexity is known, not speculative. Waiting for surprises is the wrong approach."
        ],
        code: {
          title: "Plan-then-execute (library migration across 30 files)",
          body: "// Plan phase: find all importers of the old library, map API\n//   differences, design the migration pattern, check edge cases.\n// Execute phase: apply the planned pattern to each file consistently."
        },
        compare: {
          bad: "Direct-execute a monolith->microservices restructure with big upfront instructions",
          good: "Plan mode to design service boundaries, then direct execution to implement"
        },
        examTip: "Ambiguity, not difficulty, decides. Stated complexity -> plan upfront. Migration across many files -> plan then execute. Verbose discovery -> Explore subagent."
      },
      {
        id: "d3.5",
        title: "Iterative Refinement Techniques",
        intro: "A hierarchy of techniques — examples, tests, interview — plus when to batch vs sequence feedback.",
        concepts: [
          "Concrete input/output examples are the first fix for inconsistent prose interpretation; 2-3 before/after pairs generalise reliably.",
          "Test-driven iteration is most effective for complex transformations: write tests first, share failures ('Expected X, got Y') as unambiguous feedback.",
          "The interview pattern suits unfamiliar domains: have Claude ask questions before implementing to surface missed considerations.",
          "Batch interacting fixes into one message so the model sees all constraints at once.",
          "Sequence independent issues one at a time so batching doesn't confuse which feedback applies where."
        ],
        antiPatterns: [
          "Rewriting prose with more precise language when the model interprets it inconsistently — prose still relies on interpretation.",
          "Confusing the interview pattern (unfamiliar domain) with concrete examples (known transformation, inconsistent output).",
          "Batching independent issues, confusing the model about which feedback applies where.",
          "Sequencing interacting fixes, so each fix conflicts with the next."
        ],
        deepDive: [
          "When prose is interpreted differently each run: observe the inconsistency, switch to 2-3 concrete before/after examples, verify the model generalises on a new case, and add an edge-case example only if needed. Two or three well-chosen examples (standard + a key edge case) are enough.",
          "Batch when fixes interact (error responses gain an error-code field, logging must include it, and SDK type defs must reflect it — all in one message). Sequence when independent (fix naming to camelCase first, then update indentation)."
        ],
        code: {
          title: "Concrete examples beat prose",
          body: "Input:  getUserData(userId: string): Promise<UserData>\nOutput: getUserData(userId: string): Promise<Result<UserData, ApiError>>\n\nInput:  fetchOrders(customerId: string): Promise<Order[]>\nOutput: fetchOrders(customerId: string): Promise<Result<Order[], ApiError>>"
        },
        compare: {
          bad: "Rewrite the prose description with more precise technical language",
          good: "Provide 2-3 concrete input/output examples of the exact transformation"
        },
        examTip: "Inconsistent interpretation -> examples first (not better prose). Complex + edge cases -> tests. Unfamiliar domain -> interview. Interacting fixes -> batch; independent -> sequence."
      },
      {
        id: "d3.6",
        title: "CI/CD Integration",
        intro: "The -p flag, structured JSON output, independent review sessions, incremental context, and Batch vs real-time.",
        concepts: [
          "Claude Code defaults to interactive mode; in CI without a keyboard it hangs. The -p (--print) flag runs non-interactively: process prompt, print to stdout, exit.",
          "--output-format json forces JSON; --json-schema enforces structure so systems can post inline PR comments at exact file/line and filter by severity.",
          "Session context isolation: the session that generated code is weaker at reviewing it; use an independent review invocation with no shared context.",
          "Incremental review context: include prior findings and report only new/unaddressed issues to avoid duplicate comments that erode trust.",
          "Batch API saves ~50% but has up to 24h processing and no latency SLA: real-time for blocking pre-merge checks, Batch for overnight/weekly non-blocking work."
        ],
        antiPatterns: [
          "Forgetting -p so the CI job hangs waiting for input; or reaching for CLAUDE_HEADLESS=true / --batch / stdin redirection (none are the fix).",
          "Self-reviewing generated code in the same session instead of an independent instance.",
          "Using the Batch API for blocking pre-merge checks (no latency SLA).",
          "Omitting prior findings so each run re-reports the same comments."
        ],
        deepDive: [
          "The -p flag is the single most directly-tested fact in Domain 3 (sample Q10): a CI job hangs, logs show Claude waiting for input — the fix is -p / --print. CLAUDE_HEADLESS=true and --batch do not exist; stdin redirection from /dev/null doesn't properly address interactive mode.",
          "Batch vs real-time (sample Q11): pre-merge checks are blocking (developers wait) -> real-time/synchronous. Overnight technical-debt reports, weekly audits, and nightly test generation are latency-tolerant -> Batch API for the 50% savings. Claude reads CLAUDE.md in CI too, so testing standards/fixtures there make generated tests follow team patterns; include existing tests to avoid duplicates."
        ],
        code: {
          title: "Non-interactive CI invocation with structured output",
          body: "claude -p \\\n  --output-format json \\\n  --json-schema '{\"type\":\"object\",\"properties\":{\"findings\":{\"type\":\"array\"}}}' \\\n  \"Review this PR for security issues\""
        },
        compare: {
          bad: "claude \"Analyse this PR\"            # hangs in CI waiting for input",
          good: "claude -p \"Analyse this PR\"         # non-interactive print mode"
        },
        examTip: "CI hang on input = the -p flag. Machine output = --output-format json + --json-schema. Review in an independent session. Batch API only for non-blocking workflows."
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
  var D3_FLASHCARDS = [
    { front: "What are the three CLAUDE.md levels?", back: "User (~/.claude/CLAUDE.md, personal, not in git), Project (.claude/CLAUDE.md or root CLAUDE.md, version-controlled, shared), Directory (subdirectory CLAUDE.md, that directory only)." },
    { front: "Is CLAUDE.md a strict-precedence config?", back: "No. All discovered files are concatenated into context (not overriding). Load order is broadest -> most specific, but conflicting rules may resolve arbitrarily. It's a user message with no guarantee of strict compliance." },
    { front: "Where do you put a rule that MUST hold every run?", back: "settings.json (client-enforced, precedence managed>local>project>user) or a hook (fixed lifecycle event). CLAUDE.md shapes behaviour but is not a hard enforcement layer." },
    { front: "What is the CLAUDE.md import syntax?", back: "Just @ followed by a path on its own line (e.g. @./standards/naming.md). There is NO @import keyword. Imports inline eagerly, so they don't reduce context size." },
    { front: "What does /memory do?", back: "Reveals which memory/configuration files are currently loaded (a diagnostic). It does NOT load or activate files — configuration loads automatically by level and location." },
    { front: "New team member gets inconsistent Claude behaviour — root cause and fix?", back: "Conventions live in a veteran's user-level ~/.claude/CLAUDE.md (not shared via git). Fix: move them to project-level .claude/CLAUDE.md so they're shared on clone." },
    { front: "What's the Claude Code scoping pattern?", back: ".claude/ = project, shared via git. ~/.claude/ = user, personal. Same for CLAUDE.md, commands/skills, and rules." },
    { front: "Are .claude/skills/ and .claude/commands/ different?", back: "Both create identical /commands and are project-scoped/equivalent. .claude/skills/ is canonical and adds optional frontmatter, a supporting-files dir, and auto-discovery; .claude/commands/ is a backward-compatible alias." },
    { front: "What do the three SKILL.md frontmatter options do?", back: "context: fork = isolated sub-agent (keeps verbose output out of main context). allowed-tools = restrict tools (security boundary). argument-hint = prompt for required parameters." },
    { front: "Skills vs CLAUDE.md / .claude/rules?", back: "Skills are on-demand, task-specific workflows (descriptions in context, body loads on invocation). CLAUDE.md and .claude/rules are always-loaded standards. Don't swap them." },
    { front: "When do you use context: fork?", back: "For verbose/exploratory skills (codebase analysis, brainstorming) so their output stays in an isolated sub-agent and doesn't flood the main context window." },
    { front: "Best approach for conventions on a file type spread across 50+ directories?", back: "A path-specific rule in .claude/rules/ with YAML frontmatter paths globs (e.g. ['**/*.test.tsx']). One file, universal coverage, loads only for matching files." },
    { front: "Why are path-scoped rules more token-efficient than root CLAUDE.md?", back: "They load only when you edit files matching their glob patterns, so irrelevant conventions don't consume tokens. Root CLAUDE.md loads every session regardless." },
    { front: "Plan mode vs direct execution — what's the deciding factor?", back: "Ambiguity, not difficulty. Plan: architectural/multi-approach/multi-file/exploration. Direct: well-scoped, known approach (e.g. single-file fix with a clear stack trace)." },
    { front: "What is the plan-then-execute hybrid?", back: "Plan mode to investigate and design the strategy, then direct execution to implement it file by file. Common for library migrations across many files." },
    { front: "What does the Explore subagent do?", back: "Runs verbose codebase discovery in isolation and returns summaries to the main conversation, keeping the main context clean for implementation." },
    { front: "First fix when Claude interprets a prose transformation inconsistently?", back: "Concrete input/output examples (2-3 before/after pairs). The model generalises from examples more reliably than from prose. Not 'more precise prose'." },
    { front: "Which refinement technique suits an unfamiliar domain?", back: "The interview pattern — have Claude ask questions about requirements, edge cases, and constraints before implementing, surfacing considerations you'd miss." },
    { front: "Batch vs sequential feedback?", back: "Batch interacting fixes into one message so the model sees all constraints at once. Sequence independent issues one at a time so batching doesn't confuse which feedback applies." },
    { front: "CI job hangs waiting for input — the fix?", back: "The -p (--print) flag: process the prompt, print to stdout, exit. NOT CLAUDE_HEADLESS=true or --batch (don't exist) or stdin redirection. (Most directly-tested fact in Domain 3.)" },
    { front: "How do you make CI output machine-parseable?", back: "--output-format json forces JSON; --json-schema enforces structure — enabling inline PR comments at exact file/line, severity filtering, and cross-run tracking." },
    { front: "Why review generated code in an independent session?", back: "The generating session retains the reasoning that justified its choices and is less likely to question them. An independent reviewer (separate claude -p, no shared context) evaluates the code on its own merits." },
    { front: "Batch API vs real-time for CI?", back: "Batch API saves ~50% but has up to 24h processing and no latency SLA. Real-time for blocking pre-merge checks (developers wait); Batch for overnight/weekly non-blocking work." }
  ];
  Array.prototype.push.apply(window.FLASHCARDS, D3_FLASHCARDS);
})();
