/*
 * All 6 exam scenarios. The exam randomly selects 4.
 */
window.SCENARIOS = [
  {
    id: 1,
    title: "Customer Support Resolution Agent",
    summary: "Design an AI-powered customer support agent that handles inquiries, resolves issues, and escalates complex cases. Tests Agent SDK usage, MCP tools, and escalation logic.",
    focus: [
      "Agent SDK implementation",
      "Escalation pattern design",
      "Hook-based compliance enforcement",
      "Structured error handling"
    ],
    decisions: [
      {
        q: "How should the agentic loop terminate?",
        correct: "Check stop_reason: continue on 'tool_use', exit on 'end_turn'.",
        anti: "Parsing assistant text for 'done' or 'complete' keywords."
      },
      {
        q: "How to enforce a $500 refund limit?",
        correct: "PostToolUse hook that programmatically blocks refund tool calls above $500 and escalates.",
        anti: "Adding 'never process refunds above $500' to the system prompt."
      },
      {
        q: "When should the agent escalate to a human?",
        correct: "Escalate on: explicit customer request, policy gaps, capability limits, business thresholds.",
        anti: "Escalating based on negative sentiment or self-reported low confidence."
      },
      {
        q: "How to preserve customer details in long conversations?",
        correct: "Immutable 'case facts' block at the start of context with name, account ID, order, amounts.",
        anti: "Progressive summarization that silently loses critical specifics over multiple rounds."
      }
    ],
    domainsTested: [
      "D1: Agentic loop control via stop_reason",
      "D1: Hooks for deterministic business rule enforcement",
      "D2: Structured error responses from tool failures",
      "D5: Case facts blocks for context preservation"
    ],
    strategy: "This scenario tests the intersection of agentic architecture and reliability. Focus on hook-based enforcement (not prompts) and case facts (not summarization). Every escalation question will try to trick you with sentiment-based triggers."
  },

  {
    id: 2,
    title: "Code Generation with Claude Code",
    summary: "Configure Claude Code for a development team workflow. Tests CLAUDE.md configuration, plan mode, slash commands, and iterative refinement strategies.",
    focus: [
      "CLAUDE.md hierarchy setup",
      "Plan mode vs direct execution",
      "Custom slash commands and skills",
      "TDD iteration pattern"
    ],
    decisions: [
      {
        q: "Where should team coding standards go?",
        correct: ".claude/CLAUDE.md (project-level, version-controlled, shared with team).",
        anti: "~/.claude/CLAUDE.md (user-level, personal only) or inline code comments."
      },
      {
        q: "When to use plan mode vs direct execution?",
        correct: "Plan mode for multi-file architectural changes; direct execution for simple, well-defined fixes.",
        anti: "Always using plan mode (wasteful) or never using it (risky for complex changes)."
      },
      {
        q: "How to handle complex refactoring that needs isolation?",
        correct: "Use a skill with context: fork and allowed-tools restrictions.",
        anti: "Using a simple command that runs in the main session context."
      },
      {
        q: "Best iterative refinement strategy?",
        correct: "TDD iteration: write failing test, implement, verify, refine while keeping tests green.",
        anti: "Vague instructions like 'make it better' without concrete verification criteria."
      }
    ],
    domainsTested: [
      "D3: CLAUDE.md hierarchy (user vs project vs directory)",
      "D3: Commands vs skills (isolation and tool restriction)",
      "D3: Plan mode for complex tasks",
      "D4: Explicit criteria and TDD iteration for refinement"
    ],
    strategy: "This scenario is purely about Claude Code configuration. Know the three configuration layers, when to use commands vs skills, and the TDD iteration pattern. The exam loves to test whether you put personal prefs in project config."
  },

  {
    id: 3,
    title: "Multi-Agent Research System",
    summary: "Build a coordinator-subagent system for parallel research tasks. Tests multi-agent orchestration, context passing, error propagation, and result synthesis.",
    focus: [
      "Hub-and-spoke architecture",
      "Context isolation and passing",
      "Error propagation patterns",
      "Information provenance and synthesis"
    ],
    decisions: [
      {
        q: "What architecture for parallel research tasks?",
        correct: "Hub-and-spoke: coordinator delegates to specialized subagents with isolated contexts.",
        anti: "Flat architecture where all agents share a global state or full conversation history."
      },
      {
        q: "How to pass context from coordinator to subagents?",
        correct: "Pass ONLY the context relevant to each subagent's specific task.",
        anti: "Sharing the full coordinator conversation history with every subagent."
      },
      {
        q: "How to handle conflicting data from different subagents?",
        correct: "Track information provenance (source, confidence, timestamp) and resolve based on reliability.",
        anti: "Arbitrarily choosing one result or averaging conflicting values without provenance."
      },
      {
        q: "How to handle subagent failures?",
        correct: "Structured error propagation: report what was attempted, error type, distinguish access failure from empty result.",
        anti: "Silently returning empty results for failed lookups or generic 'operation failed' errors."
      }
    ],
    domainsTested: [
      "D1: Hub-and-spoke multi-agent orchestration",
      "D1: Context isolation for subagents",
      "D5: Information provenance tracking",
      "D5: Error propagation and access failure vs empty result"
    ],
    strategy: "This is the hardest scenario. It tests multi-agent patterns deeply. The key traps are: sharing full context with subagents (always wrong), silently dropping subagent failures (always wrong), and ignoring provenance when resolving conflicts."
  },

  {
    id: 4,
    title: "Developer Productivity with Claude",
    summary: "Build developer tools using the Claude Agent SDK with built-in tools and MCP servers. Tests tool selection, codebase exploration, and code generation workflows.",
    focus: [
      "Built-in tool selection (Read, Write, Bash, Grep, Glob)",
      "MCP server integration",
      "Codebase exploration strategies",
      "Tool distribution across agents"
    ],
    decisions: [
      {
        q: "Agent has 18 tools and selects the wrong one. What to do?",
        correct: "Reduce to 4-5 tools per agent, distribute the rest across specialized subagents.",
        anti: "Making tool descriptions longer, fine-tuning the model, or switching to a larger model."
      },
      {
        q: "Which built-in tool for reading a config file?",
        correct: "Read tool (purpose-built for file reading).",
        anti: "Bash('cat config.json') — never use Bash when a dedicated tool exists."
      },
      {
        q: "How to configure project-level MCP servers?",
        correct: ".mcp.json with ${ENV_VAR} for secrets, version-controlled for the team.",
        anti: "~/.claude.json (personal only) or hardcoding API keys in config files."
      },
      {
        q: "Write vs Edit for modifying an existing file?",
        correct: "Edit for targeted changes to existing files (preserves unchanged content).",
        anti: "Write replaces the ENTIRE file — using it on existing files loses content you did not include."
      }
    ],
    domainsTested: [
      "D2: Tool distribution (4-5 per agent optimal)",
      "D2: Built-in tool selection (Read/Write/Edit/Bash/Grep/Glob)",
      "D2: MCP server configuration and secrets management",
      "D2: Tool description best practices"
    ],
    strategy: "This scenario is tool-focused. Memorize the 6 built-in tools and when to use each. The '18 tools' question is almost guaranteed — always distribute across subagents. Never use Bash when a built-in tool exists."
  },

  {
    id: 5,
    title: "Claude Code for CI/CD",
    summary: "Integrate Claude Code into continuous integration and delivery pipelines. Tests -p flag usage, structured output, batch API, and multi-pass code review.",
    focus: [
      "-p flag for non-interactive mode",
      "Structured output with --output-format json",
      "Batch API with Message Batches",
      "Session isolation for generator vs reviewer"
    ],
    decisions: [
      {
        q: "How to run Claude Code in a CI pipeline?",
        correct: "Use -p flag for non-interactive mode with --output-format json for structured results.",
        anti: "Running in interactive mode or piping commands via stdin."
      },
      {
        q: "How to review code that Claude generated?",
        correct: "Use a SEPARATE session for review (fresh context, no confirmation bias).",
        anti: "Same-session self-review where the reviewer retains the generator's reasoning."
      },
      {
        q: "Nightly code audit: synchronous or batch?",
        correct: "Message Batches API for non-urgent tasks (50% cost savings, processes within 24h).",
        anti: "Synchronous requests for non-urgent tasks (2x the cost with no benefit)."
      },
      {
        q: "How to enforce structured output from review?",
        correct: "--json-schema flag to enforce specific output shape for automated processing.",
        anti: "Parsing unstructured text output from the review with regex."
      }
    ],
    domainsTested: [
      "D3: -p flag and --output-format json for CI/CD",
      "D3: Session isolation (generator vs reviewer)",
      "D3: Batch API for non-urgent processing (50% savings)",
      "D4: Structured output via schemas"
    ],
    strategy: "Three facts to memorize: (1) -p for non-interactive, (2) NEVER self-review in the same session, (3) Batch API for non-urgent = 50% savings. These three cover most questions in this scenario."
  },

  {
    id: 6,
    title: "Structured Data Extraction",
    summary: "Build a structured data extraction pipeline from unstructured documents. Tests JSON schemas, tool_use, validation-retry loops, and few-shot prompting.",
    focus: [
      "JSON schema design for tool_use",
      "Validation-retry loop implementation",
      "Few-shot prompting for format consistency",
      "Field-level confidence and human review"
    ],
    decisions: [
      {
        q: "How to guarantee structured JSON output from extraction?",
        correct: "tool_use with JSON schema + tool_choice forcing a specific tool.",
        anti: "Prompting 'output as JSON' (not guaranteed) or post-processing with regex (fragile)."
      },
      {
        q: "Does tool_use guarantee correctness?",
        correct: "No — tool_use guarantees STRUCTURE only. Validate SEMANTICS separately with business rules.",
        anti: "Assuming tool_use output is always correct because it matched the schema."
      },
      {
        q: "What to do when extraction validation fails?",
        correct: "Append SPECIFIC error details (which field, what's wrong) and retry.",
        anti: "Generic retry: 'there were errors, try again' (no signal for what to fix)."
      },
      {
        q: "How to handle ambiguous document types?",
        correct: "Include 'other' enum value + document_type_detail field for edge cases; use 2-4 few-shot examples covering edge cases.",
        anti: "Rigid enum without 'other' category (forces misclassification of unexpected types)."
      }
    ],
    domainsTested: [
      "D4: tool_use for structured output (structure vs semantics)",
      "D4: Validation-retry loops with specific error feedback",
      "D4: Few-shot prompting (2-4 examples, edge case coverage)",
      "D5: Per-document-type accuracy tracking (stratified metrics)"
    ],
    strategy: "The critical concept here is that tool_use guarantees structure, NOT semantics. Every question about extraction reliability will test this. Also know that validation retries need SPECIFIC errors, not generic messages."
  }
];
