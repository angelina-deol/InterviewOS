// Anonymous-ID middleware
// ------------------------
// InterviewOS stays auth-free (no login, no passwords, no accounts) but is
// meant to run on a public URL with multiple concurrent visitors. Each
// visitor's frontend generates a random ID on first load (see
// frontend/src/lib/anonId.ts) and sends it on every request via the
// X-Anon-Id header. This middleware just validates it's present and looks
// like a UUID, then attaches it to req.anonymousId for controllers/models
// to scope their queries by.
//
// This is identity without accounts: it prevents strangers from seeing or
// deleting each other's sessions, but it is NOT authentication — there's no
// password, no login, and no recovery if a visitor clears their browser
// storage or switches devices. That tradeoff is intentional for the MVP.

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const requireAnonId = (req, res, next) => {
    const anonymousId = req.headers["x-anon-id"];

    if (!anonymousId || typeof anonymousId !== "string" || !UUID_RE.test(anonymousId)) {
        return res.status(400).json({
            message: "Missing or invalid X-Anon-Id header",
        });
    }

    req.anonymousId = anonymousId;
    next();
};

module.exports = { requireAnonId };
