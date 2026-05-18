/*
 * Practice question bank — all 5 domains, ~100 questions.
 * Each question: { id, domain, topic, q, options[], answer (index), explain }.
 * "answer" is 0-indexed into "options".
 */
window.QUESTIONS = [

  /* =====================  DOMAIN 1  ===================== */

  { id:"q1.1.1", domain:"D1", topic:"d1.1",
    q:"In an agentic loop, which signal RELIABLY indicates that Claude wants to continue using a tool?",
    options:[
      "The assistant's text content contains 'continuing...'",
      "stop_reason equals 'tool_use'",
      "The response includes a 'pause_turn' field",
      "An iteration counter is below the configured cap"
    ],
    answer:1,
    explain:"stop_reason is the structured, deterministic field that signals whether to keep looping. 'tool_use' means continue; 'end_turn' means exit. Parsing text or counting iterations are anti-patterns." },

  { id:"q1.1.2", domain:"D1", topic:"d1.1",
    q:"After Claude calls a tool, what should you do before sending the next request?",
    options:[
      "Reset the conversation to save tokens",
      "Append the tool result to the conversation as a user message containing tool_result",
      "Strip the prior assistant content to reduce context",
      "Switch to a smaller model for cost savings"
    ],
    answer:1,
    explain:"You append both the assistant's tool_use block AND a user message with the corresponding tool_result. The loop continues with the updated conversation history." },

  { id:"q1.1.3", domain:"D1", topic:"d1.1",
    q:"Which of these is the PRIMARY anti-pattern for loop termination?",
    options:[
      "Stopping when stop_reason == 'end_turn'",
      "Parsing the assistant's natural language for words like 'done' or 'complete'",
      "Executing tool calls in parallel",
      "Sending the full conversation back each iteration"
    ],
    answer:1,
    explain:"Parsing natural language is unreliable — wording varies. Always rely on stop_reason." },

  { id:"q1.1.4", domain:"D1", topic:"d1.1",
    q:"Which is the WORST approach to ending an agentic loop in production?",
    options:[
      "Setting an arbitrary max iteration count as the primary stop signal",
      "Checking stop_reason on every response",
      "Letting the model decide when work is complete via end_turn",
      "Logging stop_reason for observability"
    ],
    answer:0,
    explain:"Arbitrary iteration caps cut work off mid-task or allow pointless looping. Caps can exist as a safety net, but stop_reason must be the primary mechanism." },

  { id:"q1.2.1", domain:"D1", topic:"d1.2",
    q:"What architecture is recommended for multi-agent systems on Claude?",
    options:[
      "Flat mesh where all agents share state",
      "Hub-and-spoke with a coordinator delegating to specialized subagents",
      "Peer-to-peer with no coordinator",
      "Single monolithic agent with all tools"
    ],
    answer:1,
    explain:"Hub-and-spoke gives context isolation, focused tool access, parallel execution, and clean synthesis." },

  { id:"q1.2.2", domain:"D1", topic:"d1.2",
    q:"When delegating to a subagent, what context should the coordinator pass?",
    options:[
      "The entire coordinator conversation history",
      "Only the context specific to the subagent's task",
      "No context — let the subagent rediscover everything",
      "Compressed summary of the full history"
    ],
    answer:1,
    explain:"Passing only relevant context preserves token budget and avoids confusing the subagent with irrelevant noise." },

  { id:"q1.2.3", domain:"D1", topic:"d1.2",
    q:"Which tool must be in the coordinator's allowedTools for it to spawn subagents?",
    options:["Bash","Read","Task","Glob"],
    answer:2,
    explain:"The Task tool spawns subagents. Multiple Task calls in a single response execute in parallel." },

  { id:"q1.2.4", domain:"D1", topic:"d1.2",
    q:"What is the purpose of fork_session?",
    options:[
      "To create a branched session for exploration without polluting the main context",
      "To duplicate the entire production environment",
      "To force-restart the agent with a clean slate",
      "To convert a session to a batch job"
    ],
    answer:0,
    explain:"fork_session creates a branched context for parallel exploration; changes in the fork do not affect the main session." },

  { id:"q1.3.1", domain:"D1", topic:"d1.3",
    q:"You need to GUARANTEE that an agent never processes refunds over $500. What's the correct approach?",
    options:[
      "Add 'NEVER refund above $500' to the system prompt in capital letters",
      "Use a PostToolUse hook that blocks the refund tool when amount > 500",
      "Train the model with examples of correct behavior",
      "Add multiple reminders throughout the prompt"
    ],
    answer:1,
    explain:"Prompts are probabilistic. Hooks run as code — 100% deterministic. Use hooks for critical business rules." },

  { id:"q1.3.2", domain:"D1", topic:"d1.3",
    q:"Which is a VALID escalation trigger to a human agent?",
    options:[
      "Customer expresses frustration (negative sentiment)",
      "Model self-reports confidence below 0.7",
      "Refund amount exceeds the agent's $500 business threshold",
      "Customer takes longer than expected to reply"
    ],
    answer:2,
    explain:"Valid triggers are objective: explicit customer request, policy gap, capability limit, or business threshold. Sentiment ≠ complexity; self-reported confidence is unreliable." },

  { id:"q1.3.3", domain:"D1", topic:"d1.3",
    q:"PreToolUse hooks are best used for…",
    options:[
      "Modifying output after a tool returns",
      "Blocking or validating tool calls BEFORE they execute",
      "Streaming partial results to users",
      "Compressing context after each turn"
    ],
    answer:1,
    explain:"PreToolUse hooks intercept before execution — they can block calls, modify params, or add validation. PostToolUse runs after." },

  { id:"q1.3.4", domain:"D1", topic:"d1.3",
    q:"Which is an INVALID escalation trigger?",
    options:[
      "Customer explicitly asks for a human agent",
      "Negative sentiment detected in customer message",
      "No policy covers the customer's situation",
      "Request exceeds the agent's defined business threshold"
    ],
    answer:1,
    explain:"Sentiment does not equal task complexity. An angry customer with a simple address change does NOT need a human." },

  { id:"q1.4.1", domain:"D1", topic:"d1.4",
    q:"What does the --resume flag do?",
    options:[
      "Starts a new session with no history",
      "Continues a previous session with preserved context",
      "Forks the current session for exploration",
      "Compresses the session history"
    ],
    answer:1,
    explain:"--resume reloads a previous session with its full context intact." },

  { id:"q1.4.2", domain:"D1", topic:"d1.4",
    q:"Choose the BEST decomposition strategy for a codebase audit where issues are unpredictable.",
    options:[
      "Static prompt chaining with predefined steps",
      "Dynamic adaptive decomposition where the agent chooses next steps based on findings",
      "Single mega-prompt with all instructions",
      "Manual step-by-step user prompts"
    ],
    answer:1,
    explain:"Unpredictable / branching work needs dynamic adaptive decomposition. Static chains can't handle conditional outcomes." },

  { id:"q1.4.3", domain:"D1", topic:"d1.4",
    q:"What is the main risk of long-running sessions?",
    options:[
      "Higher network costs",
      "Stale context — early data may become outdated",
      "Token limit on the model",
      "Increased latency for the first request"
    ],
    answer:1,
    explain:"Data fetched early can go stale. Mitigations: periodic refetch, scratchpad files, /compact." },


  /* =====================  DOMAIN 2  ===================== */

  { id:"q2.1.1", domain:"D2", topic:"d2.1",
    q:"What makes a tool description 'good' for Claude to use correctly?",
    options:[
      "It is one short sentence to save tokens",
      "It specifies input format, edge cases, examples, and when NOT to use the tool",
      "It contains marketing-style wording for clarity",
      "It is identical to the function name"
    ],
    answer:1,
    explain:"Tool descriptions are documentation for the model. The more specific (formats, edge cases, examples), the better." },

  { id:"q2.1.2", domain:"D2", topic:"d2.1",
    q:"Which is the WEAKEST tool description?",
    options:[
      "Search for a customer by email (must contain @), phone (E.164), or account ID (ACC-...)",
      "Searches for stuff",
      "Lookup customer; returns profile or empty array if not found",
      "Retrieve customer; pass one of email|phone|account_id"
    ],
    answer:1,
    explain:"'Searches for stuff' is vague — Claude has to guess scope, inputs, and outputs." },

  { id:"q2.2.1", domain:"D2", topic:"d2.2",
    q:"Your tool's database call times out. What should you return?",
    options:[
      "An empty list with no error indication",
      "A structured error: {isError: true, errorCategory:'timeout', isRetryable:true, context:{...}}",
      "Throw an uncaught exception",
      "A friendly text message saying 'oops, try again'"
    ],
    answer:1,
    explain:"Distinguish access failure (search couldn't run) from empty result (search ran, found nothing). Use structured fields." },

  { id:"q2.2.2", domain:"D2", topic:"d2.2",
    q:"Which fields belong on a well-designed error response?",
    options:[
      "errorCode only",
      "Just a message string",
      "isError, errorCategory, isRetryable, and context (what was attempted)",
      "stackTrace and timing"
    ],
    answer:2,
    explain:"These four fields let the agent decide whether to retry, alternate, or escalate." },

  { id:"q2.2.3", domain:"D2", topic:"d2.2",
    q:"What's the catastrophic risk of returning [] when a database is down?",
    options:[
      "Higher costs",
      "The agent thinks 'no customers found' when reality is 'we couldn't check' — silent, catastrophic mistake",
      "Schema validation failure",
      "Slower response times"
    ],
    answer:1,
    explain:"Empty result silently masks an access failure. The agent makes the wrong downstream decision with no signal that data is missing." },

  { id:"q2.3.1", domain:"D2", topic:"d2.3",
    q:"Research shows the OPTIMAL number of tools per agent is approximately…",
    options:["1-2","4-5","10-12","18+"],
    answer:1,
    explain:"~4-5 tools per agent maximizes selection accuracy. Above that, similar tools create ambiguity and accuracy degrades." },

  { id:"q2.3.2", domain:"D2", topic:"d2.3",
    q:"An agent has 18 tools and selects the wrong one. What's the BEST fix?",
    options:[
      "Make descriptions longer",
      "Switch to a larger model",
      "Distribute tools across 3-4 specialized subagents with 4-5 tools each",
      "Allow tool_choice='any' to force a selection"
    ],
    answer:2,
    explain:"Reduce tool count per agent by distributing across specialized subagents. This is the classic hub-and-spoke remedy." },

  { id:"q2.3.3", domain:"D2", topic:"d2.3",
    q:"You want to force Claude to use a specific extraction tool. What tool_choice value?",
    options:[
      "'auto'",
      "'any'",
      "{type:'tool', name:'extract_invoice'}",
      "Omit tool_choice"
    ],
    answer:2,
    explain:"Forcing a specific tool by name guarantees invocation and schema compliance for extraction." },

  { id:"q2.4.1", domain:"D2", topic:"d2.4",
    q:"Where should team-shared MCP server configuration live?",
    options:[
      "~/.claude.json (user-level)",
      ".mcp.json (project-level, version-controlled)",
      "Hardcoded inside the agent script",
      "/etc/claude/system.json"
    ],
    answer:1,
    explain:".mcp.json is the project-level file checked into git so the whole team uses the same config." },

  { id:"q2.4.2", domain:"D2", topic:"d2.4",
    q:"How should API keys be stored in .mcp.json?",
    options:[
      "Hardcoded as plain strings",
      "Encrypted with a shared passphrase committed to git",
      "Reference environment variables: \"JIRA_TOKEN\": \"${JIRA_TOKEN}\"",
      "Stored in the README"
    ],
    answer:2,
    explain:"Use ${ENV_VAR} expansion. Hardcoded secrets get leaked through git." },

  { id:"q2.4.3", domain:"D2", topic:"d2.4",
    q:"What does an MCP server provide?",
    options:[
      "Hardware acceleration only",
      "Custom tools, resources, and prompt templates that extend Claude's capabilities",
      "Replacement for the Claude API",
      "Built-in retry logic for the SDK"
    ],
    answer:1,
    explain:"MCP servers expose tools (callable functions), resources (static data), and prompt templates." },

  { id:"q2.5.1", domain:"D2", topic:"d2.5",
    q:"You need to read a configuration file. Which built-in tool is correct?",
    options:["Bash('cat config.json')","Read('config.json')","Grep('config.json')","Glob('config.json')"],
    answer:1,
    explain:"Read is purpose-built for reading file contents. Never use Bash when a dedicated tool exists." },

  { id:"q2.5.2", domain:"D2", topic:"d2.5",
    q:"You need to change line 42 of an existing file. Which is correct?",
    options:[
      "Write the entire file again with the change",
      "Bash with sed",
      "Edit with old_string/new_string for the targeted change",
      "Glob for the file and then Bash"
    ],
    answer:2,
    explain:"Edit modifies existing files surgically. Write replaces the entire file and would lose unrelated content." },

  { id:"q2.5.3", domain:"D2", topic:"d2.5",
    q:"Grep vs Glob — what's the distinction?",
    options:[
      "Grep is faster; Glob is older",
      "Grep searches inside files for content; Glob matches file PATHS by pattern",
      "Grep is for binary files; Glob for text",
      "They are identical"
    ],
    answer:1,
    explain:"Grep = content search. Glob = path/name pattern matching. Different jobs." },

  { id:"q2.5.4", domain:"D2", topic:"d2.5",
    q:"You need to run the test suite. Which tool is correct?",
    options:["Read('npm test')","Edit('npm test')","Bash('npm test')","Grep('npm test')"],
    answer:2,
    explain:"Running shell commands is Bash's job. There is no purpose-built tool for executing arbitrary commands." },


  /* =====================  DOMAIN 3  ===================== */

  { id:"q3.1.1", domain:"D3", topic:"d3.1",
    q:"Where do team-shared coding standards belong?",
    options:[
      "~/.claude/CLAUDE.md (user-level)",
      ".claude/CLAUDE.md (project-level, version controlled)",
      "Inline as code comments",
      "A wiki page"
    ],
    answer:1,
    explain:"Project-level CLAUDE.md is checked into git and applies to the whole team." },

  { id:"q3.1.2", domain:"D3", topic:"d3.1",
    q:"Where do PERSONAL preferences (e.g., vim keybindings) belong?",
    options:[
      ".claude/CLAUDE.md (project-level)",
      "~/.claude/CLAUDE.md (user-level)",
      "src/CLAUDE.md (directory-level)",
      "An imported rules file"
    ],
    answer:1,
    explain:"Personal prefs live in user-level config. Putting them in project config imposes them on the team." },

  { id:"q3.1.3", domain:"D3", topic:"d3.1",
    q:"What is the precedence when configurations conflict?",
    options:[
      "User > Project > Directory",
      "Directory > Project > User (more specific overrides less specific)",
      "Whichever loaded last",
      "Random"
    ],
    answer:1,
    explain:"More specific configs override more general ones. Directory > Project > User." },

  { id:"q3.1.4", domain:"D3", topic:"d3.1",
    q:"You want to split a giant CLAUDE.md into topic files. What's the right approach?",
    options:[
      "Put everything in /etc/claude/",
      "Use @import to include rule files from .claude/rules/",
      "Concatenate them all into one bigger file",
      "Use environment variables"
    ],
    answer:1,
    explain:"Modular configuration uses @import + .claude/rules/ for topic-specific files." },

  { id:"q3.2.1", domain:"D3", topic:"d3.2",
    q:"When should you use a Skill instead of a Command?",
    options:[
      "Always — skills replace commands",
      "When the task is complex and needs context isolation or restricted tool access",
      "Only for personal use",
      "Never — commands are always preferred"
    ],
    answer:1,
    explain:"Skills support context: fork and allowed-tools. They're for complex tasks needing isolation." },

  { id:"q3.2.2", domain:"D3", topic:"d3.2",
    q:"What does 'context: fork' in SKILL.md frontmatter do?",
    options:[
      "Loads the skill from a different branch",
      "Runs the skill in an isolated context, separate from the main session",
      "Forks the underlying git repo",
      "Doubles the token budget"
    ],
    answer:1,
    explain:"A forked context keeps the skill's exploration noise out of the main session." },

  { id:"q3.2.3", domain:"D3", topic:"d3.2",
    q:"Why specify 'allowed-tools' in a skill?",
    options:[
      "It improves runtime performance significantly",
      "It restricts the skill to only the tools it needs, preventing accidental side effects",
      "It's required for syntax validation",
      "It enables MCP servers"
    ],
    answer:1,
    explain:"Restricting tools narrows blast radius and improves selection quality within the skill." },

  { id:"q3.3.1", domain:"D3", topic:"d3.3",
    q:"When is plan mode the BEST choice?",
    options:[
      "Fixing a typo",
      "Multi-file architectural changes where mistakes are expensive",
      "Renaming one variable",
      "Adding a single log statement"
    ],
    answer:1,
    explain:"Plan mode shines for complex, expensive-to-undo, multi-file work. Simple tasks don't need it." },

  { id:"q3.3.2", domain:"D3", topic:"d3.3",
    q:"What's the preferred iterative refinement pattern?",
    options:[
      "Tell Claude to 'make it better' repeatedly",
      "TDD iteration: write test, implement, run tests, refine while keeping green",
      "Generate 5 versions and average them",
      "Switch models randomly each turn"
    ],
    answer:1,
    explain:"TDD iteration gives Claude a concrete, verifiable goal each step. Far better than vague 'improve'." },

  { id:"q3.3.3", domain:"D3", topic:"d3.3",
    q:"When is plan mode WASTEFUL?",
    options:[
      "Multi-file refactors",
      "Designing a new auth system",
      "Trivial single-line fixes with obvious approach",
      "Renaming an exported public API"
    ],
    answer:2,
    explain:"For obvious simple tasks, direct execution is better. Plan mode adds overhead with no benefit." },

  { id:"q3.4.1", domain:"D3", topic:"d3.4",
    q:"To run Claude Code non-interactively in CI/CD, which flag is required?",
    options:["-i","-p","-x","--ci"],
    answer:1,
    explain:"-p enables non-interactive mode for pipelines." },

  { id:"q3.4.2", domain:"D3", topic:"d3.4",
    q:"How do you get structured output suitable for automated parsing in CI?",
    options:[
      "Ask the model 'please output JSON'",
      "Use --output-format json (optionally with --json-schema)",
      "Wrap responses with markdown fences",
      "Run with --verbose"
    ],
    answer:1,
    explain:"--output-format json (and --json-schema) make automation reliable. Asking nicely is unreliable." },

  { id:"q3.4.3", domain:"D3", topic:"d3.4",
    q:"You have a nightly code audit job that's non-urgent. Which API saves you 50%?",
    options:[
      "Synchronous Messages API",
      "Message Batches API",
      "Streaming API",
      "Edge API"
    ],
    answer:1,
    explain:"Message Batches API offers 50% cost savings with a 24-hour processing window — ideal for non-urgent workloads." },

  { id:"q3.4.4", domain:"D3", topic:"d3.4",
    q:"Why is same-session self-review an anti-pattern?",
    options:[
      "It uses more tokens",
      "The reviewer retains the generator's reasoning context, creating confirmation bias",
      "It's slower",
      "It violates licensing"
    ],
    answer:1,
    explain:"Use SEPARATE sessions for generation and review. A fresh session has no preconceptions." },

  { id:"q3.4.5", domain:"D3", topic:"d3.4",
    q:"You need to enforce that CI output matches a specific JSON shape. Which flag?",
    options:["--strict","--json-schema","--validate","--enforce"],
    answer:1,
    explain:"--json-schema enforces a specific output shape, making automation deterministic." },


  /* =====================  DOMAIN 4  ===================== */

  { id:"q4.1.1", domain:"D4", topic:"d4.1",
    q:"Why are vague prompts like 'flag long functions' a production risk?",
    options:[
      "They consume too few tokens",
      "They produce inconsistent results and over-flag, creating false positives that erode developer trust (alert fatigue)",
      "They can crash the API",
      "They are deprecated by the model"
    ],
    answer:1,
    explain:"Alert fatigue: too many false positives → devs ignore ALL flags, including real ones." },

  { id:"q4.1.2", domain:"D4", topic:"d4.1",
    q:"Rewrite 'flag long functions' the RIGHT way.",
    options:[
      "Flag functions you don't like",
      "Flag functions exceeding 50 lines of code",
      "Flag all functions",
      "Be thorough about functions"
    ],
    answer:1,
    explain:"Explicit, measurable criteria (50 lines) produce consistent, auditable results." },

  { id:"q4.2.1", domain:"D4", topic:"d4.2",
    q:"How many few-shot examples is optimal for an ambiguous classification task?",
    options:["1","2-4","8-10","more is always better"],
    answer:1,
    explain:"2-4 establish the pattern. >6 bloats without proportional benefit." },

  { id:"q4.2.2", domain:"D4", topic:"d4.2",
    q:"Which guideline is correct for few-shot examples?",
    options:[
      "Each example should use a different output structure to demonstrate flexibility",
      "All examples should share the same output structure, including at least one edge case",
      "Avoid edge cases — they confuse the model",
      "Examples are always unnecessary"
    ],
    answer:1,
    explain:"Format consistency + edge case coverage (e.g., sarcasm, mixed sentiment) is the gold standard." },

  { id:"q4.2.3", domain:"D4", topic:"d4.2",
    q:"When is few-shot UNNECESSARY?",
    options:[
      "Ambiguous sentiment with sarcasm",
      "Custom domain-specific output formats",
      "Simple, well-defined tasks with objective criteria (e.g., 'extract email address')",
      "Mixed-language classification"
    ],
    answer:2,
    explain:"For unambiguous tasks, examples just bloat the prompt." },

  { id:"q4.3.1", domain:"D4", topic:"d4.3",
    q:"Which is GUARANTEED by tool_use with a JSON schema?",
    options:[
      "Both structural AND semantic correctness",
      "Only structural correctness (the JSON matches the schema)",
      "Only semantic correctness (the values are right)",
      "Neither — tool_use is best-effort"
    ],
    answer:1,
    explain:"tool_use guarantees STRUCTURE, not SEMANTICS. The vendor_name field will be a string, but it might be the WRONG string." },

  { id:"q4.3.2", domain:"D4", topic:"d4.3",
    q:"Best practice for an enum that may receive unexpected values?",
    options:[
      "Strict enum with no fallback",
      "Include an 'other' value plus a detail field describing the actual category",
      "Use a free-text field",
      "Block extraction if enum doesn't match"
    ],
    answer:1,
    explain:"'other' + detail prevents misclassification while preserving structure." },

  { id:"q4.3.3", domain:"D4", topic:"d4.3",
    q:"To force a SPECIFIC tool invocation for extraction reliability, set tool_choice to…",
    options:["'auto'","'any'","{type:'tool',name:'extract_invoice'}","'forced'"],
    answer:2,
    explain:"Forcing a specific named tool guarantees that schema is used." },

  { id:"q4.4.1", domain:"D4", topic:"d4.4",
    q:"After extraction fails validation, what should you append to retry?",
    options:[
      "'There were errors, please try again'",
      "The specific errors: which fields are wrong and what's expected vs actual",
      "Nothing — just retry",
      "The full schema"
    ],
    answer:1,
    explain:"Specific feedback gives the model a clear correction target. Generic retries are anti-patterns." },

  { id:"q4.4.2", domain:"D4", topic:"d4.4",
    q:"Same-session self-review weakens code review because…",
    options:[
      "It is slower",
      "The reviewer retains the generator's reasoning context, creating confirmation bias",
      "It violates SSO policy",
      "Reviewers don't have tools"
    ],
    answer:1,
    explain:"Run review in a FRESH, separate session so the reviewer has no inherited assumptions." },

  { id:"q4.4.3", domain:"D4", topic:"d4.4",
    q:"You're running a non-blocking nightly code audit at scale. Which is BEST?",
    options:[
      "Synchronous Messages API for fastest response",
      "Streaming API",
      "Message Batches API (50% cheaper, 24-hour window)",
      "Local rule-based linter only"
    ],
    answer:2,
    explain:"Non-urgent, latency-tolerant workloads should use Batch API for cost efficiency." },

  { id:"q4.4.4", domain:"D4", topic:"d4.4",
    q:"Multi-pass code review typically uses…",
    options:[
      "One huge prompt covering everything",
      "Pass 1: per-file local analysis. Pass 2: cross-file integration analysis",
      "Recursive self-review until satisfied",
      "Only manual review"
    ],
    answer:1,
    explain:"Per-file then cross-file separation catches both local issues (style, error handling) and integration issues (broken imports, interface mismatches)." },


  /* =====================  DOMAIN 5  ===================== */

  { id:"q5.1.1", domain:"D5", topic:"d5.1",
    q:"What's the risk of progressive summarization?",
    options:[
      "It uses more tokens",
      "Critical details (names, IDs, amounts) get lost across rounds",
      "It freezes the conversation",
      "It triggers rate limits"
    ],
    answer:1,
    explain:"Each summary round drops specifics. After several rounds, you're left with vague generalities and no original data." },

  { id:"q5.1.2", domain:"D5", topic:"d5.1",
    q:"How do you preserve critical customer details in a long conversation?",
    options:[
      "Summarize aggressively",
      "Use immutable 'case facts' blocks at the start of context",
      "Trust the model to remember everything",
      "Use a tiny model to save space"
    ],
    answer:1,
    explain:"'Case facts' blocks are never summarized and live in the high-recall start of context." },

  { id:"q5.1.3", domain:"D5", topic:"d5.1",
    q:"The 'lost in the middle' effect means…",
    options:[
      "Mid-document fonts get smaller",
      "Information in the middle of long contexts is less likely to be recalled by the model",
      "Tool calls degrade in mid-session",
      "Stop_reason becomes unreliable"
    ],
    answer:1,
    explain:"Position matters: beginning and end of context get more attention than the middle." },

  { id:"q5.2.1", domain:"D5", topic:"d5.2",
    q:"Which is a VALID escalation trigger?",
    options:[
      "Customer used profanity",
      "Customer message has 'urgent' sentiment",
      "Customer's situation falls into a policy gap",
      "The agent's model confidence dropped"
    ],
    answer:2,
    explain:"Policy gap is objective. Sentiment and self-reported confidence are anti-patterns." },

  { id:"q5.2.2", domain:"D5", topic:"d5.2",
    q:"A subagent's database call fails. What should the coordinator receive?",
    options:[
      "An empty result silently",
      "A structured error with what was attempted, error category, retryability, and suggestion",
      "Nothing — the coordinator should re-query",
      "A truncated stack trace"
    ],
    answer:1,
    explain:"Propagate structured errors. The coordinator must know the failure happened, not assume empty=found nothing." },

  { id:"q5.2.3", domain:"D5", topic:"d5.2",
    q:"A subagent gets a timeout on a customer DB lookup. Which is correct?",
    options:[
      "Return {customers: []} so the coordinator moves on",
      "Return {isError:true, errorCategory:'timeout', isRetryable:true, context:{attempted, suggestion}}",
      "Crash the coordinator",
      "Wait silently and retry forever"
    ],
    answer:1,
    explain:"Always distinguish access failure from empty result with a structured payload." },

  { id:"q5.3.1", domain:"D5", topic:"d5.3",
    q:"Which strategy mitigates context degradation in long sessions?",
    options:[
      "Just keep going",
      "Scratchpad files + /compact + subagent delegation for verbose work",
      "Switch to a smaller model halfway through",
      "Lower max_tokens for output"
    ],
    answer:1,
    explain:"All three — scratchpad files persist state, /compact reclaims space, subagents isolate verbose exploration." },

  { id:"q5.3.2", domain:"D5", topic:"d5.3",
    q:"You report 95% overall accuracy. What's the hidden risk?",
    options:[
      "Numbers are too round",
      "Aggregate metrics can mask per-document-type failures (e.g., invoices at 70%, receipts at 99%)",
      "Models can't track aggregates",
      "Test set is too large"
    ],
    answer:1,
    explain:"Stratify by document type. Aggregate accuracy is dangerous in production — it hides failing categories." },

  { id:"q5.3.3", domain:"D5", topic:"d5.3",
    q:"What's the role of scratchpad files in long sessions?",
    options:[
      "They store credentials",
      "They persist important state across context compressions or session boundaries",
      "They replace MCP",
      "They speed up tool calls"
    ],
    answer:1,
    explain:"Scratchpads survive context resets — write key findings, re-read after /compact." },

  { id:"q5.4.1", domain:"D5", topic:"d5.4",
    q:"When two subagents return different revenue figures, how should the coordinator resolve them?",
    options:[
      "Pick the larger value",
      "Average them",
      "Use information provenance: prefer higher-confidence source (verified DB over extracted PDF)",
      "Discard both"
    ],
    answer:2,
    explain:"Provenance — source, confidence, timestamp, agent — drives principled conflict resolution and audit trails." },

  { id:"q5.4.2", domain:"D5", topic:"d5.4",
    q:"Which provenance field is MOST important to track?",
    options:[
      "Font color",
      "source, confidence, timestamp, agent_id",
      "User-agent string",
      "Request latency"
    ],
    answer:1,
    explain:"These four enable trusted multi-agent synthesis." },

  { id:"q5.4.3", domain:"D5", topic:"d5.4",
    q:"A confidence ranking like {verified:4, extracted:3, inferred:2, estimated:1} is used to…",
    options:[
      "Rank model output sentiment",
      "Resolve conflicts between data points by preferring more reliable sources",
      "Pick the cheaper API",
      "Decide between Opus and Sonnet"
    ],
    answer:1,
    explain:"Confidence ranking quantifies provenance reliability for principled conflict resolution." },


  /* ===================== Mixed / Scenario style ===================== */

  { id:"qS1.1", domain:"D1", topic:"d1.3",
    q:"You're building a support agent. Marketing wants 'never refund more than $500'. Pick the strongest enforcement.",
    options:[
      "Bold capital letters in the prompt",
      "Add a reminder before every tool call",
      "PostToolUse hook that blocks process_refund when amount > 500 and triggers escalation",
      "Fine-tune the model"
    ],
    answer:2,
    explain:"Programmatic hooks are deterministic. Prompts are not." },

  { id:"qS1.2", domain:"D5", topic:"d5.1",
    q:"A customer support agent loses 'John Smith, ACC-12345, order #98765, overcharge $50.01' after 10 turns. What went wrong?",
    options:[
      "Token limit",
      "Progressive summarization stripped the specifics; should have used a case facts block",
      "Model upgrade",
      "Tool failure"
    ],
    answer:1,
    explain:"Case facts blocks are immutable and high-recall positioned. Don't summarize critical fields." },

  { id:"qS3.1", domain:"D3", topic:"d3.4",
    q:"You run claude in CI and need a JSON object with 'issues' array. Which combination?",
    options:[
      "Interactive mode + parse markdown",
      "claude -p --output-format json --json-schema '{...}'",
      "claude --resume",
      "claude --stream"
    ],
    answer:1,
    explain:"-p is non-interactive; --output-format json + --json-schema make the output machine-readable and validated." },

  { id:"qS3.2", domain:"D3", topic:"d3.4",
    q:"You want Claude to review code IT JUST WROTE. Best approach?",
    options:[
      "Same session, ask for self-review",
      "Same session with --resume",
      "New SEPARATE session reviewing the diff (no inherited reasoning)",
      "Skip review"
    ],
    answer:2,
    explain:"Separate session = no confirmation bias from generation reasoning." },

  { id:"qS2.1", domain:"D2", topic:"d2.3",
    q:"A 'do-everything' support agent has 18 tools and selects poorly. Best fix?",
    options:[
      "Train a custom model",
      "Lengthen all tool descriptions to 500 tokens each",
      "Split into coordinator + customer_agent + order_agent + comms_agent, each with 4-5 tools",
      "Set tool_choice='any'"
    ],
    answer:2,
    explain:"Hub-and-spoke with 4-5 tools per specialized subagent. The exam favors this answer." },

  { id:"qS4.1", domain:"D4", topic:"d4.3",
    q:"Your invoice extractor returned schema-valid JSON, but the total is negative. What's the lesson?",
    options:[
      "tool_use is broken",
      "tool_use guarantees structure, not semantics — add validation-retry with specific errors",
      "Switch to plain prompting",
      "Use Bash to validate"
    ],
    answer:1,
    explain:"You need a validation-retry loop where errors are appended to the prompt for self-correction." },

  { id:"qS4.2", domain:"D4", topic:"d4.4",
    q:"Your validator says 'Line items sum ($450) doesn't match subtotal ($500)'. What goes back to Claude for retry?",
    options:[
      "'Try again'",
      "Generic: 'there are errors'",
      "Exact validation messages with field, expected, actual — appended to the messages list",
      "Nothing"
    ],
    answer:2,
    explain:"Specific error feedback is the only way for the model to converge on a correct answer." },

  { id:"qS5.1", domain:"D5", topic:"d5.3",
    q:"You ship 95% overall accuracy. PMs are happy. Engineering finds invoices fail constantly. What do you instrument?",
    options:[
      "Daily aggregate dashboards",
      "Stratified metrics — accuracy by document type — to surface category failures",
      "Add more retries",
      "Switch models"
    ],
    answer:1,
    explain:"Stratified, per-category metrics expose what aggregate accuracy hides." },

  { id:"qS5.2", domain:"D5", topic:"d5.4",
    q:"Two subagents return different revenue figures. Coordinator should…",
    options:[
      "Average the two",
      "Pick the first one received",
      "Compare provenance (verified DB > extracted PDF), choose higher-confidence source, log the conflict",
      "Re-run both"
    ],
    answer:2,
    explain:"Provenance-driven resolution is the standard pattern for multi-agent conflicts." },

  { id:"qMix1", domain:"D1", topic:"d1.2",
    q:"Why is sharing the coordinator's FULL conversation history with a subagent an anti-pattern?",
    options:[
      "It is forbidden by the SDK",
      "It pollutes the subagent's context with irrelevant noise and wastes tokens",
      "It bypasses authentication",
      "Subagents can't read tool_use blocks"
    ],
    answer:1,
    explain:"Pass only relevant context. Full history = wasted tokens + confused subagent." },

  { id:"qMix2", domain:"D2", topic:"d2.2",
    q:"Your tool reports 'Operation failed.' nothing else. What is wrong with this response?",
    options:[
      "Too long",
      "It's missing structured fields (isError, errorCategory, isRetryable, context) the agent needs to recover",
      "It exposes internal state",
      "It uses too few tokens"
    ],
    answer:1,
    explain:"Generic error messages give the agent no signal for recovery. Always return structured errors." },

  { id:"qMix3", domain:"D3", topic:"d3.1",
    q:"A team-wide rule: 'API endpoints must validate auth tokens'. Best placement?",
    options:[
      "~/.claude/CLAUDE.md",
      "src/api/CLAUDE.md (directory-scoped)",
      "README.md",
      "Slack channel pinned message"
    ],
    answer:1,
    explain:"Directory-level CLAUDE.md scopes the rule to the API codebase where it applies." },

  { id:"qMix4", domain:"D4", topic:"d4.1",
    q:"Which is the WORST prompt for production code review?",
    options:[
      "Flag functions exceeding 50 lines",
      "Be thorough and find anything suspicious",
      "Identify async ops without try/catch",
      "Flag SQL constructed via string concatenation"
    ],
    answer:1,
    explain:"'Be thorough' / 'find anything suspicious' is the textbook vague-prompt trap that produces alert fatigue." },

  { id:"qMix5", domain:"D5", topic:"d5.2",
    q:"You're designing escalation triggers. Which one would you REMOVE?",
    options:[
      "Customer explicitly demands a human",
      "Refund amount exceeds $500",
      "Customer message has negative sentiment score",
      "No policy covers the request"
    ],
    answer:2,
    explain:"Sentiment-based escalation is invalid. Sentiment ≠ task complexity." },

  { id:"qMix6", domain:"D1", topic:"d1.4",
    q:"You want to explore an alternative API design without disturbing the main session. What's the right operation?",
    options:[
      "--resume the original session and pivot",
      "claude fork_session --reason 'Exploring alternative API'",
      "Delete the session and start fresh",
      "Use --output-format json"
    ],
    answer:1,
    explain:"fork_session creates a branch; changes don't affect the main session." },

  { id:"qMix7", domain:"D2", topic:"d2.1",
    q:"Which is the STRONGEST tool description?",
    options:[
      "Lookup a thing.",
      "Search customers — pass query.",
      "Search for a customer by email (must contain @), phone (E.164 like +15551234567), or account_id (starts with ACC-). Returns customer object or empty array. Empty result is NOT an error.",
      "Tool for lookups."
    ],
    answer:2,
    explain:"Specifies input formats, examples, return shape, AND edge cases (empty != error)." },

  { id:"qMix8", domain:"D3", topic:"d3.2",
    q:"A skill needs Read, Edit, and Grep ONLY. Frontmatter?",
    options:[
      "Omit allowed-tools to grant all tools",
      "allowed-tools: [Read, Edit, Grep]",
      "tools: '*'",
      "permit: all"
    ],
    answer:1,
    explain:"Restrict allowed-tools to the minimum set the skill requires." },

  { id:"qMix9", domain:"D4", topic:"d4.2",
    q:"You have 8 few-shot examples in your sentiment prompt and results have gotten worse. What's likely wrong?",
    options:[
      "Too few examples",
      "Examples bloat the prompt; trim to 2-4 with at least one edge case",
      "Examples need to be longer",
      "Examples should be in JSON only"
    ],
    answer:1,
    explain:"More than ~6 examples bloats without proportional benefit. 2-4 is the sweet spot." },

  { id:"qMix10", domain:"D5", topic:"d5.1",
    q:"You have a 30-minute customer call transcript in context. Where should the agent's RULES (e.g., 'address customer as Mr. Smith') sit?",
    options:[
      "In the middle of the transcript",
      "At the beginning of context (high-recall position)",
      "Spread randomly to be safe",
      "At the very end after the transcript"
    ],
    answer:1,
    explain:"Beginning and end positions have stronger recall. Critical rules go at the start." },

  { id:"qMix11", domain:"D1", topic:"d1.3",
    q:"You're choosing between hooks and prompts to enforce a security policy. Which is correct?",
    options:[
      "Prompts only — they're easier to update",
      "Hooks only — deterministic enforcement; prompts can be ignored by the model",
      "Neither — the model is trusted",
      "Both equally"
    ],
    answer:1,
    explain:"Security policy = critical business rule. Use hooks. Prompts are probabilistic." },

  { id:"qMix12", domain:"D2", topic:"d2.4",
    q:"A teammate hardcoded JIRA_TOKEN in .mcp.json and committed it. What should you do?",
    options:[
      "Leave it — the repo is private",
      "Rotate the token immediately, switch to ${JIRA_TOKEN} env expansion, scrub git history",
      "Rename the field",
      "Add a comment"
    ],
    answer:1,
    explain:"Hardcoded secrets in version control = leaked. Rotate + use env expansion." },

  { id:"qMix13", domain:"D3", topic:"d3.4",
    q:"What does --custom_id do in Message Batches API?",
    options:[
      "Forces a specific model",
      "Lets you track individual requests within a batch",
      "Enables streaming",
      "Caches results"
    ],
    answer:1,
    explain:"custom_id maps each batch request back to your tracking system." },

  { id:"qMix14", domain:"D4", topic:"d4.3",
    q:"You add tool_choice={'type':'tool','name':'extract_invoice'}. What does it guarantee?",
    options:[
      "Correct extracted values",
      "That Claude will invoke extract_invoice with schema-compliant input",
      "Faster response time",
      "Lower cost"
    ],
    answer:1,
    explain:"Forced tool guarantees invocation + structural compliance. Semantic correctness still needs validation." },

  { id:"qMix15", domain:"D5", topic:"d5.4",
    q:"You're presenting an extraction to a human reviewer for high-value contracts. What MUST you include?",
    options:[
      "Just the extracted values",
      "Values + per-field confidence + source/provenance + recommended action + approve/modify/reject controls",
      "A confidence score for the entire document only",
      "Raw API response"
    ],
    answer:1,
    explain:"Human-in-the-loop requires field-level confidence, provenance, and clear action controls." },

  { id:"qMix16", domain:"D1", topic:"d1.2",
    q:"How do multiple Task calls in a single response behave?",
    options:[
      "Sequentially, one after another",
      "In parallel — multiple subagents work simultaneously",
      "Only the first one runs",
      "They are rejected as an error"
    ],
    answer:1,
    explain:"Multiple Task calls in one assistant turn execute in parallel. This is core hub-and-spoke parallelism." },

  { id:"qMix17", domain:"D2", topic:"d2.5",
    q:"Find all files named 'foo.test.ts' in the repo. Best built-in tool?",
    options:["Read","Grep","Glob('**/*foo.test.ts')","Bash('find ...')"],
    answer:2,
    explain:"Glob matches file PATHS. Grep would search file CONTENTS. Bash is unnecessary when a built-in exists." },

  { id:"qMix18", domain:"D3", topic:"d3.3",
    q:"You're about to refactor 20 files across the codebase. Plan mode or direct?",
    options:[
      "Direct — saves time",
      "Plan mode — multi-file architectural change benefits from upfront design",
      "Doesn't matter",
      "Skip and rewrite from scratch"
    ],
    answer:1,
    explain:"Large multi-file refactors: plan first to avoid expensive mistakes." }

];
