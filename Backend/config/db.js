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

    // GitHub-analyzed projects — a visitor can analyze multiple repos, so
    // this is a list per anonymousId, not a single upsert like the resume
    // profile. Holds the LLM-derived summary (technologies, architecture
    // layers) plus lightweight commit metadata for display.
    db.exec(`
        CREATE TABLE IF NOT EXISTS github_projects (
            id TEXT PRIMARY KEY,
            anonymousId TEXT NOT NULL,
            repoUrl TEXT NOT NULL,
            repoFullName TEXT,
            name TEXT,
            description TEXT,
            technologies TEXT,        -- JSON-encoded string array
            architectureLayers TEXT,  -- JSON-encoded string array
            summary TEXT,
            commits TEXT,             -- JSON-encoded array of {sha, message, author, date}
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_github_projects_anon ON github_projects(anonymousId);`);

    // Knowledge chunks — the RAG corpus. Each row is one chunk of text
    // (a README section, a slice of a source file) plus its embedding
    // vector, scoped to both the visitor and the specific project it came
    // from. Embeddings are computed locally (see services/embeddingService.js)
    // since Groq has no embeddings endpoint — no external call happens here.
    db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_chunks (
            id TEXT PRIMARY KEY,
            anonymousId TEXT NOT NULL,
            projectId TEXT NOT NULL,
            source TEXT NOT NULL,        -- e.g. 'readme', 'file:src/index.js'
            content TEXT NOT NULL,
            embedding TEXT NOT NULL,     -- JSON-encoded float array
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (projectId) REFERENCES github_projects(id) ON DELETE CASCADE
        );
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_project ON knowledge_chunks(projectId);`);

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
