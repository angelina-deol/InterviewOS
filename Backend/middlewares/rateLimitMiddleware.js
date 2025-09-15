const { getDB } = require("../config/db");

// Caps how many AI (Groq) calls a single anonymous visitor can make per
// day. This exists because the app is meant for a public URL with no
// accounts and no payment — without a cap, anyone with the link can run up
// the API bill on the deployer's key. Applied only to the AI routes
// (question generation, explanations), not to plain CRUD routes.

const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || "20", 10);

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const rateLimitAI = (req, res, next) => {
    try {
        const db = getDB();
        const anonymousId = req.anonymousId;
        const day = todayKey();

        const row = db
            .prepare(`SELECT count FROM ai_usage WHERE anonymousId = ? AND day = ?`)
            .get(anonymousId, day);

        const currentCount = row ? row.count : 0;

        if (currentCount >= DAILY_LIMIT) {
            return res.status(429).json({
                message: `Daily AI usage limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
            });
        }

        db.prepare(
            `INSERT INTO ai_usage (anonymousId, day, count)
             VALUES (?, ?, 1)
             ON CONFLICT(anonymousId, day)
             DO UPDATE SET count = count + 1`
        ).run(anonymousId, day);

        next();
    } catch (error) {
        // Fail open on rate-limiter errors — don't let a bug in usage
        // tracking take down the actual feature.
        console.error("Rate limiter error:", error.message);
        next();
    }
};

module.exports = { rateLimitAI, DAILY_LIMIT };
