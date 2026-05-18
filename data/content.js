/*
 * Full study guide content — all 5 domains, 18 topics.
 * Pulled directly from the Claude Certified Architect domain pages.
 * Each topic has: concepts, anti-patterns, deep dive, code, comparison, exam tip.
 */
window.STUDY_CONTENT = {
  D1: {
    title: "Domain 1 — Agentic Architecture & Orchestration",
    weight: "~25%",
    summary: "Design and implement agentic systems using Claude's Agent SDK. Covers agentic loops, multi-agent orchestration, hooks, workflows, session management, and task decomposition patterns for production-grade AI applications.",
    examTips: [
      "Always check stop_reason for loop control, never parse natural language",
      "Programmatic hooks for business rules, prompts for preferences",
      "Subagents need explicit context — don't assume they inherit coordinator knowledge",
      "Understand fork_session vs --resume and when to use each"
    ],
    topics: [
      {
        id: "d1.1",
        title: "Agentic Loops & Core API",
        intro: "Understand how agentic loops work using the Claude Agent SDK. Learn to manage the lifecycle of agentic interactions, including the stop_reason signals, tool result appending, and the control flow of agent execution.",
        concepts: [
          "Agentic loop lifecycle: stop_reason values ('tool_use' vs 'end_turn') control loop continuation",
          "Tool result appending: after each tool call, results are appended to the conversation for the next iteration",
          "Agent SDK control flow: the SDK handles the loop automatically, but you must understand the mechanics",
          "The agent continues looping as long as stop_reason is 'tool_use'; it terminates on 'end_turn'"
        ],
        antiPatterns: [
          "Parsing natural language output to decide whether to continue the loop instead of checking stop_reason",
          "Setting arbitrary iteration caps as the primary stopping mechanism",
          "Checking assistant text content to determine loop termination"
        ],
        deepDive: [
          "The agentic loop is the core execution pattern for Claude-based agents. Unlike simple request-response interactions, an agentic loop allows Claude to iteratively plan, act, observe, and decide whether to continue or stop.",
          "How the loop works: (1) Send a message to Claude with available tools. (2) Claude responds with either text (done) or a tool call (needs to act). (3) If a tool was called, execute it and append the result to the conversation. (4) Send the updated conversation back to Claude. (5) Repeat until Claude responds with text only.",
          "The stop_reason field is the only reliable signal for loop control: 'tool_use' → continue, 'end_turn' → exit.",
          "The Agent SDK handles this loop automatically, but you must understand the mechanics because the exam tests why certain approaches work and others fail."
        ],
        code: {
          title: "agentic-loop.py — Core Loop Pattern",
          body: `import anthropic
client = anthropic.Anthropic()
tools = [{"name": "lookup_customer", "description": "...", "input_schema": {}}]
messages = [{"role": "user", "content": "Find customer John Smith"}]

# The Agentic Loop
while True:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        tools=tools,
        messages=messages
    )

    # KEY: Check stop_reason to control the loop
    if response.stop_reason == "end_turn":
        break  # Claude is done

    if response.stop_reason == "tool_use":
        tool_block = next(b for b in response.content if b.type == "tool_use")
        result = execute_tool(tool_block.name, tool_block.input)

        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{"type": "tool_result",
                         "tool_use_id": tool_block.id,
                         "content": result}]
        })`
        },
        compare: {
          bad: `# ANTI-PATTERN: Parsing natural language
while True:
    response = get_response()
    text = response.content[0].text
    if "task complete" in text.lower(): break
    if "I'm done" in text.lower(): break`,
          good: `# CORRECT: Check stop_reason field
while True:
    response = get_response()
    if response.stop_reason == "end_turn": break
    if response.stop_reason == "tool_use":
        execute_and_continue()`
        },
        examTip: "The exam will present 3-4 options for loop termination. The correct answer is ALWAYS checking stop_reason. Look for distractors like parsing text content, setting iteration limits, or monitoring token counts."
      },
      {
        id: "d1.2",
        title: "Multi-Agent Orchestration",
        intro: "Design and implement multi-agent systems using hub-and-spoke architecture. Learn coordinator roles, subagent context isolation, and parallel execution patterns.",
        concepts: [
          "Hub-and-spoke architecture: a central coordinator delegates tasks to specialized subagents",
          "Context isolation: subagents have their own context and do not share state directly",
          "Task tool for spawning subagents: allowedTools must include 'Task' for subagent creation",
          "Parallel execution: multiple Task calls in a single response enable parallel subagent work",
          "fork_session: creates branched sessions for parallel exploration without context pollution"
        ],
        antiPatterns: [
          "Overly narrow task decomposition leading to coverage gaps between subagents",
          "Sharing full coordinator context with every subagent (context pollution)",
          "Not providing explicit context when delegating to subagents"
        ],
        deepDive: [
          "Multi-agent orchestration uses a hub-and-spoke architecture where a central coordinator delegates tasks to specialized subagents. Each subagent operates in its own isolated context and returns results to the coordinator.",
          "Why hub-and-spoke beats flat architectures: Context isolation (each subagent gets only relevant context), Focused tool access (each subagent has only 4-5 tools), Parallel execution, Clean synthesis.",
          "The Task tool spawns subagents. The coordinator's allowedTools must include 'Task' to enable subagent spawning. Each Task call specifies the subagent's prompt, tools, and context. Multiple Task calls in a single response execute in parallel.",
          "Context passing rule: Pass ONLY the context specific to each subagent's task. Never share the full coordinator conversation history — it wastes tokens and confuses the subagent."
        ],
        code: {
          title: "hub-and-spoke.py — Multi-Agent Coordinator",
          body: `from claude_agent import Agent, Task

coordinator = Agent(
    model="claude-sonnet-4-20250514",
    tools=[
        Task,              # Required for spawning subagents
        summarize_results, # Coordinator-level synthesis
        format_report,     # Final output formatting
    ]
)

# Subagent with scoped tool access (4 tools each)
market_researcher = Agent(
    model="claude-sonnet-4-20250514",
    tools=[web_search, read_doc, extract_data, format_citation],
)

tech_analyst = Agent(
    model="claude-sonnet-4-20250514",
    tools=[read_code, grep_patterns, analyze_deps, format_report],
)

# Coordinator delegates with EXPLICIT context per subtask
coordinator.run("""
Research AI infrastructure market. Delegate:
1. Market research → market_researcher
2. Technology analysis → tech_analyst
Pass each subagent ONLY the context relevant to their task.
""")`
        },
        compare: {
          bad: `# Sharing FULL coordinator context with subagent
Task(
    prompt="Research market size",
    context=coordinator.full_conversation_history,
    # 90% of this context is irrelevant
)`,
          good: `# Passing EXPLICIT relevant context per subtask
Task(
    prompt="Research AI infrastructure market size",
    context="Focus: market size in USD, YoY growth, top 3 vendors",
    # Only what this subagent needs
)`
        },
        examTip: "The exam tests context isolation heavily. If an answer shares full coordinator context with subagents, it's wrong. Each subagent should receive only context specific to its assigned subtask."
      },
      {
        id: "d1.3",
        title: "Hooks & Programmatic Enforcement",
        intro: "Use hooks for data normalization, tool call interception, and compliance enforcement. Understand when to use programmatic enforcement vs prompt-based guidance.",
        concepts: [
          "PostToolUse hooks: intercept and modify tool outputs for data normalization",
          "Programmatic enforcement for critical business rules (deterministic, not probabilistic)",
          "Prompt-based guidance for soft preferences and style suggestions",
          "Hook-based blocking: e.g., blocking refunds above $500 and redirecting to escalation"
        ],
        antiPatterns: [
          "Using prompt-based enforcement for critical business rules (unreliable)",
          "Self-reported confidence scores for escalation decisions (model confidence is unreliable)",
          "Sentiment-based escalation (sentiment does not equal complexity)"
        ],
        deepDive: [
          "Hooks provide deterministic, programmatic enforcement of business rules. They intercept tool calls before or after execution, allowing you to block, modify, or augment behavior without relying on model compliance.",
          "Critical distinction: Hooks = Deterministic (100% reliable) → critical business rules, compliance, security. Prompts = Probabilistic (model may ignore) → style preferences, soft guidelines.",
          "PreToolUse: intercepts before tool execution — can block, modify params, add validation. PostToolUse: intercepts after execution — can modify output, normalize data, trigger side effects.",
          "Valid escalation triggers: customer explicitly requests a human, policy gap detected, task exceeds agent capabilities, business threshold exceeded (e.g., refund > $500).",
          "Invalid triggers: negative sentiment (sentiment ≠ task complexity), self-reported low confidence (model confidence is unreliable)."
        ],
        code: {
          title: "hooks.py — Programmatic Business Rule Enforcement",
          body: `from claude_agent import Agent, Hook

# PostToolUse hook: Block refunds above $500
def refund_limit_hook(tool_name, tool_input, tool_output):
    if tool_name == "process_refund":
        amount = tool_input.get("amount", 0)
        if amount > 500:
            return {
                "blocked": True,
                "reason": f"Refund \${amount} exceeds \$500 limit",
                "action": "escalate_to_human",
                "context": {
                    "customer_id": tool_input.get("customer_id"),
                    "requested_amount": amount,
                    "agent_limit": 500,
                }
            }
    return tool_output  # Allow all other tool calls

agent = Agent(
    model="claude-sonnet-4-20250514",
    tools=[lookup_customer, check_order, process_refund],
    hooks={"PostToolUse": [refund_limit_hook]},
)`
        },
        compare: {
          bad: `# ANTI-PATTERN: Prompt-based enforcement
system_prompt = """
IMPORTANT: Never process refunds above $500.
If a refund is above $500, escalate to a human.
"""
# Probabilistic — the model CAN and WILL sometimes ignore`,
          good: `# CORRECT: Hook-based enforcement
def refund_limit_hook(tool_name, tool_input, output):
    if tool_name == "process_refund":
        if tool_input["amount"] > 500:
            return {"blocked": True, "action": "escalate"}
    return output
# Runs as CODE, not as a suggestion`
        },
        examTip: "When the exam asks about enforcing critical business rules (refund limits, data access, compliance), the correct answer is ALWAYS programmatic hooks, never prompt instructions."
      },
      {
        id: "d1.4",
        title: "Session Management & Workflows",
        intro: "Manage agent sessions, including resuming, forking, and preventing stale context. Understand task decomposition strategies from prompt chaining to dynamic adaptive decomposition.",
        concepts: [
          "--resume flag: continue previous sessions with preserved context",
          "fork_session: branch sessions for exploration without polluting the main context",
          "Named sessions for organized multi-session workflows",
          "Stale context detection and mitigation in long-running sessions",
          "Prompt chaining vs dynamic adaptive decomposition: choose based on task predictability"
        ],
        antiPatterns: [
          "Ignoring stale context in extended sessions",
          "Using static prompt chains for tasks that require dynamic adaptation"
        ],
        deepDive: [
          "Key session operations: Resume (--resume) — Continue a previous session with full context. Fork (fork_session) — Create a branch for exploration without polluting the main session. Named sessions (--session-name) — Organize multi-session workflows.",
          "Stale context is a critical risk in long-running sessions — data retrieved early may become outdated. Mitigation: periodically re-fetch critical data, use scratchpad files.",
          "Task decomposition strategies: Prompt chaining — Predictable, linear tasks with static sequence of steps. Dynamic adaptive — Unpredictable, complex tasks where the agent decides next steps based on results.",
          "Dynamic adaptive decomposition is preferred when the task has unknown complexity or intermediate results may change the approach. Prompt chaining works when the workflow is well-defined and each step's input/output is predictable."
        ],
        code: {
          title: "session-management.sh — Session Operations",
          body: `# Resume a previous session (preserves full context)
claude --resume

# Resume a specific named session
claude --resume --session-name "feature-auth-redesign"

# Fork for exploration (inherits context, diverges)
# Changes in fork do NOT affect the main session
claude fork_session --reason "Exploring alternative API"

# Start a new named session
claude --session-name "sprint-47-backend"`
        },
        compare: {
          bad: `# Static prompt chain for a DYNAMIC task
steps = [
    "Step 1: Read the codebase",
    "Step 2: Find all bugs",
    "Step 3: Fix each bug",
]
# What if step 2 finds no bugs?
# Static chains can't adapt`,
          good: `# Dynamic adaptive decomposition
agent.run("""
Analyze the codebase for issues. For each:
1. Assess severity and complexity
2. If simple: fix directly
3. If complex: create a plan first
4. After each fix: run relevant tests
Adapt your approach based on what you find.
""")`
        },
        examTip: "If the task is unpredictable or has conditional branches, dynamic adaptive decomposition is correct. If it's a fixed, linear pipeline, prompt chaining works."
      }
    ]
  },

  D2: {
    title: "Domain 2 — Tool Design & MCP Integration",
    weight: "~20%",
    summary: "Design effective tools and integrate with Model Context Protocol (MCP) servers. Covers tool description best practices, structured error responses, tool distribution, MCP configuration, and Claude's built-in tools.",
    examTips: [
      "Keep tools per agent to 4-5 for optimal selection quality",
      "Structured error responses are critical — always include isError, errorCategory, isRetryable",
      "Know the difference between .mcp.json (project) and ~/.claude.json (user)",
      "Built-in tools: know when to use Grep vs Glob vs Read"
    ],
    topics: [
      {
        id: "d2.1",
        title: "Tool Description Best Practices",
        intro: "Write clear, effective tool descriptions that help Claude select and use tools correctly. Include input formats, examples, edge cases, and boundary conditions.",
        concepts: [
          "Include input format specifications with examples in the tool description",
          "Specify edge cases and boundary conditions so the model handles them correctly",
          "Clear parameter descriptions with expected types, ranges, and constraints",
          "Tool descriptions act as documentation for the model — more detail is better"
        ],
        antiPatterns: [
          "Vague tool descriptions that leave ambiguity about when or how to use the tool",
          "Missing edge case documentation leading to unexpected tool behavior"
        ],
        deepDive: [
          "Tool descriptions are the primary mechanism Claude uses to decide when and how to use a tool. Think of them as documentation written specifically for the model.",
          "What makes a great tool description: Clear purpose (one sentence), input specifications (exact types, formats, ranges, constraints), examples (input/output pairs for common cases), edge cases (empty inputs, invalid data, boundary values), when NOT to use (clarify tool boundaries to prevent misuse).",
          "A vague description like 'Searches for customers' forces Claude to guess. A detailed description removes all ambiguity: 'Search for customers by email, phone, or account ID. Email must include @. Phone must be E.164 format (+1XXXXXXXXXX). Returns max 10 results. Returns empty array if no matches found.'"
        ],
        code: {
          title: "tool-description.json — Well-Designed Tool",
          body: `{
  "name": "lookup_customer",
  "description": "Search for a customer by email, phone number, or account ID. Returns customer profile including name, account status, and order history summary. Input: exactly ONE of email, phone, or account_id. Email must contain @. Phone must be E.164 format (e.g., +15551234567). Account ID must start with ACC-. Returns: customer object or empty array if not found. Note: empty result means customer not found, this is NOT an error.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string", "description": "Customer email (must contain @)" },
      "phone": { "type": "string", "description": "Phone in E.164 format" },
      "account_id": { "type": "string", "description": "Account ID starting with ACC-" }
    }
  }
}`
        },
        compare: {
          bad: `{
  "name": "search",
  "description": "Searches for stuff",
  "input_schema": {
    "type": "object",
    "properties": { "query": { "type": "string" } }
  }
}
// What does it search? What format? When to use?`,
          good: `{
  "name": "lookup_customer",
  "description": "Search by email, phone (E.164),
    or account ID (ACC-XXXXX). Returns customer or
    empty array. Empty result is NOT an error.",
  "input_schema": { ... }
}`
        },
        examTip: "The exam will present tool descriptions of varying quality. The correct answer always has the most detailed description with input formats, examples, edge cases, and boundary documentation."
      },
      {
        id: "d2.2",
        title: "Structured Error Responses",
        intro: "Design error responses that give the agent enough information to recover or escalate. Use structured fields like isError, errorCategory, and isRetryable.",
        concepts: [
          "isError flag: explicitly signals tool failure to the agent",
          "errorCategory: classifies errors (e.g., 'validation', 'auth', 'not_found', 'rate_limit')",
          "isRetryable: tells the agent whether retrying the same call might succeed",
          "Structured error context: include what was attempted and what failed"
        ],
        antiPatterns: [
          "Generic error messages like 'Operation failed' that hide useful context",
          "Silently suppressing errors by returning empty results as success",
          "Not distinguishing between access failures and genuinely empty results"
        ],
        deepDive: [
          "When a tool fails, the error response must give the agent enough information to decide what to do next: retry, try an alternative, or escalate.",
          "Structured error response fields: isError (failure flag), errorCategory ('auth', 'not_found', 'rate_limit', 'timeout', 'validation'), isRetryable (should the agent try again?), context (what was attempted and what failed).",
          "Critical distinction — Access Failure vs Empty Result. Access Failure: 'I couldn't check the database' → isError: true (search NOT performed). Empty Result: 'I checked the database, found nothing' → isError: false (search WAS performed).",
          "Never silently suppress access failures by returning empty results. If the database was down, returning [] makes the agent think no customers exist — a catastrophic misunderstanding."
        ],
        code: {
          title: "structured-error.json — Error Response Design",
          body: `{
  "access_failure_example": {
    "isError": true,
    "errorCategory": "timeout",
    "isRetryable": true,
    "context": {
      "attempted": "Customer lookup by email: user@example.com",
      "service": "customer-database",
      "timeout_ms": 5000,
      "suggestion": "Retry after 2 seconds or try account ID lookup"
    }
  },
  "empty_result_example": {
    "isError": false,
    "customers": [],
    "metadata": {
      "searched_by": "email",
      "query": "user@example.com",
      "results_count": 0
    }
  }
}`
        },
        compare: {
          bad: `// Database is DOWN but we return empty
{ "customers": [] }
// Agent thinks: "No customers found"
// Reality: "We couldn't even check!"
// SILENT, CATASTROPHIC error`,
          good: `// Database is DOWN — report explicitly
{
  "isError": true,
  "errorCategory": "timeout",
  "isRetryable": true,
  "context": { "attempted": "...", "suggestion": "..." }
}
// Agent knows the search FAILED`
        },
        examTip: "If an exam question asks about a tool that fails to connect to an external service, the correct answer ALWAYS distinguishes the access failure from an empty result. Returning [] for a failed connection is always wrong."
      },
      {
        id: "d2.3",
        title: "Tool Distribution & Selection",
        intro: "Distribute tools across agents effectively. Understand the impact of tool count on selection quality and how to scope tool access.",
        concepts: [
          "4-5 tools per agent is optimal; too many tools (e.g., 18) degrades selection quality",
          "Scoped tool access: each agent only gets tools relevant to its task",
          "tool_choice options: 'auto' (model decides), 'any' (must use a tool), or forced specific tool",
          "Tool grouping: organize related tools and assign them to specialized agents"
        ],
        antiPatterns: [
          "Giving an agent 18+ tools when only 4-5 are relevant to its task",
          "Not using tool_choice to constrain tool selection when the task is clear"
        ],
        deepDive: [
          "The number of tools given to a single agent directly impacts its ability to select the correct one. Research shows that 4-5 tools per agent is optimal.",
          "Why too many tools is a problem: With 18+ tools, Claude must evaluate each against the current task. Similar tools create ambiguity (search_customers vs find_customer vs lookup_user). Selection accuracy degrades. More tool descriptions consume context.",
          "Solution: distribute tools across specialized subagents. Instead of one agent with 18 tools, create a coordinator with 3-4 subagents, each with 4-5 focused tools.",
          "tool_choice parameter: 'auto' (Claude decides), 'any' (must use a tool but can choose which), {type:'tool',name:'X'} (force specific tool)."
        ],
        code: {
          title: "tool-distribution.py — Distribute Tools Across Agents",
          body: `# WRONG: One agent with too many tools
overloaded_agent = Agent(
    tools=[
        lookup_customer, update_account, verify_identity,
        find_order, process_refund, update_shipping,
        track_package, send_email, send_sms,
        create_ticket, escalate, search_kb,
        check_inventory, apply_coupon, schedule_callback,
        log_interaction, generate_report, update_preferences,
    ]  # 18 tools — selection quality degrades!
)

# CORRECT: Coordinator + specialized subagents
coordinator = Agent(tools=[Task, summarize_results, format_response])
customer_agent = Agent(tools=[lookup_customer, update_account, verify_identity, check_status])
order_agent = Agent(tools=[find_order, process_refund, update_shipping, track_package])
comms_agent = Agent(tools=[send_email, send_sms, create_ticket, escalate_human])`
        },
        examTip: "When the exam presents a scenario with many tools, the correct answer is ALWAYS distributing them across specialized subagents with 4-5 tools each."
      },
      {
        id: "d2.4",
        title: "MCP Server Configuration",
        intro: "Configure Model Context Protocol servers for project-level and user-level tool integration. Understand .mcp.json vs ~/.claude.json configuration.",
        concepts: [
          ".mcp.json: project-level MCP server configuration (shared with team)",
          "~/.claude.json: user-level MCP configuration (personal tools)",
          "Environment variable expansion in MCP config for secrets management",
          "MCP servers extend Claude's capabilities with custom tools and data sources"
        ],
        antiPatterns: [
          "Hardcoding secrets in .mcp.json instead of using environment variable expansion",
          "Mixing project-level and user-level configs without understanding precedence"
        ],
        deepDive: [
          "MCP servers extend Claude's capabilities with custom tools and data sources. Configuration happens at two levels.",
          ".mcp.json (Project-level) — Shared via version control, team tools, project-specific integrations. ~/.claude.json (User-level) — Personal, not shared, individual API keys.",
          "Security: never hardcode secrets. Use ${ENV_VAR} syntax — secrets stay out of version control, each developer uses own credentials, CI/CD injects environment-specific values.",
          "MCP servers can provide: Tools (custom functions Claude can call), Resources (static data/docs), Prompts (pre-built templates)."
        ],
        code: {
          title: ".mcp.json — Project-Level MCP Configuration",
          body: `{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["@company/jira-mcp-server"],
      "env": {
        "JIRA_URL": "\${JIRA_URL}",
        "JIRA_TOKEN": "\${JIRA_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["@company/pg-mcp-server", "--read-only"],
      "env": {
        "DATABASE_URL": "\${DATABASE_URL}"
      }
    }
  }
}`
        },
        compare: {
          bad: `// NEVER hardcode secrets
{
  "mcpServers": {
    "jira": {
      "env": { "JIRA_TOKEN": "sk-abc123-real-key" }
    }
  }
}
// Committed to git = leaked secrets!`,
          good: `// Use environment variable expansion
{
  "mcpServers": {
    "jira": { "env": { "JIRA_TOKEN": "\${JIRA_TOKEN}" } }
  }
}
// Secret stays in environment`
        },
        examTip: "If an exam answer hardcodes API keys in .mcp.json, it's always wrong. The correct approach uses ${ENV_VAR} for secrets management."
      },
      {
        id: "d2.5",
        title: "Built-in Tools",
        intro: "Understand Claude's built-in tools: Read, Write, Edit, Bash, Grep, and Glob. Know when to use each tool for different tasks.",
        concepts: [
          "Read: read file contents for understanding code or data",
          "Write: create new files from scratch",
          "Edit: modify existing files with targeted changes",
          "Bash: execute shell commands for building, testing, and system operations",
          "Grep: search for patterns across files in a codebase",
          "Glob: find files matching patterns for discovery and navigation"
        ],
        antiPatterns: [
          "Using Write when Edit would be more precise for modifying existing files",
          "Using Bash for file operations when Read/Write/Edit are available"
        ],
        deepDive: [
          "Claude Code comes with 6 built-in tools. Knowing when to use each is heavily tested on the exam.",
          "Write vs Edit: Use Write for new files only. Use Edit for modifying existing files. Write replaces the entire file.",
          "Bash vs built-in tools: Never use Bash for operations that have dedicated tools. Don't use cat file.txt when Read exists.",
          "Grep vs Glob: Grep searches inside files for content patterns. Glob searches file names for path patterns."
        ],
        code: {
          title: "built-in-tools-usage.md — Correct Tool Selection",
          body: `Task: "Read the configuration file"
  Correct: Read("config.json")
  Wrong:   Bash("cat config.json")

Task: "Create a new test file"
  Correct: Write("tests/new-test.ts", content)
  Wrong:   Bash("echo '...' > tests/new-test.ts")

Task: "Fix a bug in line 42 of server.ts"
  Correct: Edit("server.ts", old_text, new_text)
  Wrong:   Write("server.ts", entire_file_content)

Task: "Find all usages of getUserById"
  Correct: Grep("getUserById", "src/")
  Wrong:   Bash("grep -r 'getUserById' src/")

Task: "Find all TypeScript test files"
  Correct: Glob("**/*.test.ts")
  Wrong:   Bash("find . -name '*.test.ts'")

Task: "Run the test suite"
  Correct: Bash("npm test")
  (No built-in alternative — Bash is correct)`
        },
        examTip: "The exam frequently presents scenarios where an agent uses Bash for file operations. The correct answer always uses the purpose-built tool (Read, Write, Edit, Grep, Glob) instead of Bash equivalents."
      }
    ]
  },

  D3: {
    title: "Domain 3 — Claude Code Configuration & Workflows",
    weight: "~20%",
    summary: "Configure Claude Code for development workflows. Covers CLAUDE.md hierarchy, custom commands and skills, plan mode, iterative refinement, CI/CD integration, and batch processing.",
    examTips: [
      "Know the CLAUDE.md hierarchy: user > project > directory (specificity overrides generality)",
      "Understand when to use plan mode vs direct execution",
      "CI/CD uses -p flag with --output-format json for automation",
      "Batch API offers 50% savings — know when to use synchronous vs batch"
    ],
    topics: [
      {
        id: "d3.1",
        title: "CLAUDE.md Hierarchy & Configuration",
        intro: "Understand the CLAUDE.md configuration hierarchy and how project, user, and directory-level settings interact.",
        concepts: [
          "User-level: ~/.claude/CLAUDE.md (personal preferences across all projects)",
          "Project-level: .claude/CLAUDE.md (shared team configuration)",
          "Directory-level: CLAUDE.md in any directory (scoped to that directory and below)",
          "@import syntax: include external markdown files for modular configuration",
          ".claude/rules/ directory: topic-specific rule files for organized configuration"
        ],
        antiPatterns: [
          "Putting all configuration in one massive CLAUDE.md instead of using modular rules",
          "Not understanding the precedence of user vs project vs directory configs"
        ],
        deepDive: [
          "Claude Code uses a hierarchical configuration system with three layers that merge together.",
          "User (~/.claude/CLAUDE.md) — Personal preferences, not shared. Project (.claude/CLAUDE.md) — Team standards, shared via git. Directory (src/api/CLAUDE.md) — Scoped to that directory and below.",
          "Precedence: More specific configs override more general ones. Directory-level > Project-level > User-level.",
          "Modular configuration with @import and .claude/rules/: split rules into topic-specific files instead of one massive CLAUDE.md. @import ./rules/typescript.md pulls in TypeScript rules. Files in .claude/rules/ are auto-loaded. Rules can have path-specific scope using YAML frontmatter with paths glob patterns."
        ],
        code: {
          title: "Configuration Hierarchy — File Structure",
          body: `~/.claude/
  CLAUDE.md                    # USER LEVEL (personal, not shared)
    "Use vim keybindings"
    "Prefer dark theme output"

project/
  .claude/
    CLAUDE.md                  # PROJECT LEVEL (shared via git)
      "Use TypeScript with strict mode"
      "Follow ESLint airbnb config"
      "@import ./rules/api-design.md"
    rules/
      typescript.md            # Auto-loaded rule file
      testing.md               # Auto-loaded rule file
      api-design.md            # Imported by CLAUDE.md
    commands/
      review.md                # /review slash command
      deploy.md                # /deploy slash command
    skills/
      refactor/
        SKILL.md               # Refactoring skill (forked context)
  src/
    api/
      CLAUDE.md                # DIRECTORY LEVEL (scoped rules)
        "All endpoints must validate auth tokens"
        "Use Zod schemas for request validation"`
        },
        compare: {
          bad: `# One massive CLAUDE.md mixed
# .claude/CLAUDE.md (800 lines)
Use TypeScript strict mode.
Follow ESLint airbnb.
Use vim keybindings.     # Personal!
REST endpoints follow...
All functions need tests...
API auth validation...   # Should be directory-scoped`,
          good: `# Modular: split by concern and scope
# .claude/CLAUDE.md (project)
  Use TypeScript strict mode.
  @import ./rules/testing.md

# ~/.claude/CLAUDE.md (personal)
  Use vim keybindings.

# src/api/CLAUDE.md (directory-scoped)
  All endpoints must validate auth tokens.`
        },
        examTip: "Personal preferences go in user-level config. Team standards go in project-level. Module-specific rules go in directory-level. If an answer puts personal preferences in project config, it's wrong."
      },
      {
        id: "d3.2",
        title: "Custom Commands & Skills",
        intro: "Create custom slash commands and skills to extend Claude Code's capabilities for your team.",
        concepts: [
          "Custom slash commands: .claude/commands/ directory for team-shareable shortcuts",
          "Skills: .claude/skills/ directory with SKILL.md for complex, reusable behaviors",
          "SKILL.md frontmatter: context: fork, allowed-tools, argument-hint",
          "Path-specific rules: YAML frontmatter with paths glob patterns for targeted configuration"
        ],
        antiPatterns: [
          "Using commands when skills (with forked context) would be more appropriate",
          "Not specifying allowed-tools in skills, leaving overly broad tool access"
        ],
        deepDive: [
          "Claude Code supports two extension mechanisms: custom commands and skills.",
          "Custom Commands (.claude/commands/): Simple slash commands like /review, /deploy, /test. Defined as markdown files. Run in current session context. Good for quick one-step actions. Shared with team via version control.",
          "Skills (.claude/skills/): Complex multi-step reusable behaviors. Defined as SKILL.md with YAML frontmatter. Can fork context (isolated). Can restrict tool access via allowed-tools. Good for complex operations needing isolation.",
          "SKILL.md frontmatter: context: fork (isolated context), allowed-tools (restrict tools), argument-hint (describe expected argument).",
          "When to use which: Command for 'run lint and show errors'. Skill for 'refactor module to use dependency injection'."
        ],
        code: {
          title: ".claude/skills/refactor/SKILL.md",
          body: `---
context: fork
allowed-tools:
  - Read
  - Edit
  - Grep
argument-hint: "file or directory to refactor"
---

# Refactoring Skill

When asked to refactor code, follow these steps:
1. **Analyze** the current code structure using Read and Grep
2. **Identify** patterns that violate SOLID principles
3. **Plan** the refactoring approach before making changes
4. **Apply** changes incrementally using Edit (never Write)
5. **Verify** each change maintains existing behavior

## Rules
- Never delete existing tests
- Preserve all public API signatures
- Add JSDoc comments to refactored functions`
        },
        compare: {
          bad: `# Using a command for complex exploration
# .claude/commands/refactor.md
Refactor the given code to use dependency injection.
Look through all files and restructure.
# Runs in main context, pollutes it
# No tool restrictions`,
          good: `# Using a skill with forked context
# .claude/skills/refactor/SKILL.md
---
context: fork
allowed-tools: [Read, Edit, Grep]
---
Refactor the given code to use DI.
# Exploration stays in fork. Restricted tools.`
        },
        examTip: "If the task requires context isolation or tool restriction, the answer is a skill (not a command). Look for context: fork and allowed-tools in the correct answer."
      },
      {
        id: "d3.3",
        title: "Plan Mode & Iterative Refinement",
        intro: "Use plan mode for complex tasks and iterative refinement patterns to improve output quality progressively.",
        concepts: [
          "Plan mode: think before acting — useful for complex multi-step tasks",
          "Direct execution: appropriate for well-defined, simple tasks",
          "Iterative refinement: concrete examples, TDD iteration, interview pattern",
          "TDD iteration: write tests first, then implement, then refine until tests pass"
        ],
        antiPatterns: [
          "Using plan mode for simple, well-defined tasks (unnecessary overhead)",
          "Skipping planning for complex tasks that need architectural thinking first"
        ],
        deepDive: [
          "Plan mode tells Claude to think and outline an approach before executing.",
          "Use plan mode for: multi-file architectural changes, tasks affecting many components, expensive-to-undo mistakes, new feature implementation requiring design decisions.",
          "Use direct execution for: simple well-defined tasks (fix a typo), single-file changes with clear scope, tasks where the correct approach is obvious.",
          "Iterative refinement patterns: Concrete examples ('Here's what I want: [specific]'), TDD iteration (Write tests → implement → test → refine), Interview pattern ('Ask me 3 questions before you start').",
          "TDD iteration cycle: (1) Write failing test → defines expected behavior. (2) Implement → make test pass. (3) Run tests → verify. (4) Refine → improve quality while keeping tests green. (5) Repeat. Dramatically improves output quality."
        ],
        code: {
          title: "TDD Iteration with Claude Code",
          body: `# Step 1: Write the test first (defines the goal)
You: "Write a test for getUserById that:
      - Returns user with id, name, email
      - Throws NotFoundError if user doesn't exist
      - Validates that id is a positive integer"

# Step 2: Run the test (should fail)
You: "Run the test"
Claude: "Test fails: getUserById is not defined"

# Step 3: Implement to pass the test
You: "Implement getUserById to pass all tests"
Claude: [implements the function]

# Step 4: Run tests again (should pass)
You: "Run the tests"
Claude: "All 3 tests pass"

# Step 5: Refine the implementation
You: "Add input sanitization and connection pooling,
      keeping all tests green"`
        },
        examTip: "For complex multi-file tasks use plan mode. For simple fixes use direct execution. TDD iteration (write test, implement, verify) is the preferred refinement pattern."
      },
      {
        id: "d3.4",
        title: "CI/CD Integration & Batch Processing",
        intro: "Integrate Claude Code into CI/CD pipelines using the -p flag and structured output. Leverage batch processing for cost optimization.",
        concepts: [
          "-p flag: run Claude Code in non-interactive mode for CI/CD pipelines",
          "--output-format json: get structured output for automated processing",
          "--json-schema: enforce specific output schemas",
          "Session context isolation in CI: separate generator and reviewer contexts",
          "Message Batches API: 50% cost savings with 24-hour processing window",
          "custom_id: track individual requests in batch processing"
        ],
        antiPatterns: [
          "Using interactive mode in CI/CD pipelines",
          "Same-session self-review (retains reasoning context bias)",
          "Not isolating generator and reviewer sessions in code review pipelines"
        ],
        deepDive: [
          "Key CI/CD flags: -p (non-interactive mode), --output-format json (structured JSON output), --json-schema (enforce specific output shape).",
          "Session isolation for code review: the generator session must be completely separate from the reviewer. If the reviewer runs in the same session, it retains generator's reasoning, creating confirmation bias.",
          "Batch processing with Message Batches API: processes within 24 hours (non-blocking), 50% cost savings, each request gets a custom_id, use for nightly audits, weekly reviews, non-urgent analysis. Don't use for blocking PR reviews or real-time feedback."
        ],
        code: {
          title: "ci-review.yml — CI/CD Code Review Pipeline",
          body: `name: Claude Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Use -p for non-interactive mode
      # Use a SEPARATE session from code generation
      - name: Run Claude Code Review
        run: |
          claude -p "Review this PR diff for:
            1. Functions exceeding 50 lines
            2. Missing error handling on async ops
            3. Hardcoded credentials or API keys
            4. Missing unit tests for new functions
          Provide results as structured JSON." \\
          --output-format json \\
          --json-schema '{
            "type": "object",
            "properties": {
              "issues": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "file": {"type": "string"},
                    "severity": {"type": "string"},
                    "description": {"type": "string"}
                  }
                }
              }
            }
          }'`
        },
        compare: {
          bad: `# Same-session self-review
claude -p "Write a new auth module"  # Session A
claude --resume -p "Review your code"  # SAME!
# Reviewer retains reasoning = confirmation bias`,
          good: `# Separate session for review
claude -p "Write a new auth module"   # Session A
claude -p "Review this diff: ..."     # Session B (fresh)
# Reviewer has no context from generation`
        },
        examTip: "Three must-know CI/CD facts: (1) Always use -p for non-interactive mode. (2) Never self-review in the same session. (3) Use Batch API for non-urgent reviews (50% savings)."
      }
    ]
  },

  D4: {
    title: "Domain 4 — Prompt Engineering & Structured Output",
    weight: "~20%",
    summary: "Master prompt engineering techniques for production systems. Covers explicit criteria, few-shot prompting, tool_use for structured output, JSON schema design, validation-retry loops, and multi-pass review strategies.",
    examTips: [
      "Explicit, measurable criteria > vague instructions (always)",
      "2-4 few-shot examples is the sweet spot for ambiguous tasks",
      "tool_use = structural compliance, NOT semantic correctness",
      "Same-session self-review is an anti-pattern — use separate sessions"
    ],
    topics: [
      {
        id: "d4.1",
        title: "Explicit Criteria & Instruction Design",
        intro: "Write prompts with explicit, measurable criteria instead of vague instructions. Understand how false positives impact developer trust.",
        concepts: [
          "Explicit criteria over vague instructions: 'flag functions over 50 lines' vs 'flag long functions'",
          "False positive impact: too many false positives erode developer trust in the system",
          "Specificity reduces ambiguity and improves consistency across runs",
          "Measurable criteria enable automated validation of output quality"
        ],
        antiPatterns: [
          "Vague instructions like 'make it better' or 'improve the code'",
          "Not considering the downstream impact of false positives"
        ],
        deepDive: [
          "Production prompts require explicit, measurable criteria instead of vague instructions.",
          "Why vagueness fails in production: 'Make it better' — better how? 'Find issues' — what counts? 'Be thorough' — leads to over-flagging, false positives, eroded trust.",
          "False positive problem: when a code review tool flags too many non-issues, developers start ignoring ALL flags — including real problems. This is alert fatigue, directly tested on the exam.",
          "The fix — measurable criteria: 'flag functions exceeding 50 lines of code' instead of 'flag long functions'. 'Identify hardcoded strings matching patterns for API keys, passwords, or connection strings' instead of 'find security issues'.",
          "Measurable criteria enable consistent results, automated validation, reduced false positives, and developer trust."
        ],
        code: {
          title: "explicit-criteria.py — Vague vs Explicit",
          body: `# VAGUE: Inconsistent, over-flags
vague_prompt = """
Review this code for quality issues.
Be thorough and flag anything suspicious.
"""

# EXPLICIT: Consistent, actionable
explicit_prompt = """
Review this code and flag ONLY the following:
1. Functions exceeding 50 lines of code
2. Async operations missing try-catch error handling
3. Hardcoded strings matching API key patterns (sk-, pk-, key-)
4. Public functions missing JSDoc documentation
5. SQL queries constructed with string concatenation

For each issue found, provide:
- File path and line number
- Which rule (1-5) was violated
- Severity: critical (3,5) | warning (1,2) | info (4)
- One-line fix suggestion
"""`
        },
        examTip: "Every time the exam asks about prompt design for production systems, the correct answer uses specific, measurable criteria. If an option says 'be thorough' or 'find all issues,' it's wrong."
      },
      {
        id: "d4.2",
        title: "Few-Shot Prompting",
        intro: "Use few-shot examples to guide Claude's output format and reasoning. Know when and how many examples to provide.",
        concepts: [
          "2-4 examples: optimal for ambiguous cases to establish format and reasoning patterns",
          "Format consistency: all examples should follow the same output structure",
          "Edge case coverage: include at least one example that handles an edge case",
          "Few-shot is most valuable when the task has ambiguous boundaries"
        ],
        antiPatterns: [
          "Too many examples (>6) that bloat the prompt without adding value",
          "Inconsistent formatting across examples confusing the model"
        ],
        deepDive: [
          "Few-shot prompting provides 2-4 examples that establish expected output format, reasoning pattern, and edge case handling.",
          "Golden rules: 2-4 examples (fewer doesn't establish pattern; more bloats), format consistency (all examples follow identical structure), edge case coverage (at least one ambiguous case), diversity.",
          "Most valuable when: ambiguous classification (sentiment with sarcasm), custom output formats, domain-specific reasoning, fuzzy boundaries.",
          "Unnecessary for: simple well-defined tasks, clear objective criteria, standard formats (JSON, XML)."
        ],
        code: {
          title: "few-shot.py — Well-Structured Examples",
          body: `few_shot_prompt = """
Classify customer reviews. Provide sentiment and reasoning.

Example 1 (Clear positive):
Input: "Absolutely love this product! Best purchase this year."
Output: {"sentiment": "positive", "confidence": "high",
         "reasoning": "Strong positive language, superlative"}

Example 2 (Clear negative):
Input: "Terrible experience. Product broke after 2 days."
Output: {"sentiment": "negative", "confidence": "high",
         "reasoning": "Explicit negative + product failure"}

Example 3 (Ambiguous — mixed sentiment):
Input: "Great features but the battery life is disappointing."
Output: {"sentiment": "mixed", "confidence": "medium",
         "reasoning": "Positive on features, negative on battery"}

Example 4 (Edge case — sarcasm):
Input: "Oh wonderful, another update that breaks everything."
Output: {"sentiment": "negative", "confidence": "medium",
         "reasoning": "Sarcastic positive masking frustration"}

Now classify this review:
Input: "{user_review}"
"""`
        },
        examTip: "The exam tests whether you know the optimal number of few-shot examples (2-4) and that at least one should cover an edge case. More than 6 examples is always wrong."
      },
      {
        id: "d4.3",
        title: "Tool Use for Structured Output",
        intro: "Use tool_use to guarantee JSON schema compliance. Understand the difference between schema compliance and semantic correctness.",
        concepts: [
          "tool_use guarantees JSON schema compliance — the output will match the defined structure",
          "Semantic errors are still possible: the structure is correct but the content may be wrong",
          "tool_choice options: 'auto', 'any', or forced specific tool for guaranteed invocation",
          "Schema design: required vs optional fields, enums with 'other' + detail, nullable fields"
        ],
        antiPatterns: [
          "Assuming tool_use eliminates all errors (it only guarantees structural compliance)",
          "Not using enums with 'other' category for fields that may have unexpected values"
        ],
        deepDive: [
          "tool_use is the most reliable way to get structured output. By defining a tool with a JSON schema, you guarantee the output matches the schema structure.",
          "Critical distinction: tool_use guarantees STRUCTURE — required fields present, correct types, valid enum values. tool_use does NOT guarantee SEMANTICS — values might be wrong (wrong name, wrong date).",
          "Still need validation after extraction. Schema ensures valid JSON, but content inside might contain errors.",
          "tool_choice: 'auto' (default), 'any' (must use a tool), {type:'tool',name:'X'} (force specific tool — guarantees schema compliance for extraction).",
          "Schema design best practices: always include 'required' for mandatory fields, use 'enum' for categorical fields, include 'other' category in enums + detail field for edge cases, use ['string','null'] for missing fields, add 'description' to each property."
        ],
        code: {
          title: "tool-use-extraction.py — Structured Output via tool_use",
          body: `import anthropic
client = anthropic.Anthropic()

extract_tool = {
    "name": "extract_invoice",
    "description": "Extract structured data from an invoice",
    "input_schema": {
        "type": "object",
        "properties": {
            "vendor_name": {"type": "string"},
            "invoice_number": {"type": "string"},
            "date": {"type": "string", "description": "ISO 8601"},
            "total": {"type": "number"},
            "document_type": {
                "type": "string",
                "enum": ["standard_invoice", "credit_note",
                         "proforma", "other"]
            },
            "document_type_detail": {
                "type": "string",
                "description": "Required if document_type is other"
            }
        },
        "required": ["vendor_name", "invoice_number",
                     "date", "total", "document_type"]
    }
}

# Force this specific tool = guarantees schema compliance
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    tools=[extract_tool],
    tool_choice={"type": "tool", "name": "extract_invoice"},
    messages=[{"role": "user", "content": f"Extract: {invoice}"}]
)`
        },
        compare: {
          bad: `# Assuming tool_use catches all errors
data = extract_via_tool_use(invoice)
# "It's from tool_use, so it must be correct!"
save_to_database(data)  # No validation!
# Structure is valid, but vendor_name might be wrong`,
          good: `# Validate SEMANTICS after tool_use
data = extract_via_tool_use(invoice)
errors = []
if not re.match(r"\\d{4}-\\d{2}-\\d{2}", data["date"]):
    errors.append("Invalid date format")
if data["total"] <= 0:
    errors.append("Total must be positive")
if errors:
    retry_with_errors(invoice, errors)`
        },
        examTip: "tool_use guarantees STRUCTURE, not SEMANTICS. The exam will present options claiming tool_use eliminates all errors — that's always wrong. You still need to validate extracted values."
      },
      {
        id: "d4.4",
        title: "Validation-Retry Loops & Multi-Pass Review",
        intro: "Implement validation-retry patterns and multi-pass review strategies for reliable output.",
        concepts: [
          "Validation-retry loops: append specific errors to the prompt and retry for self-correction",
          "detected_pattern fields: track dismissal patterns to identify systematic issues",
          "Multi-pass review: per-file local analysis + cross-file integration pass",
          "Self-review limitations: same session retains reasoning context, reducing effectiveness",
          "Batch processing: synchronous for blocking tasks, batch for latency-tolerant workloads"
        ],
        antiPatterns: [
          "Same-session self-review (the model retains its reasoning context, creating bias)",
          "Generic retry without appending specific error information",
          "Aggregate accuracy metrics masking per-document-type failures"
        ],
        deepDive: [
          "Validation-retry loop: (1) Extract data using tool_use. (2) Validate against business rules. (3) If validation fails, append specific error details and retry. (4) The model corrects based on explicit feedback. (5) Track systematic failures with detected_pattern fields.",
          "Key principle: Specific error feedback, not generic. Wrong: 'There were errors, try again.' Right: 'Line items total ($450) doesn't match subtotal ($500). Tax field contains 10% instead of dollar amount.'",
          "Multi-pass review: Pass 1 (Local) — review each file independently. Pass 2 (Cross-file) — review how files interact.",
          "Same-session self-review limitation: when same session generates and reviews, it retains original reasoning context = blind spot. Fix: use separate sessions.",
          "Batch processing: Blocking PR review → synchronous. Nightly audit → Batch API (50% savings). Real-time feedback → synchronous. Weekly compliance → Batch API."
        ],
        code: {
          title: "validation-retry.py — Specific Error Feedback Loop",
          body: `def extract_with_validation(document, max_retries=3):
    messages = [{"role": "user", "content": f"Extract: {document}"}]

    for attempt in range(max_retries):
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            tools=[extract_tool],
            tool_choice={"type": "tool", "name": "extract_invoice"},
            messages=messages,
        )

        data = parse_tool_response(response)
        errors = validate(data)

        if not errors:
            return data  # Valid — return results

        # CRITICAL: Append SPECIFIC errors for retry
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": f"Validation failed. Fix these errors:\\n"
                + "\\n".join(f"- {e}" for e in errors)
                + "\\nRe-extract with corrections."
        })

    raise ExtractionError(f"Failed after {max_retries} attempts")

def validate(data):
    errors = []
    if data["total"] <= 0:
        errors.append(f"Total must be positive, got {data['total']}")
    if sum(i["total"] for i in data["line_items"]) != data["subtotal"]:
        errors.append("Line items sum doesn't match subtotal")
    return errors`
        },
        examTip: "Three must-know facts: (1) Retry with SPECIFIC error details, not generic messages. (2) Same-session self-review is an anti-pattern. (3) Use Batch API for non-urgent tasks (50% cost savings)."
      }
    ]
  },

  D5: {
    title: "Domain 5 — Context Management & Reliability",
    weight: "~15%",
    summary: "Manage context effectively in production systems. Covers progressive summarization risks, context positioning, escalation patterns, error propagation, context degradation, human review, and information provenance.",
    examTips: [
      "Progressive summarization loses critical details — use 'case facts' blocks instead",
      "Sentiment ≠ complexity for escalation decisions",
      "Always distinguish access failures from genuinely empty results",
      "Track accuracy per document type, not just aggregate"
    ],
    topics: [
      {
        id: "d5.1",
        title: "Context Optimization & Positioning",
        intro: "Optimize context window usage with strategic positioning, trimming, and summarization techniques while avoiding common pitfalls.",
        concepts: [
          "Progressive summarization risks: important details can be lost through repeated summarization",
          "'Lost in the middle' effect: info in the middle of long contexts is less likely to be recalled",
          "'Case facts' blocks: structured reference sections that preserve critical information",
          "Trimming verbose tool outputs: remove noise while retaining essential data",
          "Position-aware ordering: put the most important information at the beginning and end"
        ],
        antiPatterns: [
          "Progressive summarization of critical details without preserving originals",
          "Ignoring the 'lost in the middle' effect in long context windows"
        ],
        deepDive: [
          "Context management is about making the most of the limited context window while preserving critical information.",
          "1. Progressive Summarization Risks — Compresses conversation history but silently destroys critical details. Original: 'Customer John Smith (ACC-12345) called about order #98765. Charged $150.00 instead of promotional $99.99.' After 1st summary: 'Customer called about billing issue.' After 2nd summary: 'Customer has a billing issue.' All specifics lost.",
          "2. The 'Lost in the Middle' Effect — Information in the middle of long contexts is less likely to be recalled. Beginning and end get more attention.",
          "Solution: 'Case Facts' blocks — Instead of summarizing, preserve critical information in an immutable structured block placed at the beginning of context (high-recall position). This block is never summarized or compressed."
        ],
        code: {
          title: "case-facts.md — Immutable Reference Block",
          body: `## CASE FACTS (Do not summarize — reference directly)

| Field          | Value                                    |
|----------------|------------------------------------------|
| Customer       | John Smith                               |
| Account ID     | ACC-12345                                |
| Order          | #98765                                   |
| Expected Price | $99.99 (promotion SUMMER2026)            |
| Charged Price  | $150.00                                  |
| Overcharge     | $50.01                                   |
| Customer Since | 2019 (7-year tenure)                     |
| Priority       | High (long-term customer + overcharge)   |

## RULES
- Always address customer as "Mr. Smith"
- This case qualifies for immediate resolution
- Refund amount ($50.01) is within $500 agent limit`
        },
        compare: {
          bad: `# Progressive summarization loses details
Turn 1: "John Smith (ACC-12345) order #98765..."
Turn 5: [Summary] "Customer billing issue"
Turn 10: [Summary] "Billing issue being handled"
# Lost name, account, order, amounts`,
          good: `# Case facts — always available
## CASE FACTS (immutable)
- Customer: John Smith (ACC-12345)
- Order: #98765
- Issue: Overcharged $50.01 (promo SUMMER2026)
# Block stays intact regardless of length`
        },
        examTip: "If the exam asks how to preserve critical customer details in a long conversation, the answer is ALWAYS 'case facts' blocks, never progressive summarization."
      },
      {
        id: "d5.2",
        title: "Escalation & Error Propagation",
        intro: "Design escalation patterns and error propagation strategies that provide enough context for recovery or human intervention.",
        concepts: [
          "Escalation triggers: customer demands, policy gaps — not just sentiment",
          "Structured error context vs generic errors: always include what was attempted",
          "Access failures vs empty results: distinguish 'could not check' from 'checked, found nothing'",
          "Local recovery before coordinator escalation: try to fix locally first",
          "Partial results + what was attempted: always report progress even on failure"
        ],
        antiPatterns: [
          "Sentiment-based escalation (sentiment does not equal task complexity)",
          "Generic error propagation that loses the original error context",
          "Silently suppressing errors instead of escalating with context"
        ],
        deepDive: [
          "Valid escalation triggers: customer explicitly requests a human, policy gap detected, task exceeds capabilities, business threshold exceeded, repeated failures after recovery attempts.",
          "Invalid escalation triggers (exam anti-patterns): negative sentiment (angry customer with simple address change does NOT need a human — sentiment ≠ task complexity), self-reported confidence (model's confidence is unreliable).",
          "Error propagation in multi-agent systems: when a subagent fails, report structured context to coordinator — what was attempted, what error occurred (category + retryability), whether access failure vs empty result.",
          "Never silently drop subagent failures. If a subagent can't access a database, the coordinator must know the data is missing — not assume the query returned nothing."
        ],
        code: {
          title: "escalation-logic.py — Structured Escalation",
          body: `def should_escalate(context):
    """Determine if we need human intervention."""

    # VALID escalation triggers
    if context.customer_requested_human:
        return True, "Customer explicitly requested human agent"

    if context.policy_gap_detected:
        return True, "No policy covers this situation"

    if context.amount > AGENT_REFUND_LIMIT:
        return True, f"Amount {context.amount} exceeds limit"

    if context.retry_count >= MAX_RETRIES:
        return True, "Exhausted retry attempts"

    # INVALID triggers — DO NOT use these
    # if context.sentiment == "negative":  # WRONG!
    #     return True  # Sentiment != complexity

    # if context.model_confidence < 0.7:  # WRONG!
    #     return True  # Self-reported confidence unreliable

    return False, None`
        },
        examTip: "Sentiment-based and confidence-based escalation are ALWAYS wrong on the exam. Valid triggers are: explicit customer request, policy gaps, capability limits, and business thresholds."
      },
      {
        id: "d5.3",
        title: "Context Degradation & Extended Sessions",
        intro: "Handle context degradation in long-running sessions. Use scratchpad files, /compact, and subagent delegation to maintain quality.",
        concepts: [
          "Context degradation: quality decreases in extended sessions as context fills up",
          "Scratchpad files: external files to persist important state across context resets",
          "/compact: compress conversation history to reclaim context space",
          "Subagent delegation: delegate verbose exploration to keep coordinator context clean",
          "Crash recovery manifests: persistent state files that enable session recovery"
        ],
        antiPatterns: [
          "Running extended sessions without monitoring context degradation",
          "Not using scratchpad files for important intermediate state"
        ],
        deepDive: [
          "Long-running agent sessions suffer from context degradation — quality decreases as the conversation grows.",
          "Symptoms: agent forgets earlier instructions, responses become less focused, tool selection accuracy decreases, agent repeats work.",
          "Mitigation strategies: /compact (compress conversation), scratchpad files (persist critical state externally), subagent delegation (verbose exploration goes to subagents), position-aware ordering (important info at beginning and end).",
          "Stratified metrics — Aggregate accuracy can mask per-category failures. If invoices have 70% accuracy while receipts have 99%, the aggregate might still show 95%. Track per document type.",
          "Information provenance: preserve source and confidence level of all information. Track where each piece of data came from and how reliable the source is."
        ],
        code: {
          title: "context-management.py — Degradation Mitigation",
          body: `# Strategy 1: Scratchpad files for persistent state
agent.run("""
Before starting complex analysis:
1. Create a scratchpad file: progress.md
2. Record key findings as you discover them
3. Update progress.md after each major step
4. If context gets long, use /compact
5. After /compact, re-read progress.md to restore context
""")

# Strategy 2: Subagent delegation for verbose tasks
coordinator = Agent(tools=[Task, read_scratchpad, summarize])
coordinator.run("""
For this codebase analysis:
1. Delegate file-by-file analysis to a subagent
2. Subagent writes findings to scratchpad files
3. Coordinator reads summarized findings
4. Coordinator synthesizes final report
""")

# Strategy 3: Stratified metrics
def track_accuracy(results):
    """Track per-document-type, not just aggregate."""
    by_type = {}
    for r in results:
        doc_type = r["document_type"]
        if doc_type not in by_type:
            by_type[doc_type] = {"correct": 0, "total": 0}
        by_type[doc_type]["total"] += 1
        if r["is_correct"]:
            by_type[doc_type]["correct"] += 1

    for doc_type, stats in by_type.items():
        accuracy = stats["correct"] / stats["total"] * 100
        print(f"{doc_type}: {accuracy:.1f}%")`
        },
        compare: {
          bad: `# Aggregate metrics only (masks failures)
total_correct = 950
total_processed = 1000
accuracy = 95.0%  # "Looks great!"

# But actually:
# Invoices:  70/100  = 70% (FAILING!)
# Receipts:  880/900 = 97.8%
# Aggregate HIDES the invoice problem`,
          good: `# Per-document-type metrics
Invoice accuracy:  70.0%  # ALERT!
Receipt accuracy:  97.8%  # OK
Contract accuracy: 100.0% # OK
# Now we can see and fix the invoice problem`
        },
        examTip: "Aggregate metrics masking per-category failures is a KEY exam concept. The correct answer always tracks accuracy per document type (stratified metrics), not just overall accuracy."
      },
      {
        id: "d5.4",
        title: "Human Review & Information Provenance",
        intro: "Design human-in-the-loop review systems and maintain information provenance through claim-source mappings and temporal data.",
        concepts: [
          "Stratified sampling: review samples across different categories, not just random selection",
          "Field-level confidence: provide confidence indicators for individual data fields",
          "Accuracy by document type: track performance per document category, not just aggregate",
          "Claim-source mappings: link each output claim to its source for traceability",
          "Temporal data: preserve timestamps and version information for currency",
          "Conflict annotation: explicitly mark conflicting sources rather than silently choosing one"
        ],
        antiPatterns: [
          "Aggregate accuracy metrics that mask per-document-type failures",
          "Not maintaining claim-source mappings for traceability",
          "Silently resolving source conflicts instead of annotating them"
        ],
        deepDive: [
          "Information provenance means tracking where each piece of data came from and how reliable the source is.",
          "Why provenance matters: when subagents provide conflicting information, the coordinator needs to know which is more reliable. Audit trails require source tracking. Downstream decisions depend on data quality.",
          "Provenance metadata to track: Source (API, database, document, web), Confidence (verified, extracted, inferred, estimated), Timestamp (when retrieved), Agent (which subagent).",
          "Human-in-the-loop checkpoints: for critical decisions, pause and present the human with — the decision, the supporting data (with provenance), the recommended action, a way to approve/modify/reject. Important for financial decisions, legal/compliance, irreversible actions, ambiguity."
        ],
        code: {
          title: "provenance.py — Information Source Tracking",
          body: `from dataclasses import dataclass
from datetime import datetime
from typing import Literal

@dataclass
class DataWithProvenance:
    value: str | float | dict
    source: str                    # "customer-db", "invoice-pdf"
    confidence: Literal["verified", "extracted", "inferred", "estimated"]
    retrieved_at: datetime
    agent_id: str                  # Which subagent provided this

def resolve_conflict(data_points: list[DataWithProvenance]):
    """When subagents disagree, use provenance to decide."""

    confidence_rank = {
        "verified": 4,   # From authoritative source
        "extracted": 3,  # Parsed from structured document
        "inferred": 2,   # Derived from context
        "estimated": 1,  # Best guess
    }

    # Pick the most reliable source
    best = max(data_points, key=lambda d: confidence_rank[d.confidence])

    # Log the conflict for audit trail
    log_conflict(
        chosen=best,
        alternatives=data_points,
        reason=f"Selected {best.source} (confidence: {best.confidence})"
    )

    return best`
        },
        compare: {
          bad: `# No provenance tracking
revenue = subagent_1.get_revenue()  # From where?
revenue_2 = subagent_2.get_revenue()  # Conflicts!
# Which do we trust? We don't know!
final_revenue = revenue  # Arbitrary`,
          good: `# With provenance tracking
rev_1 = DataWithProvenance(
    value=1_500_000, source="financial-db",
    confidence="verified", agent_id="finance")
rev_2 = DataWithProvenance(
    value=1_480_000, source="quarterly-pdf",
    confidence="extracted", agent_id="doc-agent")
# Trust verified DB over extracted PDF
final = resolve_conflict([rev_1, rev_2])`
        },
        examTip: "When subagents provide conflicting data, the correct answer always involves tracking information provenance (source, confidence, timestamp) and using it to resolve conflicts. Arbitrary selection without provenance is always wrong."
      }
    ]
  }
};
