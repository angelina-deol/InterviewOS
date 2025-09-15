const { randomUUID } = require("crypto");
const { getDB } = require("../config/db");

const createSession = ({ anonymousId, role, experience, topicsToFocus, description }) => {
    const db = getDB();
    const id = randomUUID();

    db.prepare(
        `INSERT INTO sessions (id, anonymousId, role, experience, topicsToFocus, description)
         VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, anonymousId, role, experience, topicsToFocus, description || "");

    return getSessionByIdRaw(id);
};

// Internal helper — no ownership check. Only used right after creation,
// where we already know the session belongs to the caller.
const getSessionByIdRaw = (id) => {
    const db = getDB();
    return db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id);
};

// Ownership-checked lookup — returns undefined if the session doesn't
// belong to this anonymousId (even if it exists for someone else).
const getSessionById = (id, anonymousId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM sessions WHERE id = ? AND anonymousId = ?`)
        .get(id, anonymousId);
};

const getAllSessions = (anonymousId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM sessions WHERE anonymousId = ? ORDER BY createdAt DESC`)
        .all(anonymousId);
};

const deleteSession = (id, anonymousId) => {
    const db = getDB();
    const result = db
        .prepare(`DELETE FROM sessions WHERE id = ? AND anonymousId = ?`)
        .run(id, anonymousId);
    return result.changes > 0;
};

module.exports = {
    createSession,
    getSessionByIdRaw,
    getSessionById,
    getAllSessions,
    deleteSession,
};
