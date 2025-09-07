const Groq = require("groq-sdk");

// Single shared client instance. Every agent (AI controller, resume, and
// future GitHub/JD/interview/feedback agents) should import this rather
// than constructing its own.
//
// Switched from Gemini to Groq (July 2026) — Groq's API is OpenAI-compatible
// (chat.completions.create, choices[0].message.content) and runs on their
// own inference hardware, which is faster than Gemini's free tier and has
// historically had a more generous free-tier request allowance.

if (!process.env.GROQ_API_KEY) {
    console.warn(
        "WARNING: GROQ_API_KEY is not set. AI features will fail until it is configured in .env"
    );
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Groq deprecates model IDs on a rolling basis too — llama-3.3-70b-versatile
// and llama-3.1-8b-instant were both deprecated June 17, 2026, the same week
// as this migration. Same lesson as the earlier Gemini retirement: the
// default lives in an env var, overridable without a code change. Current
// default follows Groq's own migration guidance (openai/gpt-oss-120b) as of
// July 2026 — see console.groq.com/docs/deprecations before assuming this
// is still current.
const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

/**
 * Calls Groq with a prompt and returns parsed JSON.
 * Uses Groq's JSON mode (response_format: json_object) so the model is
 * constrained to valid JSON server-side, rather than relying purely on
 * prompt instructions + regex-stripping markdown fences after the fact
 * (the old Gemini approach). We still defensively strip fences in case a
 * model ever wraps output despite JSON mode.
 */
const generateJSON = async (prompt, model = DEFAULT_MODEL) => {
    const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content || "";

    const cleanedText = rawText
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "")
        .trim();

    return JSON.parse(cleanedText);
};

module.exports = { groq, generateJSON, DEFAULT_MODEL };
