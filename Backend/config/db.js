const path = require("path");
const Database = require("better-sqlite3");

// MVP is auth-free (no login, no passwords, no accounts) but IS intended for
// a public URL where multiple strangers use it concurrently. That means we
// still need per-visitor data isolation — handled via a client-generated
// anonymous ID (see middlewares/anonMiddleware.js) rather than a login system.
// SQLite remains sufficient for this; swap for PostgreSQL + pgvector per PRD
// section 8 when moving to a persistent multi-instance production deploy.

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "interviewos.db");

let db;

const connectDB = () => {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");

    // Sessions: one interview-prep session (role/experience/topics -> a batch of questions)
    // Scoped to anonymousId so visitors only ever see their own sessions.
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            anonymousId TEXT NOT NULL,
            role TEXT NOT NULL,
            experience TEXT NOT NULL,
            topicsToFocus TEXT NOT NULL,
            description TEXT,
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_anon ON sessions(anonymousId);`);

    // Questions: belongs to a session, mirrors the original Mongoose Question schema
    db.exec(`
        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            sessionId TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT,
            note TEXT DEFAULT '',
            isPinned INTEGER NOT NULL DEFAULT 0,
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
        );
    `);

    // Placeholder for Phase 3 (GitHub RAG). Not used yet, created now so the
    // schema migration story stays additive rather than requiring a rewrite later.
    // NOTE: will need an anonymousId column added before Phase 3 actually
    // writes to it, following the same isolation pattern as everything else.
    db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_chunks (
            id TEXT PRIMARY KEY,
            source TEXT NOT NULL,        -- e.g. 'resume', 'github:<repo>', 'job_description'
            content TEXT NOT NULL,
            embedding TEXT,               -- JSON-encoded float array
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Candidate profile — one per visitor, derived from their most recently
    // uploaded resume. Re-uploading replaces the previous profile (MVP is
    // single-resume-at-a-time per visitor, not a history of resumes).
    db.exec(`
        CREATE TABLE IF NOT EXISTS candidate_profiles (
            anonymousId TEXT PRIMARY KEY,
            name TEXT,
            skills TEXT,          -- JSON-encoded string array
            projects TEXT,        -- JSON-encoded string array
            rawResumeText TEXT,   -- full extracted text, kept for later RAG use
            sourceFilename TEXT,
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Tracks Groq calls per visitor per day, to cap API spend on a public
    // deployment with no accounts. One row per (anonymousId, day).
    db.exec(`
        CREATE TABLE IF NOT EXISTS ai_usage (
            anonymousId TEXT NOT NULL,
            day TEXT NOT NULL,
            count INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (anonymousId, day)
        );
    `);

    console.log(`SQLite connected at ${DB_PATH}`);
    return db;
};

const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB() first.");
    }
    return db;
};

module.exports = { connectDB, getDB };
