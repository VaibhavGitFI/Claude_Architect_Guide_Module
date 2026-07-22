/*
 * POST /api/generate-questions
 *
 * 1:1 port of v1/api/generate-questions.js (Vercel serverless function) to a
 * Next.js App Router Route Handler. Same validation, same system/user prompt
 * construction, same JSON schema, same error codes (400/429/500), same env
 * vars — only the request/response plumbing changed to fit Request/Response.
 *
 * Generates ONE fresh practice question via Gemini 2.0 Flash. Purely
 * additive: the Domain Quiz page falls back to the static bank on any error.
 *
 * Env:
 *   GEMINI_API_KEY    required
 *   GEMINI_MODEL      optional override (default "gemini-2.0-flash")
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// The SDK does Node-only work; don't run this on the edge runtime.
export const runtime = "nodejs";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MAX_STYLE_REF_CHARS = 8000;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    answer: { type: "integer", minimum: 0, maximum: 3 },
    rationales: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
  },
  required: ["question", "options", "answer", "rationales"],
};

function buildSystemPrompt(domain, topic, topicTitle) {
  return `You are an exam-question author for the Claude Certified Architect (Foundations) exam.

You will produce ONE original multiple-choice scenario question for:
  Domain: ${domain}
  Task statement: ${topic} ${topicTitle}

Requirements:
- The question must be scenario-based — a 1–3 sentence concrete situation, then a specific decision.
- Exactly 4 options labelled by index 0..3 (no letter prefixes; just the text).
- Exactly one correct option. Provide its index as "answer".
- Distractors must be plausible exam-style traps that reflect the real anti-patterns for this task statement.
- Per-option rationales array of length 4, aligned 1:1 with options:
    * the rationale for the correct option explains WHY it's right
    * each rationale for a wrong option explains WHY it's wrong (cite the specific concept/anti-pattern)
- British English. No emoji. No markdown. No surrounding commentary.
- Output strictly conformant JSON matching the supplied response schema.

Do NOT copy verbatim from the style-reference examples. Use them only to match TONE, COMPLEXITY, and SCENARIO STYLE.`;
}

function buildUserPrompt(styleRef) {
  const refBlock = (styleRef || [])
    .map((r, i) => {
      const opts = (r.options || []).map((o, oi) => `  [${oi}] ${o}`).join("\n");
      const rats = (r.rationales || []).map((rt, ri) => `  [${ri}] ${rt}`).join("\n");
      return [`Example ${i + 1}:`, `Question: ${r.question}`, `Options:`, opts, `Correct: ${r.answer}`, `Rationales:`, rats].join(
        "\n"
      );
    })
    .join("\n\n");

  return `Style reference (do NOT copy these; produce something new in the same style):

${refBlock || "(no style reference provided)"}

Now produce ONE original scenario question in the requested JSON shape.`;
}

function validateBody(body) {
  if (!body || typeof body !== "object") return "request body must be JSON object";
  const { domain, topic, topicTitle, styleRef } = body;
  if (!/^D[1-5]$/.test(String(domain || ""))) return "domain must be one of D1..D5";
  if (typeof topic !== "string" || !topic) return "topic is required";
  if (typeof topicTitle !== "string" || !topicTitle) return "topicTitle is required";
  if (styleRef && !Array.isArray(styleRef)) return "styleRef must be an array";
  if (Array.isArray(styleRef) && JSON.stringify(styleRef).length > MAX_STYLE_REF_CHARS) {
    return "styleRef exceeds size cap of " + MAX_STYLE_REF_CHARS + " characters";
  }
  return null;
}

function validateGeneratedQuestion(q) {
  if (!q || typeof q !== "object") return "model did not return an object";
  if (typeof q.question !== "string" || q.question.length < 20) return "question text missing or too short";
  if (!Array.isArray(q.options) || q.options.length !== 4) return "options must be an array of exactly 4 strings";
  if (q.options.some((o) => typeof o !== "string" || !o.trim())) return "every option must be a non-empty string";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return "answer must be an integer 0..3";
  if (!Array.isArray(q.rationales) || q.rationales.length !== 4) return "rationales must be an array of exactly 4 strings";
  if (q.rationales.some((r) => typeof r !== "string" || !r.trim())) return "every rationale must be a non-empty string";
  return null;
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const bodyErr = validateBody(body);
  if (bodyErr) return NextResponse.json({ error: bodyErr }, { status: 400 });

  const { domain, topic, topicTitle, styleRef } = body;

  try {
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: buildSystemPrompt(domain, topic, topicTitle),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    });

    const result = await model.generateContent(buildUserPrompt(styleRef));
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "model returned malformed JSON", detail: text.slice(0, 500) }, { status: 400 });
    }

    const vErr = validateGeneratedQuestion(parsed);
    if (vErr) return NextResponse.json({ error: vErr, detail: parsed }, { status: 400 });

    return NextResponse.json({
      id: domain.toLowerCase() + "-ai-" + Date.now().toString(36),
      source: "ai",
      domain,
      topic,
      topicTitle,
      question: parsed.question,
      options: parsed.options,
      answer: parsed.answer,
      rationales: parsed.rationales,
      model: MODEL_NAME,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = String(err?.message || err);
    const status = err?.status || err?.statusCode || 0;
    if (status === 429 || /quota|rate.?limit|RESOURCE_EXHAUSTED/i.test(msg)) {
      return NextResponse.json({ error: "Gemini quota or rate limit hit", detail: msg }, { status: 429 });
    }
    return NextResponse.json({ error: "Gemini call failed", detail: msg }, { status: 500 });
  }
}
