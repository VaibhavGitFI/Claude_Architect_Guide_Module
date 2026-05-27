/*
 * Domain 3 — Exam-Sim Bank
 *
 * Original scenario-based questions authored from the public concepts in
 * Anthropic's Claude Code docs (CLAUDE.md hierarchy, settings.json, skills,
 * .claude/rules, plan mode, Explore subagent, CI/CD, the -p flag, Batch API,
 * iterative refinement) and the deep-dive content in data/d3.js. Each
 * question has per-option rationales. Topic IDs match the existing study
 * content (d3.1 – d3.6).
 *
 * Populates window.EXAM_BANK.D3. Schema per question:
 *   { id, source:"extra", domain:"D3", topic:"d3.X", topicTitle,
 *     question, options:[A,B,C,D], answer: 0-3 (pre-shuffle index),
 *     rationales:[whyA, whyB, whyC, whyD] }
 */
(function () {
  "use strict";

  window.EXAM_BANK = window.EXAM_BANK || {};

  var D3 = [
    // ====================================================================
    // 3.1 — CLAUDE.md Hierarchy, Scoping & Modular Organisation
    // ====================================================================
    {
      id: "d3.1-extra-1", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A contractor joins the project and clones the repo on Monday. Claude Code generates code that ignores the team's error-handling pattern, while the rest of the team's sessions follow it consistently. What is the most likely root cause?",
      options: [
        "The contractor needs to run `/memory --refresh` to load the team conventions",
        "The error-handling conventions live in a long-tenured engineer's `~/.claude/CLAUDE.md`, which is user-level and not shared via git — so the contractor never received them on clone",
        "The contractor's Claude Code is on an older version and ignores newer conventions",
        "Conventions in `.claude/rules/` only apply after the contractor has been added to a CODEOWNERS file"
      ],
      answer: 1,
      rationales: [
        "There is no `--refresh` flag on `/memory`. /memory is a diagnostic that lists which memory files are currently loaded; it does not load anything.",
        "User-level `~/.claude/CLAUDE.md` is personal and not version-controlled. A team convention living there reaches anyone who has it locally, but a brand-new clone has nothing. The fix is to move the convention into project-level `.claude/CLAUDE.md` (or a `.claude/rules/` file) so git ships it.",
        "Claude Code version drift doesn't selectively ignore conventions; the convention either loads or it doesn't.",
        "CODEOWNERS controls reviewer assignment in GitHub; it has no relationship to which CLAUDE.md or `.claude/rules/` files load."
      ]
    },
    {
      id: "d3.1-extra-2", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "Which CLAUDE.md location is personal to one developer, NOT version-controlled, and NOT shared with teammates?",
      options: [
        "`CLAUDE.md` in the repository root",
        "`.claude/CLAUDE.md` inside the repository",
        "`~/.claude/CLAUDE.md` in the developer's home directory",
        "A `CLAUDE.md` placed inside a subdirectory of the repository"
      ],
      answer: 2,
      rationales: [
        "Root `CLAUDE.md` is project-level: it lives inside the repo and is committed/shared via git.",
        "`.claude/CLAUDE.md` is also project-level — version-controlled and shared with everyone who clones.",
        "User-level `~/.claude/CLAUDE.md` lives in the home directory, outside any repo. It applies only to the developer whose machine it lives on and is never shared via git.",
        "A subdirectory `CLAUDE.md` is project-level (directory-scoped within the repo). It IS shared via git."
      ]
    },
    {
      id: "d3.1-extra-3", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A team wants \"all code generation must use TypeScript strict mode\" to apply on every session, every developer, every file, with no opt-out. Where should this rule live?",
      options: [
        "In project-level `.claude/CLAUDE.md` (or root `CLAUDE.md`) so it is version-controlled and loads automatically for everyone",
        "In each developer's `~/.claude/CLAUDE.md` so they can tailor it for their own machine",
        "In a custom skill that developers must invoke at the start of each session",
        "In a directory-level CLAUDE.md placed inside the `src/` folder"
      ],
      answer: 0,
      rationales: [
        "Project-level CLAUDE.md is version-controlled, shared via git, and loads automatically as always-on guidance. This is the documented home for team-wide standards.",
        "User-level is personal and not shared; team-wide rules placed here only apply on the originator's machine.",
        "Skills are on-demand task workflows. Forcing developers to invoke a setup skill at the start of every session is unreliable and not what skills are for.",
        "A directory-level CLAUDE.md inside `src/` would scope the rule to files within `src/` and miss tests, scripts, or other top-level code. Universal rules belong at the project root."
      ]
    },
    {
      id: "d3.1-extra-4", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A team's `CLAUDE.md` has grown to 420 lines covering naming, testing, infrastructure, API design, and security. The single file is becoming unmaintainable. What is the most appropriate refactor?",
      options: [
        "Split the conventions across multiple files in `.claude/rules/` (e.g. `testing.md`, `infrastructure.md`, `api.md`), optionally using `paths:` frontmatter for path-scoped subsets",
        "Place a separate CLAUDE.md inside each subdirectory mirroring the topic split",
        "Move the content to `~/.claude/CLAUDE.md` so every developer can edit just the section they care about",
        "Rewrite the conventions as a skill so they only load when a developer asks for them"
      ],
      answer: 0,
      rationales: [
        "`.claude/rules/` is the documented mechanism for modular conventions. Topic-specific files keep maintenance focused, and optional `paths:` frontmatter further reduces token usage by loading rules only when matching files are edited.",
        "Duplicating content per directory creates drift and is the anti-pattern path-scoped rules are designed to avoid.",
        "User-level config is personal; the team cannot share a single source of truth from there.",
        "Skills are on-demand workflows, not always-on standards. Conventions that must apply to every edit belong in CLAUDE.md or `.claude/rules/`."
      ]
    },
    {
      id: "d3.1-extra-5", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A developer runs `/memory` and sees a list of files. What exactly does this command do?",
      options: [
        "It reloads CLAUDE.md and `.claude/rules/` from disk into the current session",
        "It lists the memory / configuration files currently loaded into the session — a diagnostic for verifying which CLAUDE.md and `.claude/rules/` files are active",
        "It clears the session's loaded memory and forces a fresh read on the next prompt",
        "It exports the loaded memory to a portable file for sharing with teammates"
      ],
      answer: 1,
      rationales: [
        "`/memory` does not reload anything. Loading is automatic based on file location and (for path-scoped rules) what's being edited.",
        "`/memory` is purely diagnostic: it tells you which memory files Claude Code currently has in context. When conventions seem to not apply, `/memory` is how you verify whether the expected file is loaded at all.",
        "There is no \"clear and reload\" semantic on `/memory`.",
        "`/memory` does not export anything; it just lists active files."
      ]
    },
    {
      id: "d3.1-extra-6", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A team must ensure a specific tool (e.g. `bash rm -rf /`) is ALWAYS blocked for every session, every developer, with zero possibility of accidental execution. Where does this rule belong?",
      options: [
        "In project-level `CLAUDE.md` with a strong \"never run this\" instruction",
        "In a `.claude/rules/` file with explicit warning callouts",
        "In `.claude/settings.json` (or a hook) — settings has a strict precedence chain and is client-enforced, whereas CLAUDE.md is behavioural guidance with no strict-compliance guarantee",
        "In each developer's `~/.claude/CLAUDE.md` so it cannot be overridden by the project"
      ],
      answer: 2,
      rationales: [
        "CLAUDE.md is concatenated behavioural guidance delivered as a user message; the docs explicitly say there is no guarantee of strict compliance. Critical safety rules need stronger enforcement.",
        "`.claude/rules/` files have the same enforcement characteristics as CLAUDE.md — guidance, not gating.",
        "`settings.json` permissions and hooks are enforced by the Claude Code client regardless of what the model decides. Settings has a strict precedence chain (managed > local > project > user, managed always wins). Hard rules belong here.",
        "User-level is the weakest scope, not the strongest. Moving a critical rule there both reduces enforcement and risks it being missing on a new machine."
      ]
    },
    {
      id: "d3.1-extra-7", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A team has both `.claude/CLAUDE.md` and a top-level CLAUDE.md, and both contain conflicting instructions about commit message format. What can the team rely on regarding which wins?",
      options: [
        "The deeper file (`.claude/CLAUDE.md`) always overrides the root-level one",
        "The root-level CLAUDE.md always overrides files in subfolders",
        "CLAUDE.md files are concatenated into context, not applied as a strict precedence chain — if two rules contradict, Claude may pick one arbitrarily. For deterministic behaviour, encode the rule in `settings.json` or a hook",
        "Only the most recently modified file is loaded; the older one is ignored"
      ],
      answer: 2,
      rationales: [
        "There is no \"deeper wins\" rule. All discovered CLAUDE.md files are concatenated; load order proceeds from broadest scope inward, but it is not a winner-take-all precedence.",
        "There is no \"root wins\" rule either.",
        "The documented behaviour is concatenation, not strict precedence. The docs explicitly warn that contradictory rules may resolve arbitrarily. If a rule must be deterministic, lift it into `settings.json` (strict precedence chain) or encode it as a hook.",
        "Modification time is not part of the loading mechanism."
      ]
    },
    {
      id: "d3.1-extra-8", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A team's main CLAUDE.md uses `@path` imports to pull in `./standards/naming.md` and `./standards/errors.md`. Which of the following is TRUE about how these imports load?",
      options: [
        "Imports are evaluated lazily — the file is only loaded when the model first references the imported topic",
        "Imports are inlined eagerly into the parent file's content at load time; for true session-context savings, use path-scoped `.claude/rules/` instead",
        "Imports are tracked separately and do not contribute to context tokens",
        "Imports require an explicit `@import` keyword to be recognised by Claude Code"
      ],
      answer: 1,
      rationales: [
        "There is no lazy / topic-based loading. The import is content-agnostic and always inlines.",
        "`@path` imports are eager: the referenced file is inlined into the parent at load time, exactly as if you had pasted its content. Per-session token usage is unchanged. To actually reduce session context, use `.claude/rules/` with `paths:` frontmatter so files only load for matching edits.",
        "Imported content lives in the same context budget as the rest of CLAUDE.md.",
        "The syntax is bare `@<path>` on its own line — there is no `@import` keyword."
      ]
    },
    {
      id: "d3.1-extra-9", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "Which of the following is NOT a valid location for a project-level CLAUDE.md that ships with the repository?",
      options: [
        "`CLAUDE.md` at the repository root",
        "`.claude/CLAUDE.md` inside the repository",
        "A `CLAUDE.md` placed inside a subdirectory of the repository (directory-scoped)",
        "`~/.claude/CLAUDE.md` in the developer's home directory"
      ],
      answer: 3,
      rationales: [
        "Root `CLAUDE.md` is a valid project-level location and is committed to the repo.",
        "`.claude/CLAUDE.md` is the other valid project-level location, also committed.",
        "Subdirectory CLAUDE.md files are project-level too — they're scoped to that directory but still live inside the repo and ship via git.",
        "`~/.claude/CLAUDE.md` is the USER-level location. It lives outside any repository in the user's home directory and is not version-controlled — therefore not a valid project-level location."
      ]
    },
    {
      id: "d3.1-extra-10", source: "extra",
      domain: "D3", topic: "d3.1", topicTitle: "CLAUDE.md Hierarchy, Scoping & Modular Organisation",
      question: "A junior developer asks: \"I just edited `.claude/CLAUDE.md`. Why aren't my new conventions showing up when I run `/memory`?\" What is the most likely explanation?",
      options: [
        "`/memory` only lists memory files at session start and never updates afterwards",
        "Edited files are picked up automatically on the next prompt; the developer should send a new message and re-run `/memory` to confirm the updated load",
        "The new conventions need to be promoted to `settings.json` before they take effect",
        "`.claude/CLAUDE.md` only loads when there is a matching `.claude/rules/` directory present"
      ],
      answer: 1,
      rationales: [
        "`/memory` reports current state at the moment it's invoked; it's not a one-time-at-startup snapshot.",
        "Memory files are picked up on the next request; the diagnostic itself just reports what was loaded. Sending another prompt and re-running `/memory` will reflect the edit.",
        "Promotion to `settings.json` isn't a thing — and CLAUDE.md and settings serve different purposes (guidance vs enforcement).",
        "There is no dependency between `.claude/CLAUDE.md` and the presence of `.claude/rules/`."
      ]
    },

    // ====================================================================
    // 3.2 — Custom Slash Commands and Skills
    // ====================================================================
    {
      id: "d3.2-extra-1", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A team wants a `/lint-check` command available to every contributor on clone. One developer also wants a personal `/codebase-tour` skill that prints extensive file/dependency information they don't want polluting the main conversation. How should these be placed?",
      options: [
        "Both in `.claude/commands/`, with `/codebase-tour` using `allowed-tools` to keep output small",
        "`/lint-check` in `.claude/commands/` (project-scoped, shared via git); `/codebase-tour` as a SKILL.md in `~/.claude/skills/codebase-tour/` with `context: fork` in the frontmatter",
        "Both in `~/.claude/skills/`, with documentation telling each new developer to copy them to their machine",
        "`/lint-check` in root CLAUDE.md as a procedure; `/codebase-tour` in `.claude/rules/`"
      ],
      answer: 1,
      rationales: [
        "Putting a personal skill in `.claude/commands/` ships it to teammates who didn't ask for it; `allowed-tools` controls security boundaries, not output volume.",
        "Project-scoped `.claude/commands/` is the right home for the team command (shared via git). User-scoped `~/.claude/skills/` keeps the personal skill personal; `context: fork` isolates its verbose output in a sub-agent so the main conversation stays clean.",
        "Manual copy-onboarding for a team command is exactly what project-scoping is designed to avoid.",
        "CLAUDE.md is for always-on standards, not invocable commands. `.claude/rules/` is for path-scoped conventions, not personal exploratory tools."
      ]
    },
    {
      id: "d3.2-extra-2", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A skill's body produces large amounts of intermediate output — file listings, dependency graphs, code excerpts — that you do NOT want in the main conversation context. Which SKILL.md frontmatter option addresses this?",
      options: [
        "`allowed-tools: [Read, Grep, Glob]` to restrict what the skill can do",
        "`argument-hint: \"Provide a narrow scope\"` to encourage smaller inputs",
        "`context: fork` to run the skill in an isolated sub-agent, with only its summary returning to the main conversation",
        "`max-output-tokens: 2000` to cap the response size"
      ],
      answer: 2,
      rationales: [
        "`allowed-tools` defines a security/permissions boundary — what the skill is allowed to do — not how much it can output.",
        "`argument-hint` prompts the user for required inputs; it does not constrain output volume.",
        "`context: fork` is the documented frontmatter option for output isolation. The skill runs in a sub-agent whose verbose internal output stays in the fork; the main session gets back only a summary, preserving its context budget.",
        "`max-output-tokens` is not a SKILL.md frontmatter option."
      ]
    },
    {
      id: "d3.2-extra-3", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A team wants \"never delete files in `archive/`\" to apply to every developer, every session, automatically — no invocation step required. Where should this go?",
      options: [
        "In a skill at `.claude/skills/safe-archive/SKILL.md` that developers invoke before any deletion",
        "In project-level `.claude/CLAUDE.md` (always-on guidance) backed by a hook or `settings.json` permission rule for deterministic enforcement",
        "In each developer's `~/.claude/commands/no-delete-archive.md`",
        "In a path-scoped `.claude/rules/` file with `paths: [\"archive/**\"]`"
      ],
      answer: 1,
      rationales: [
        "Skills are on-demand workflows. Requiring developers to invoke a guardrail before every potentially-deleting action is exactly the unreliable pattern guardrails should avoid.",
        "CLAUDE.md provides always-on behavioural guidance for every session, every developer. For a critical \"never\" rule you also want a deterministic backstop — a `settings.json` permission or a hook — because CLAUDE.md is guidance, not strict enforcement.",
        "User-level commands are personal and not shared via git; they don't apply to teammates.",
        "Path-scoped rules in `.claude/rules/` are appropriate for content/behavioural conventions when files in a given path are edited — but they don't enforce against runtime tool actions like deletions. A hook or settings rule does."
      ]
    },
    {
      id: "d3.2-extra-4", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A read-only `/codebase-audit` skill should be restricted to Read, Grep, and Glob — never Write, Edit, or Bash. Which frontmatter option enforces this?",
      options: [
        "`context: fork` — running in a sub-agent automatically restricts available tools",
        "`allowed-tools: [Read, Grep, Glob]` — an explicit allow-list that the skill cannot exceed",
        "`mode: read-only` — a high-level safety mode",
        "Tool restrictions are configured in `settings.json`, not in the SKILL.md frontmatter"
      ],
      answer: 1,
      rationales: [
        "`context: fork` controls output isolation, not tool restrictions. A forked skill can still use any tool unless restricted.",
        "`allowed-tools` is the documented allow-list for skills. Listing only `Read`, `Grep`, `Glob` cleanly excludes Write/Edit/Bash regardless of what the skill's body asks for.",
        "`mode: read-only` is not a SKILL.md frontmatter option.",
        "Skill-level tool restrictions are configured in the SKILL.md frontmatter (`allowed-tools`). `settings.json` controls session-wide permissions but doesn't override per-skill scoping."
      ]
    },
    {
      id: "d3.2-extra-5", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A developer invokes `/deploy-check` with no arguments and gets a confusing error from the skill. They want a clear prompt explaining the required input. Which frontmatter option helps?",
      options: [
        "`context: fork` so the skill can prompt for input in an isolated context",
        "`allowed-tools` including some interactive-input tool",
        "`argument-hint: \"Provide the target environment (staging|production)\"` — a documented frontmatter option that prompts the developer for required parameters when invoked without arguments",
        "A custom error message inside the SKILL.md body"
      ],
      answer: 2,
      rationales: [
        "`context: fork` isolates output; it does not handle missing-argument prompts.",
        "There is no \"interactive input\" tool; argument-hint is the documented mechanism.",
        "`argument-hint` is one of the three core SKILL.md frontmatter options. When the developer invokes the command without args, this hint is surfaced as a prompt for the required input, improving discoverability and reducing developer confusion.",
        "A body-level error message fires AFTER the skill starts running; the hint surfaces BEFORE — better UX."
      ]
    },
    {
      id: "d3.2-extra-6", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "What is the relationship between `.claude/commands/` and `.claude/skills/`?",
      options: [
        "They serve completely different purposes — commands are for slash commands, skills are for hooks",
        "They both create slash commands; `.claude/skills/` is the canonical location with optional YAML frontmatter (e.g. `context: fork`, `allowed-tools`, `argument-hint`) and a supporting-files directory, while `.claude/commands/` is a backward-compatible alias for plain markdown command files",
        "`.claude/commands/` is project-scoped and `.claude/skills/` is user-scoped",
        "`.claude/skills/` is for read-only tools and `.claude/commands/` is for read-write tools"
      ],
      answer: 1,
      rationales: [
        "Both produce slash commands; neither is hook-related.",
        "Files in either path create equivalent `/commands`. `.claude/skills/` is canonical and supports SKILL.md frontmatter (`context: fork`, `allowed-tools`, `argument-hint`) plus supporting files. `.claude/commands/` is a backward-compatible alias for plain-markdown command files without frontmatter.",
        "Both are project-scoped (`~/.claude/commands/` and `~/.claude/skills/` are the user-scoped equivalents).",
        "Tool capabilities are governed by `allowed-tools` frontmatter or session settings, not by which directory the file lives in."
      ]
    },
    {
      id: "d3.2-extra-7", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A developer wants a more verbose version of the team's `/analyse` skill, just for their own sessions. What is the cleanest approach?",
      options: [
        "Edit the team's `.claude/skills/analyse/SKILL.md` to add a verbose mode",
        "Create `~/.claude/skills/analyse/SKILL.md` with the same name to shadow the team's skill",
        "Create `~/.claude/skills/deep-analyse/SKILL.md` with a different name, so the personal variant coexists with the team's `/analyse` without conflict",
        "Add the verbose behaviour to `~/.claude/CLAUDE.md` instead of making a skill"
      ],
      answer: 2,
      rationales: [
        "Editing the team's skill affects every contributor and is exactly the side-effect a personal variant should avoid.",
        "Shadowing with the same name produces ambiguous behaviour and risks accidentally invoking the wrong one. Use a distinct name.",
        "A distinct-name personal variant in `~/.claude/skills/` is the documented pattern. The team's `/analyse` is preserved; the developer's `/deep-analyse` is theirs alone.",
        "CLAUDE.md is for always-on standards, not invocable workflows. Behavioural overrides for a specific verbose-analysis task belong in a skill."
      ]
    },
    {
      id: "d3.2-extra-8", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "An onboarding doc says: \"After cloning the repo, copy `~/.claude/commands/*` from a senior engineer's machine to get the team's slash commands.\" What is wrong with this instruction?",
      options: [
        "The senior engineer's commands may use different tools",
        "`~/.claude/commands/` is user-scoped and personal. Team-shared commands should live in the repository under `.claude/commands/` (or `.claude/skills/`) so every contributor gets them automatically on clone — no manual copying required",
        "Slash commands cannot be copied between machines",
        "The path should be `~/.claude/skills/` instead of `~/.claude/commands/`"
      ],
      answer: 1,
      rationales: [
        "Different tools wouldn't be the principal issue; team-wide skills should standardise on permitted tools anyway.",
        "User-scope is exactly what makes the manual-copy workflow necessary, and it's the wrong scope for team commands. Project-scope (`.claude/commands/` or `.claude/skills/`) ships via git automatically and eliminates the copy step entirely.",
        "Files can be copied between machines; the question is whether copying is the right mechanism. It isn't.",
        "Both user-scope paths (`~/.claude/commands/` and `~/.claude/skills/`) have the same problem — they're not version-controlled. Switching path doesn't fix the underlying scoping mistake."
      ]
    },
    {
      id: "d3.2-extra-9", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "Which best describes when to put behaviour in a SKILL.md versus CLAUDE.md?",
      options: [
        "SKILL.md is for code; CLAUDE.md is for English descriptions",
        "SKILL.md is for on-demand task workflows invoked explicitly by the developer (or, with auto-activation frontmatter, picked up by the model when relevant); CLAUDE.md (and `.claude/rules/`) is for always-loaded behavioural standards that should apply automatically every session",
        "SKILL.md is project-scoped; CLAUDE.md is user-scoped",
        "SKILL.md replaces CLAUDE.md in newer versions of Claude Code"
      ],
      answer: 1,
      rationales: [
        "Both files contain natural-language instructions; the boundary isn't code vs prose.",
        "Skills are on-demand task workflows: their full body loads when invoked (explicitly via `/name`, or via description/`paths` auto-activation), not always. CLAUDE.md and `.claude/rules/` are always-loaded standards. \"Apply this every time\" → CLAUDE.md / rules. \"Run this when I ask for it\" → skill.",
        "Both SKILL.md and CLAUDE.md exist at both project (`.claude/...`) and user (`~/.claude/...`) scopes.",
        "Skills did not replace CLAUDE.md; they serve different purposes and coexist."
      ]
    },
    {
      id: "d3.2-extra-10", source: "extra",
      domain: "D3", topic: "d3.2", topicTitle: "Custom Slash Commands and Skills",
      question: "A team-shared `/db-migrate` skill should never use the Write or Bash tools — it must be limited to inspecting state. Which SKILL.md frontmatter accomplishes this most directly?",
      options: [
        "`context: fork` so the isolated sub-agent inherits a restricted toolset",
        "`allowed-tools: [Read, Grep, Glob]` — an explicit allow-list that omits Write and Bash",
        "Documenting the restriction in the body of the skill and trusting the model to obey",
        "Removing Write and Bash from `settings.json` for the whole session"
      ],
      answer: 1,
      rationales: [
        "`context: fork` controls output isolation, not tool access.",
        "`allowed-tools` is the documented allow-list for restricting a skill's tool access. Listing only Read/Grep/Glob explicitly excludes Write and Bash, regardless of what the skill body might try to do.",
        "Body-level instructions rely on the model's compliance and are not enforced. For deterministic restrictions, use frontmatter or `settings.json`.",
        "Disabling Write and Bash session-wide would break every other tool that needs them. The point is per-skill scoping, not session-wide loss of capability."
      ]
    },

    // ====================================================================
    // 3.3 — Path-Specific Rules for Conditional Convention Loading
    // ====================================================================
    {
      id: "d3.3-extra-1", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A monorepo has React components scattered across 80+ feature directories, each with a `*.test.tsx` test co-located. The team wants identical test conventions everywhere, with zero maintenance as new feature directories are added. What is the best approach?",
      options: [
        "A single `.claude/rules/testing.md` with `paths: [\"**/*.test.tsx\", \"**/*.test.ts\"]` in its frontmatter so the rule loads only when a matching test file is being edited",
        "Place a `CLAUDE.md` containing the test conventions inside each of the 80+ feature directories",
        "Move the test conventions into root `CLAUDE.md` so they load for every session",
        "Author a `/lint-tests` skill and require developers to invoke it before saving any test file"
      ],
      answer: 0,
      rationales: [
        "Glob patterns in `.claude/rules/` match files across the entire codebase. One file covers all 80+ directories; new directories are picked up automatically because the rule attaches to filename patterns, not directory locations.",
        "Per-directory CLAUDE.md means 80+ duplicate files. Any convention change touches every copy, and drift is guaranteed.",
        "Root CLAUDE.md loads for every session, paying token cost on every non-test edit too. Path-scoping is the more efficient option.",
        "Skills are invoked on demand; relying on developers to remember an invocation before every save is fragile and not how always-on conventions should work."
      ]
    },
    {
      id: "d3.3-extra-2", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A team has Helm charts in `deploy/helm/` and Terraform modules under `infra/`. They want infra conventions loaded only when those files are edited, not when working on application code. What's the right configuration?",
      options: [
        "Put all infra conventions in root `CLAUDE.md` for maximum availability",
        "Two `.claude/rules/` files: `helm.md` with `paths: [\"deploy/helm/**\"]` and `terraform.md` with `paths: [\"infra/**\", \"**/*.tf\"]`",
        "A directory-level `CLAUDE.md` inside `deploy/helm/` and another inside `infra/`",
        "A single skill at `.claude/skills/infra/SKILL.md` that developers invoke when editing infra"
      ],
      answer: 1,
      rationales: [
        "Root CLAUDE.md loads for every session and wastes context on app-code edits.",
        "Two path-scoped rule files keep conventions topic-separated and load conditionally based on what's being edited. The Terraform rule's `**/*.tf` glob also catches `.tf` files that might live outside `infra/`.",
        "Directory-level CLAUDE.md scopes by directory but doesn't catch infra-style files that live elsewhere; path-scoped rules with glob patterns do both location- and type-based matching cleanly.",
        "Skills require invocation; always-on infra conventions should attach to the relevant files automatically."
      ]
    },
    {
      id: "d3.3-extra-3", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A developer is editing `src/api/users.ts`. Three `.claude/rules/` files are present: `testing.md` (paths: [\"**/*.test.ts\"]), `api.md` (paths: [\"src/api/**\"]), and `terraform.md` (paths: [\"**/*.tf\"]). Which rule files will load for this edit?",
      options: [
        "All three, because they all live in `.claude/rules/`",
        "Only `api.md`, because `src/api/users.ts` matches `src/api/**` but doesn't match the testing or Terraform globs",
        "`api.md` and `testing.md`, because the file is in `src/`",
        "None — `.claude/rules/` requires an explicit invocation to load"
      ],
      answer: 1,
      rationales: [
        "Living in `.claude/rules/` doesn't mean a file loads unconditionally; the `paths:` glob filters which edits trigger it.",
        "`users.ts` matches `src/api/**` (api.md loads), doesn't match `**/*.test.ts` (testing.md skipped), and isn't a `.tf` file (terraform.md skipped).",
        "Being inside `src/` isn't what testing.md keys on; it keys on the `.test.ts` suffix, which `users.ts` lacks.",
        "Path-scoped rules load automatically when the model reads a matching file. They are not invoke-only."
      ]
    },
    {
      id: "d3.3-extra-4", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A team migrated all conventions from root `CLAUDE.md` into `.claude/rules/` files with path-scoped globs. Now when a developer edits a regular utility file in `src/lib/format.ts`, the universal naming-and-error-handling standards no longer apply. What went wrong?",
      options: [
        "Path-scoped rules cannot contain general conventions; only file-type-specific ones",
        "The developer needs to run `/memory --reload` to refresh the configuration",
        "The universal standards either need a catch-all glob (e.g. `paths: [\"**/*\"]`) in their rule file, or they should remain in root `CLAUDE.md` because they apply to ALL code, not a specific subset",
        "Path-scoped rules only work for tests and infrastructure, not for general utility code"
      ],
      answer: 2,
      rationales: [
        "There is no content restriction on path-scoped rules; the issue is the glob, not the content.",
        "`/memory` has no `--reload` flag; loading is automatic.",
        "Path-scoped rules load only when their glob matches. Universal standards that should apply to every file need either a catch-all glob or to stay in root `CLAUDE.md`. Moving them into a narrowly-scoped rule file silently removes them from non-matching edits.",
        "Path-scoped rules work for any file type and any content; the glob pattern decides what triggers loading."
      ]
    },
    {
      id: "d3.3-extra-5", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "Which is the principal advantage of path-scoped `.claude/rules/` over a single root `CLAUDE.md` containing the same content?",
      options: [
        "Path-scoped rules can be shared via git, while root `CLAUDE.md` cannot",
        "Path-scoped rules load only when matching files are edited — reducing irrelevant context and conserving the session's token budget for the conventions that actually apply",
        "Path-scoped rules support YAML frontmatter while root `CLAUDE.md` does not",
        "Path-scoped rules are evaluated by `settings.json` precedence while root `CLAUDE.md` is not"
      ],
      answer: 1,
      rationales: [
        "Both are in the repository and shared via git when checked in. Sharing is not the differentiator.",
        "Conditional loading is the principal advantage. Terraform rules don't waste tokens when editing React components; React rules don't load when editing `.tf` files. In large projects with many convention categories, the saving is substantial.",
        "YAML frontmatter is the mechanism that enables the conditional loading, not the advantage itself.",
        "`settings.json` precedence applies to settings, not to CLAUDE.md or rule files. CLAUDE.md files are concatenated; settings has its own strict-precedence chain."
      ]
    },
    {
      id: "d3.3-extra-6", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A `.claude/rules/` file has no YAML frontmatter at all. What is the loading behaviour?",
      options: [
        "It does not load — frontmatter with `paths:` is required for any rules file to take effect",
        "Without `paths:` frontmatter, the rule loads for all sessions (it behaves like a small CLAUDE.md fragment available everywhere)",
        "It loads only when an `@import` line in CLAUDE.md explicitly references it",
        "It loads but is silently ignored by the model unless invoked as a skill"
      ],
      answer: 1,
      rationales: [
        "Frontmatter is optional. Without it, the rule loads universally.",
        "A rule file without a `paths:` field is universally loaded — effectively a topic-organised supplement to CLAUDE.md. The `paths:` field is what makes loading conditional.",
        "`.claude/rules/` files do not require import references to load.",
        "Rules files are read as guidance, not as invokable skills; the model is not silently ignoring them."
      ]
    },
    {
      id: "d3.3-extra-7", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A team is debating whether to use a path-scoped rule or an auto-invoking skill (with `paths:` frontmatter) for their test conventions. Which is true about the difference?",
      options: [
        "They are identical in behaviour; pick whichever name you prefer",
        "Skills always have priority over rules when both target the same files",
        "`.claude/rules/` files load as always-in-context guidance whenever Claude reads a matching file — every edit gets the rule's content. Skills with `paths:` auto-activation load as on-demand task workflows; the model picks them up when intent or file-context matches, but the loading model is task-style, not background-guidance",
        "Rules are user-scoped while skills are project-scoped"
      ],
      answer: 2,
      rationales: [
        "They are not identical; the loading model and intent differ.",
        "There is no priority rule between skills and `.claude/rules/`.",
        "Path-scoped `.claude/rules/` is for always-on background guidance attached to matching files. Auto-activating skills are still skills — task workflows the model can pick up based on intent or context. For conventions that should shape every edit to a matching file, the rule file is the right primitive.",
        "Both can be project-scoped (`.claude/...`) or user-scoped (`~/.claude/...`); scope is independent of the rules-vs-skills distinction."
      ]
    },
    {
      id: "d3.3-extra-8", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A path-scoped rule has frontmatter `paths: [\"**/migrations/**\", \"**/schema.prisma\"]`. When does this rule load?",
      options: [
        "Always — `**` matches any path",
        "Only when the developer manually invokes the rule via a slash command",
        "When the model reads a file whose path matches either `**/migrations/**` (any file under any `migrations/` directory) OR `**/schema.prisma` (any file named `schema.prisma`)",
        "Only on a new session; subsequent edits to matching files do not retrigger loading"
      ],
      answer: 2,
      rationales: [
        "`**` is a recursive glob but matches paths only — and only paths that satisfy the rest of the pattern (`migrations/` or `schema.prisma`). It doesn't load for every file.",
        "Path-scoped rules are not slash commands; they don't need invocation.",
        "Multiple entries in `paths:` are an OR list. Either matching pattern triggers the rule to load when that file is read.",
        "Loading is per file read, not once-per-session. Subsequent edits to matching files keep the rule in context as those files are read."
      ]
    },
    {
      id: "d3.3-extra-9", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A team is choosing between (a) one path-scoped `.claude/rules/api.md` with `paths: [\"src/api/**\"]` and (b) a directory-level `CLAUDE.md` inside `src/api/`. Which is true?",
      options: [
        "They are functionally identical and the choice is purely stylistic",
        "(a) is preferred when the API conventions also need to cover API files outside `src/api/` (e.g. `tests/api-contract.ts`) via additional glob entries — directory-level CLAUDE.md cannot pick up matching files elsewhere",
        "(b) is preferred because directory-level CLAUDE.md always overrides path-scoped rules",
        "(a) requires invocation while (b) loads automatically"
      ],
      answer: 1,
      rationales: [
        "They behave similarly when files only live inside the directory, but they're not identical — path-scoped rules can reach beyond a single directory via additional globs.",
        "Glob patterns in `.claude/rules/` can pick up files anywhere in the repo (e.g. `src/api/**` plus `tests/api-*.ts`). A directory-level CLAUDE.md is bound to its directory tree and can't catch matching files elsewhere. When the convention's relevant files cross directory boundaries, path-scoping wins.",
        "There is no override rule between directory-level CLAUDE.md and `.claude/rules/`.",
        "Both load automatically; neither requires invocation."
      ]
    },
    {
      id: "d3.3-extra-10", source: "extra",
      domain: "D3", topic: "d3.3", topicTitle: "Path-Specific Rules for Conditional Convention Loading",
      question: "A developer wants to verify which `.claude/rules/` files are currently active for a session. What's the right diagnostic?",
      options: [
        "Run `/rules list` to dump the active rules",
        "Run `/memory` — it lists all memory / configuration files currently loaded, including any path-scoped rules that have matched the files being edited so far",
        "Read `.claude/rules/index.json` which Claude Code generates automatically",
        "Look at the response time of the first request; longer responses indicate more loaded rules"
      ],
      answer: 1,
      rationales: [
        "There is no `/rules list` command.",
        "`/memory` reports the current loaded set, including rule files that have matched the files in scope. If a rule isn't shown, either its glob hasn't matched any read file yet, the file is mis-located, or the frontmatter is malformed.",
        "There is no auto-generated `index.json` for rules.",
        "Response time is a noisy and unreliable signal of what's loaded."
      ]
    },

    // ====================================================================
    // 3.4 — Plan Mode vs Direct Execution
    // ====================================================================
    {
      id: "d3.4-extra-1", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "Three tasks: (1) extract a shared `auth` module from inside a monolithic web app and split it into a separate package; (2) fix an off-by-one in a date helper, with a failing test that pinpoints the line; (3) rename a config flag from `enableX` to `enableNewX` across the codebase. Which mode for each?",
      options: [
        "Plan for (1) and (3); direct for (2)",
        "Plan for all three because they all involve code changes",
        "Plan for (1); direct for (2) and (3)",
        "Direct for all three with very detailed upfront instructions"
      ],
      answer: 0,
      rationales: [
        "(1) is architectural extraction across many files with multiple boundary options — plan mode. (3) is a multi-file refactor where one consistent strategy must be applied — plan mode (often plan-then-execute). (2) is a well-scoped fix with a failing test pinpointing the bug — direct execution.",
        "(2) doesn't need plan mode; the failing test and the line of code give complete clarity.",
        "(3) is a multi-file refactor where direct execution risks inconsistent application as you go — plan first, then execute uniformly.",
        "Comprehensive upfront instructions don't substitute for the codebase exploration plan mode does. (1) in particular needs to discover dependencies, not assume them."
      ]
    },
    {
      id: "d3.4-extra-2", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "What is the core decision criterion between plan mode and direct execution?",
      options: [
        "Whether the change touches more than 5 files",
        "Whether the task is technically difficult",
        "Whether the task has ambiguity — multiple plausible approaches, unclear scope, or undiscovered dependencies. Difficult-but-clear tasks can use direct execution; easy-sounding-but-ambiguous tasks need plan mode",
        "Whether the developer prefers planning"
      ],
      answer: 2,
      rationales: [
        "There is no hard file-count threshold. A 1-file change can be ambiguous; a 20-file rename can be unambiguous.",
        "Difficulty isn't the criterion. A hard but well-scoped fix (e.g. a tricky bit-manipulation function with a failing test) is fine for direct execution.",
        "Ambiguity is the criterion. Plan mode exists to surface and resolve unknowns before changes are made. When the approach is clear and the scope is bounded, plan mode is overhead; when either is unclear, plan mode protects against rework.",
        "Personal preference is a poor decision rule and risks both over-planning trivial tasks and skipping planning on genuinely ambiguous ones."
      ]
    },
    {
      id: "d3.4-extra-3", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "A team plans a logging-library migration in plan mode, then switches to direct execution for the per-file applications. What is this pattern called and why is it useful?",
      options: [
        "Two-pass refactor — useful because the first pass is exploratory",
        "The plan-then-execute hybrid — plan mode designs a single consistent strategy across the affected files, then direct execution applies it uniformly without re-deciding per file",
        "Sequential plan mode — useful when the model is uncertain",
        "Phased deployment — useful for production safety"
      ],
      answer: 1,
      rationales: [
        "\"Two-pass refactor\" is generic terminology and not the documented Claude Code pattern name.",
        "The plan-then-execute hybrid is the documented pattern. Plan mode produces a strategy (mapping the migration, deciding edge cases up front). Direct execution then applies that strategy file by file without renegotiating decisions, ensuring consistency.",
        "\"Sequential plan mode\" is not a documented pattern.",
        "Phased deployment is a release / ops concept, not a Claude Code workflow."
      ]
    },
    {
      id: "d3.4-extra-4", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "A multi-phase codebase analysis uses an Explore subagent. The main conversation receives a concise summary while the subagent handles file listings, dependency graphs, and excerpts internally. What is the primary benefit?",
      options: [
        "Subagents have access to files the main session cannot read",
        "Context isolation — verbose discovery output stays in the subagent's context, preserving the main session's context budget for the implementation that follows",
        "Subagents run on a stronger model better suited to analysis",
        "The Explore subagent automatically prevents file modifications"
      ],
      answer: 1,
      rationales: [
        "There is no asymmetric file access; subagents see what the main session can configure them to see.",
        "Context isolation is the documented purpose. Without it, exploration output (file listings, graphs, excerpts) fills the main context; subsequent implementation responses degrade because the relevant context is pushed out by verbose discovery.",
        "Subagents use the same model.",
        "Read-only behaviour is a separate concern (controlled by allowed-tools or plan mode), not an inherent property of the Explore subagent."
      ]
    },
    {
      id: "d3.4-extra-5", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "A teammate suggests: \"Always start in direct execution; if complexity emerges, switch to plan mode then.\" The current task is to redesign an authentication system. Is this advice correct?",
      options: [
        "Yes — starting lean is best practice across the board",
        "No — for tasks where complexity is already stated or obvious in the requirements (here: auth redesign), plan mode should be chosen upfront. Switching mid-stream wastes the direct-execution work and risks half-formed changes",
        "Yes, because the file count is unknown",
        "No, because plan mode should be used for every task"
      ],
      answer: 1,
      rationales: [
        "Starting lean is a useful default for genuinely small, well-scoped tasks. It's not a universal rule and doesn't fit stated-complex tasks.",
        "The complexity is not speculative — auth redesign is explicitly architectural with cross-module impact. Plan mode protects against partial changes and rework by surfacing the design before any code is touched.",
        "Unknown file count is itself a strong signal in favour of plan mode, not direct execution.",
        "Plan mode for every task is overkill for trivial bug fixes and config tweaks where direct execution is faster and equally safe."
      ]
    },
    {
      id: "d3.4-extra-6", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "Which of the following tasks is BEST suited for direct execution with no planning phase?",
      options: [
        "Splitting a `BillingService` into two services with clear ownership boundaries",
        "Updating the support email address in one constants file from `help@old.com` to `help@new.com`",
        "Choosing between Redis and Memcached for a new caching layer",
        "Migrating from CommonJS to ES modules across the repository"
      ],
      answer: 1,
      rationales: [
        "Splitting a service involves architectural decisions about ownership and dependency boundaries — plan mode.",
        "A single-value change in one file is the textbook case for direct execution. No ambiguity, no scope spread, no design decision.",
        "Choosing between two technologies is architectural decision-making — needs comparison and plan mode.",
        "Codebase-wide module-system migration is a multi-file refactor needing a uniform strategy — plan-then-execute hybrid."
      ]
    },
    {
      id: "d3.4-extra-7", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "A developer reports: \"I asked Claude to fix the failing test, it changed the test instead of fixing the bug.\" The task was a single-function fix with a clear stack trace. What's the appropriate framing?",
      options: [
        "This is a sign that plan mode was needed even for a simple bug fix",
        "This is an issue of intent specification (direct execution is still appropriate; the developer should be clearer that the implementation, not the test, is wrong) rather than a sign plan mode was needed",
        "Plan mode would have prevented this because it forces test review first",
        "The developer should switch to Read+Write for all bug fixes"
      ],
      answer: 1,
      rationales: [
        "Plan mode isn't a remedy for intent ambiguity in a small fix; it's overhead. The mode is correct; the prompt needs more precision.",
        "Direct execution is the right mode for a well-scoped fix with a clear stack trace. The failure here is in the instruction, not the mode — say explicitly \"fix the implementation, keep the test as the contract.\"",
        "Plan mode doesn't enforce \"don't modify tests\"; that's still an instruction-level concern.",
        "Read+Write is a built-in-tool fallback, unrelated to mode selection."
      ]
    },
    {
      id: "d3.4-extra-8", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "Plan mode can read and analyse files but does not modify them. Which scenario most directly benefits from this constraint?",
      options: [
        "Adding a single comment to a file",
        "Reviewing a large unfamiliar codebase to decide between two refactor strategies — analysis must happen without committing to any changes until the strategy is chosen",
        "Running a single failing test to see the error message",
        "Renaming a local variable inside one function"
      ],
      answer: 1,
      rationales: [
        "Adding a comment is a single-edit task; the no-modify constraint of plan mode is unnecessary overhead.",
        "The no-modify constraint protects against accidental partial implementation while the design is still being chosen. For multi-strategy decision-making, plan mode lets you fully understand the system before committing.",
        "Running a test is an inspect-and-report task, not the use case plan mode is designed for.",
        "A local-variable rename is well-scoped and best done in direct execution."
      ]
    },
    {
      id: "d3.4-extra-9", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "A library update with breaking API changes affects 40 files. The team wants a uniform migration that doesn't drift between files. What is the best workflow?",
      options: [
        "Direct execution for the whole migration, iterating per file as you go",
        "Plan mode only — produce the plan and let developers apply it manually",
        "The hybrid: plan mode to design the migration pattern (mapping old → new APIs, deciding edge cases up front), then switch to direct execution to apply the pattern consistently across the 40 files",
        "Skip the migration and pin the library to the old version indefinitely"
      ],
      answer: 2,
      rationales: [
        "Per-file direct execution without an upfront plan tends to drift: edge cases discovered later contradict earlier decisions, producing inconsistency.",
        "Plan-only stops short of doing the work. The model can apply the migration consistently once the plan exists; manual application reintroduces inconsistency.",
        "The plan-then-execute hybrid is the documented pattern for exactly this case: a uniform multi-file change benefits from upfront design (plan) plus consistent application (direct execution).",
        "Pinning is an avoidance, not a solution, and accumulates technical debt."
      ]
    },
    {
      id: "d3.4-extra-10", source: "extra",
      domain: "D3", topic: "d3.4", topicTitle: "Plan Mode vs Direct Execution",
      question: "Which is true about the Explore subagent versus plan mode itself?",
      options: [
        "They are the same feature under two names",
        "Plan mode is a mode of operation (no modifications, designed for analysis and strategy); the Explore subagent is a context-isolation mechanism that runs verbose discovery in a sub-agent so the main conversation receives only the summary. They are complementary",
        "The Explore subagent replaces plan mode in newer versions",
        "Plan mode is for code; Explore is for documentation"
      ],
      answer: 1,
      rationales: [
        "They are distinct concepts and serve different purposes.",
        "Plan mode is about WHAT happens in a session (analysis-and-design, no modifications). The Explore subagent is about WHERE verbose discovery output lives (in a sub-agent's context, not the main one). You can use them together in multi-phase analysis.",
        "Plan mode is not deprecated by Explore; both remain part of the documented workflow.",
        "Both work across code and documentation; the boundary is mode of operation vs context isolation."
      ]
    },

    // ====================================================================
    // 3.5 — Iterative Refinement Techniques
    // ====================================================================
    {
      id: "d3.5-extra-1", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "A developer prompts Claude with a paragraph describing a JSON-to-CSV transformation. Run 1 escapes quotes differently from run 2; run 3 omits the header row. The behaviour is interpretation-inconsistent. What is the first technique to try?",
      options: [
        "Rewrite the paragraph with more precise wording and technical terms",
        "Provide 2–3 concrete input/output examples that show the exact transformation, including how quotes are escaped and whether a header row appears — examples eliminate interpretation ambiguity",
        "Ask Claude clarifying questions (interview pattern) about the transformation rules",
        "Reduce the temperature to 0 and run again"
      ],
      answer: 1,
      rationales: [
        "More prose still requires interpretation; it doesn't fix the root cause that prose is being interpreted differently each run.",
        "Concrete examples remove interpretation: the model sees exactly what input looks like and exactly what output should be. It generalises from examples reliably and applies the pattern consistently. This is the documented first-line technique for inconsistent-prose-interpretation problems.",
        "The interview pattern is for unfamiliar-domain problems where the user might miss considerations. Here the developer knows the transformation; the model is interpreting it.",
        "Temperature changes can reduce variability but don't address ambiguous prose. Examples address the cause."
      ]
    },
    {
      id: "d3.5-extra-2", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "A developer is asked to design a rate-limiter for a new API but has limited experience with rate-limiting strategies (token bucket, leaky bucket, sliding window, fixed window). Which refinement technique fits best?",
      options: [
        "Provide concrete input/output examples of rate-limiting behaviour",
        "Use the interview pattern — have Claude ask about throughput, burstiness, fairness, distributed-vs-local enforcement, and failure modes BEFORE implementation begins, surfacing considerations the developer would otherwise miss",
        "Write tests first and iterate by sharing test failures",
        "Describe the desired behaviour in detailed prose and let the model fill in defaults"
      ],
      answer: 1,
      rationales: [
        "The developer doesn't yet know enough to produce meaningful examples; they might miss key edge cases (e.g. distributed clock skew).",
        "The interview pattern is designed for unfamiliar domains. Claude surfaces considerations the developer doesn't know to specify — throughput, burstiness, fairness, distributed enforcement — turning blind spots into explicit decisions before any code is written.",
        "TDD works only if the developer knows what to test. In an unfamiliar domain, they may not know which behaviours need tests.",
        "Letting the model fill in defaults in an unfamiliar domain risks silently embedding decisions the developer doesn't understand or didn't want."
      ]
    },
    {
      id: "d3.5-extra-3", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "After a code review, a developer has three pieces of feedback for Claude: (1) the API response shape needs a `requestId` field, (2) logs must include the new `requestId`, (3) one helper function uses snake_case names but should use camelCase. How should the feedback be delivered?",
      options: [
        "All three in a single message so Claude sees the full picture at once",
        "(1) and (2) batched in one message because they interact (the new field affects both response and log shape); (3) sent separately because it's an independent naming convention fix that shouldn't be conflated",
        "One per message, in order of importance",
        "Two messages: first all bug-like items, then all style items"
      ],
      answer: 1,
      rationales: [
        "Batching the independent naming fix with the interacting response+logging changes risks the model conflating the concerns or applying naming changes in the wrong scope.",
        "Interacting feedback should be batched so the model produces a coherent fix; independent feedback should be separated so each is applied cleanly without conflation. Here, (1) and (2) interact via `requestId`; (3) is unrelated.",
        "One per message is slow and prevents the model from coordinating interacting fixes.",
        "Bug-vs-style isn't the right axis; interaction-vs-independence is. The response shape and logging fix happen to be both bug-like AND interacting; the naming fix is style-like AND independent."
      ]
    },
    {
      id: "d3.5-extra-4", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "Two input/output examples teach Claude a string-normalisation pattern that works on standard input. On follow-up testing, the implementation crashes when the input is `null`. What should the developer do next?",
      options: [
        "Rewrite the original two examples with comments explaining null handling",
        "Add a third example specifically showing the null-input case and the expected behaviour (return value, error, default) — the model generalises edge-case handling from examples, not from comments",
        "Switch to the interview pattern and ask Claude to enumerate edge cases",
        "Rewrite the requirements in prose now that the pattern is partly known"
      ],
      answer: 1,
      rationales: [
        "Comments on existing examples don't establish a new pattern — they reduce to prose-style guidance that competes with the example signal.",
        "Edge cases are best taught via additional examples. A null-input example shows exactly the right behaviour, and the model adds it to the generalised pattern. Stay on the example technique that's already working.",
        "Interview pattern is for situations where the developer doesn't know the right answer. Here they know the null-handling rule; they need to demonstrate it.",
        "Adding prose now reintroduces the interpretation-inconsistency problem the examples were solving."
      ]
    },
    {
      id: "d3.5-extra-5", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "Which best describes the relationship between concrete examples and the interview pattern?",
      options: [
        "They are interchangeable — pick whichever feels easier",
        "Concrete examples fix INCONSISTENT INTERPRETATION when the developer knows the transformation but the model is rendering it differently each run. The interview pattern fixes MISSED CONSIDERATIONS in unfamiliar domains where the developer doesn't yet know what to specify. They solve different problems",
        "The interview pattern is the better technique in all situations",
        "Examples are project-scoped while the interview pattern is user-scoped"
      ],
      answer: 1,
      rationales: [
        "They are not interchangeable; misapplying one to the wrong problem leaves the original issue in place.",
        "Examples remove interpretation ambiguity (\"do it like this, not like this\"). The interview pattern surfaces unknowns (\"what should happen when X?\") that the developer hadn't thought to specify. Different failure modes, different techniques.",
        "The interview pattern is unnecessary overhead when the developer already knows the desired transformation.",
        "Neither is scoped to project or user; both are interaction-level techniques."
      ]
    },
    {
      id: "d3.5-extra-6", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "A developer is implementing a complex transformation with many edge cases (e.g. parsing legacy log files into structured JSON). They want to iterate quickly but maintain rigour. Which refinement technique scales best?",
      options: [
        "Write a comprehensive test suite up front, then iterate by sharing failing tests with Claude — TDD lets you express many edge cases compactly and gives concrete, machine-checkable feedback on each iteration",
        "Provide one master prompt covering every edge case in detailed prose",
        "Use the interview pattern repeatedly for each edge case",
        "Ask Claude to enumerate edge cases and then trust its enumeration"
      ],
      answer: 0,
      rationales: [
        "Test-driven iteration scales well for many edge cases: tests are compact, machine-checkable, and provide unambiguous feedback. Sharing a failing test ID tells Claude exactly what to fix without prose interpretation.",
        "Prose at this scale runs into interpretation-consistency problems; the model may interpret edge cases differently across runs.",
        "Interview pattern is for unfamiliar domains, not for iterating on many known edge cases.",
        "Trusting an enumeration risks missed cases. Tests are the durable, checkable source of truth."
      ]
    },
    {
      id: "d3.5-extra-7", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "A developer says: \"I rewrote my prompt three times, made it more precise each time, and still got different outputs. What's the fix?\"",
      options: [
        "Keep rewriting — eventually the prose will be precise enough",
        "Switch from prose to concrete input/output examples — examples eliminate interpretation in a way that more-precise prose cannot, because prose still requires interpretation",
        "Lower the temperature to 0 and accept whatever the first output is",
        "Use a different model — the current one is incapable of consistency"
      ],
      answer: 1,
      rationales: [
        "More precise prose still relies on interpretation, which is the root cause. Diminishing returns.",
        "When prose-precision iteration plateaus, the failure mode is interpretation, not vocabulary. Examples are the documented escape hatch: they show the model exactly what is desired, removing interpretation from the loop.",
        "Temperature changes reduce variability but don't add semantic clarity; the same ambiguous prose at temperature 0 just picks one ambiguous interpretation deterministically.",
        "Switching models doesn't address ambiguous input; the same prose to a different model can produce different interpretations again."
      ]
    },
    {
      id: "d3.5-extra-8", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "A team gives Claude feedback in three separate sequential messages: (a) add a `traceId` to the response, (b) include the `traceId` in structured logs, (c) propagate the `traceId` to downstream HTTP calls. After all three messages, the response shape includes `traceId` but the logs and downstream calls don't reference it. What went wrong?",
      options: [
        "Claude has a per-message memory limit that lost the traceId across messages",
        "These three pieces of feedback INTERACT (all reference the new `traceId`). They should have been batched into a single message so the model could produce a coherent fix that wires the field through all three layers consistently",
        "The team should have written tests for all three before giving feedback",
        "Sequential messages cause the model to forget earlier responses"
      ],
      answer: 1,
      rationales: [
        "There is no per-message memory limit at play; the messages are in the same conversation context.",
        "Interacting changes should be batched. By delivering them sequentially, the model addressed each in isolation: the response shape got the field, but logging and HTTP propagation lost the cross-reference. Batched, the model would have wired `traceId` through all three layers consistently.",
        "Tests don't replace the batching decision; the failure here is in feedback delivery, not test coverage.",
        "The model didn't forget earlier responses; it just applied each fix without cross-layer coordination because they arrived independently."
      ]
    },
    {
      id: "d3.5-extra-9", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "Two reviewers leave independent feedback on a Claude-generated function: (a) rename the parameter `data` to `payload`; (b) extract a 4-line block into a private helper. Should these be batched or sequential?",
      options: [
        "Batched into one message, since they're both on the same function",
        "Sequential — they're independent (renaming the parameter and extracting a helper don't interact), so sending them separately keeps the diffs cleanly attributable and the model focused on one change at a time",
        "Batched because Claude works better with more feedback",
        "Discard one of them; you can only apply one at a time"
      ],
      answer: 1,
      rationales: [
        "Same function doesn't imply interacting; the decision is about whether the changes affect each other.",
        "Sequential application of independent feedback keeps each fix cleanly scoped and reviewable. The two changes don't share variables, signatures, or dependencies, so batching offers no coordination benefit but does risk conflation.",
        "More feedback per message is fine when items interact; not when they're independent.",
        "Both can be applied; there's no \"one at a time\" rule. The right axis is interaction-vs-independence, applied to batching strategy."
      ]
    },
    {
      id: "d3.5-extra-10", source: "extra",
      domain: "D3", topic: "d3.5", topicTitle: "Iterative Refinement Techniques",
      question: "Which is the correct ordering of refinement techniques to consider for a known transformation that the model is implementing inconsistently across runs?",
      options: [
        "Try interview pattern first; then examples; then tests if still failing",
        "Try concrete input/output examples first; then add edge-case examples as gaps are observed; then escalate to test-driven iteration if the case set is very large",
        "Always start with comprehensive test-driven iteration regardless of complexity",
        "Lower the temperature, then increase the model's max_tokens, then try examples"
      ],
      answer: 1,
      rationales: [
        "Interview pattern is for unfamiliar-domain problems; it doesn't fit \"known transformation, inconsistent implementation.\"",
        "Examples-first is the documented response to inconsistent-prose-interpretation problems; widen the example set as edge cases surface; escalate to TDD when the edge-case matrix is large enough to warrant compact machine-checkable specs.",
        "Comprehensive TDD upfront is heavier than necessary for simple transformations; examples are faster.",
        "Hyperparameter tweaks don't address ambiguous input. The interpretation problem is in the prompt, not in sampling settings."
      ]
    },

    // ====================================================================
    // 3.6 — CI/CD Integration
    // ====================================================================
    {
      id: "d3.6-extra-1", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A GitHub Actions job invokes `claude \"Run a security review of this PR\"` and never completes. Logs show Claude Code waiting for input. What is the documented fix?",
      options: [
        "Set `CLAUDE_INTERACTIVE=false` in the job environment",
        "Pass the `-p` (or `--print`) flag: `claude -p \"Run a security review of this PR\"`. `-p` runs Claude Code in non-interactive print mode — process the prompt, write output to stdout, exit",
        "Pipe `yes` into stdin to satisfy interactive prompts",
        "Use `claude --ci-mode \"...\"`"
      ],
      answer: 1,
      rationales: [
        "There is no `CLAUDE_INTERACTIVE` environment variable; this is invented.",
        "The `-p`/`--print` flag is the documented mechanism for non-interactive CI. It executes the prompt, writes the result to stdout, and exits without ever waiting for user input. This is the single most directly testable fact in Domain 3.",
        "Piping `yes` is a generic Unix workaround that doesn't address Claude Code's interactive mode properly — and at scale it can cause unexpected confirmations downstream.",
        "There is no `--ci-mode` flag; `-p` is the documented form."
      ]
    },
    {
      id: "d3.6-extra-2", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A CI step needs to post review findings as inline comments at specific file paths and line numbers. Which flag combination produces output an automated system can reliably parse and route?",
      options: [
        "`--output-format markdown` and `--include-line-numbers`",
        "`--output-format json` together with `--json-schema` describing fields such as `file`, `line`, `severity`, and `message` — JSON guarantees parseable structure and the schema enforces the specific fields downstream tooling needs",
        "`--output-format json` alone, without a schema",
        "`--format html` so the CI system can render and re-parse the page"
      ],
      answer: 1,
      rationales: [
        "Markdown output isn't structurally reliable for automated routing; line numbers in prose vary across runs.",
        "`--output-format json` produces JSON; `--json-schema` enforces a specific shape. Together they give automated systems exactly the fields they need (file, line, severity, message), with the structure guaranteed enough to drive inline comment posting at exact locations.",
        "Plain JSON without a schema has the right type but can vary in fields and nesting between runs, breaking parsers.",
        "HTML is parseable but vastly heavier than needed and indirect; JSON-with-schema is the direct mechanism."
      ]
    },
    {
      id: "d3.6-extra-3", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A pipeline generates code, then in the SAME session asks Claude to review the generated code. The review passes cleanly. A separate engineer runs the same review independently and finds two real bugs. What is the most likely cause?",
      options: [
        "The pipeline uses a less capable model for review than for generation",
        "Same-session self-review is biased: the session retains the reasoning context (and justifications) it used to write the code, making it less likely to challenge those decisions. Use an INDEPENDENT instance (a fresh, separate `claude -p` invocation) for review",
        "The reviewer reads slower than the model and notices more details",
        "Claude Code cannot review its own output due to a hard technical limitation"
      ],
      answer: 1,
      rationales: [
        "The same model is used; capability isn't the issue. The issue is context bias.",
        "When the same session generates and reviews, it carries forward the reasoning it used to make the original decisions. It tends to rationalise rather than challenge. An independent invocation arrives without that bias and can more readily find issues.",
        "Reading speed isn't relevant; this is about reasoning context.",
        "Self-review works technically; it's just less effective than independent review. There is no hard limitation."
      ]
    },
    {
      id: "d3.6-extra-4", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A team's CI review runs on every push. Developers complain that the same six issues are flagged on every push, including ones they have already addressed. What is the appropriate fix?",
      options: [
        "Reduce the review frequency to once per PR instead of per push",
        "Include the prior review's findings in the context for the next run and instruct Claude to report only NEW issues or issues from the prior set that are STILL present — incremental review preserves signal-to-noise",
        "Lower the model temperature so the review is more deterministic",
        "Suppress all comments that look similar to prior comments via a regex filter"
      ],
      answer: 1,
      rationales: [
        "Reducing frequency doesn't deduplicate; the same six issues would still come back on the next run.",
        "Incremental review with prior findings in context lets the model report deltas — new issues, or old ones still present. This preserves trust in the review system instead of training developers to ignore it.",
        "Temperature doesn't change which issues exist; it changes phrasing variance.",
        "Regex deduplication is fragile and can suppress legitimately new findings; instructing the model on intent is more durable."
      ]
    },
    {
      id: "d3.6-extra-5", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A team considers moving their PRE-MERGE Claude-Code checks to the Message Batches API to save ~50% on cost. Is this a good fit?",
      options: [
        "Yes — pre-merge checks run all day and the cost savings compound quickly",
        "No — the Message Batches API has up to 24-hour processing latency with no guaranteed SLA. Pre-merge checks are BLOCKING (developers wait to merge), so latency matters more than cost. Batch fits non-blocking workloads like overnight tech-debt reports or weekly audits",
        "Yes, provided the team also passes a `--timeout 5m` flag to the batch request",
        "No, because the Batch API doesn't support code review at all"
      ],
      answer: 1,
      rationales: [
        "Cost savings are real but irrelevant if the latency is unworkable. Pre-merge means developers wait.",
        "Batch trades latency for cost. It's appropriate where humans aren't waiting (overnight scans, weekly audits) and inappropriate for synchronous, blocking checks. The documented mismatch is exactly this scenario.",
        "There is no batch-level timeout option that converts batch latency into sync latency.",
        "Batch API supports the same prompts as the synchronous API; the limitation is latency, not capability."
      ]
    },
    {
      id: "d3.6-extra-6", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "CI-invoked Claude Code generates new test files, but the tests use ad-hoc inline data instead of the team's `tests/factories/` and `tests/fixtures/`. What's the most likely cause and fix?",
      options: [
        "Claude Code in CI cannot access the `tests/factories/` directory; mount it explicitly in the job",
        "The team's testing standards (\"use factory functions in `tests/factories/`, never inline objects; use fixtures from `tests/fixtures/json/`\") aren't recorded in `CLAUDE.md` (or a path-scoped rule). CI Claude Code reads CLAUDE.md just like an interactive session; missing standards there = boilerplate tests",
        "CI-invoked Claude Code uses a stripped-down model that doesn't know about advanced testing patterns",
        "The `-p` flag disables access to project context files"
      ],
      answer: 1,
      rationales: [
        "File access in CI is the same as a regular checkout; access is not the issue.",
        "Claude Code reads CLAUDE.md and `.claude/rules/` in CI just as in an interactive session. If the team's testing standards and factory/fixture locations aren't documented there, CI defaults to generic boilerplate. Adding a testing rule (ideally path-scoped to test files) fixes this systemically.",
        "There is no stripped-down CI model.",
        "`-p` controls input mode (non-interactive print). It does not disable configuration-file reading."
      ]
    },
    {
      id: "d3.6-extra-7", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "Which CI workload is a GOOD fit for the Message Batches API?",
      options: [
        "Pre-merge static-analysis on PRs",
        "Per-push lint feedback during active development",
        "Overnight repository-wide technical-debt audits that produce a report read the next morning — latency-tolerant, non-blocking, and benefits from the ~50% cost savings",
        "Real-time IDE assistance"
      ],
      answer: 2,
      rationales: [
        "Pre-merge is blocking; developers wait to merge, so multi-hour latency is unacceptable.",
        "Per-push lint needs prompt feedback; multi-hour latency would render it useless.",
        "Overnight or weekly audits are exactly the documented use case for batch: latency is irrelevant because no one is waiting in real time, and the cost savings accumulate across large workloads.",
        "Real-time anything is the antithesis of batch latency."
      ]
    },
    {
      id: "d3.6-extra-8", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A team wants both generation AND review in CI, with the review unbiased by the generation context. Architecturally, what's the right approach?",
      options: [
        "Run a single `claude -p` invocation that does both, ensuring it sees the full context",
        "Two independent `claude -p` invocations: one for generation, a SEPARATE one for review (no shared session, no carried-over reasoning context). The reviewer arrives without bias and can challenge decisions on their merits",
        "Generate in CI but defer review to a manual human step the next day",
        "Use `claude --self-review` so the model formally checks itself"
      ],
      answer: 1,
      rationales: [
        "A single invocation reproduces the same-session bias; the reviewer step shares reasoning context with generation.",
        "Two independent invocations is the documented pattern for unbiased review in CI. The reviewer gets only the artefact, not the reasoning trail behind it, so it evaluates on the artefact's own merits.",
        "Deferring to a human is fine but doesn't answer the architectural question about how to use Claude Code unbiased; the cited approach uses the model itself, twice.",
        "There is no `--self-review` flag; the answer is architectural (separate invocations), not a single-flag toggle."
      ]
    },
    {
      id: "d3.6-extra-9", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "In a CI environment, which project context does Claude Code automatically read when invoked with `-p`?",
      options: [
        "Only the prompt passed on the command line; CLAUDE.md and `.claude/rules/` are skipped for performance",
        "CLAUDE.md (project and root), applicable `.claude/rules/` files (based on the files in scope), and any matching `settings.json` — the same context discovery as an interactive session",
        "Only files explicitly named in the prompt; nothing else",
        "A separate `ci.CLAUDE.md` file that must be created specifically for CI use"
      ],
      answer: 1,
      rationales: [
        "Skipping configuration in CI would defeat the purpose of having team standards. The `-p` flag does not strip context.",
        "CI invocations discover and load CLAUDE.md, applicable `.claude/rules/` (per the files in scope), and `settings.json` the same way an interactive session does. This is why testing standards in CLAUDE.md influence CI-generated tests automatically.",
        "Context loading is not limited to files named in the prompt.",
        "There is no special `ci.CLAUDE.md` file; the normal CLAUDE.md and rules apply."
      ]
    },
    {
      id: "d3.6-extra-10", source: "extra",
      domain: "D3", topic: "d3.6", topicTitle: "CI/CD Integration",
      question: "A team adds `--output-format json --json-schema '{...}'` to their CI invocation. The schema enforces a `findings` array with `file`, `line`, `severity`, and `message`. Why is the schema enforcement valuable?",
      options: [
        "It makes Claude Code run faster by skipping prose generation",
        "It guarantees the output shape downstream parsers depend on — `severity` is always present, `line` is always an integer, etc. Without a schema, fields can drift across runs and break the inline-comment poster",
        "It restricts which files the model can read",
        "It enables Claude Code to bypass the `-p` requirement"
      ],
      answer: 1,
      rationales: [
        "Latency isn't the primary benefit; structural reliability is.",
        "Without a schema, JSON output can include or omit fields run-to-run, breaking downstream automation. The schema guarantees the contract, which is what makes automated inline-comment routing reliable.",
        "Schema constrains output, not input or file access.",
        "`-p` is independent of output format; schema doesn't bypass the non-interactive requirement."
      ]
    }
  ];

  window.EXAM_BANK.D3 = D3;
})();
