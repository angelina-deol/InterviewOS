const { randomUUID } = require("crypto");
const { getDB } = require("../config/db");

const VALID_MODES = ["technical", "deep_dive", "behavioral"];

const createInterview = ({ anonymousId, mode, role, experience, topicsToFocus, projectId }) => {
    const db = getDB();
    const id = randomUUID();

    db.prepare(
        `INSERT INTO interviews (id, anonymousId, mode, role, experience, topicsToFocus, projectId)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, anonymousId, mode, role, experience || "", topicsToFocus || "", projectId || null);

    return getInterviewByIdRaw(id);
};

const getInterviewByIdRaw = (id) => {
    const db = getDB();
    return db.prepare(`SELECT * FROM interviews WHERE id = ?`).get(id);
};

const getInterviewById = (id, anonymousId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM interviews WHERE id = ? AND anonymousId = ?`)
        .get(id, anonymousId);
};

const getInterviewsByAnon = (anonymousId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM interviews WHERE anonymousId = ? ORDER BY createdAt DESC`)
        .all(anonymousId);
};

const updateStatus = (id, anonymousId, status) => {
    const db = getDB();
    db.prepare(
        `UPDATE interviews SET status = ?, updatedAt = datetime('now') WHERE id = ? AND anonymousId = ?`
    ).run(status, id, anonymousId);
    return getInterviewById(id, anonymousId);
};

const addMessage = (interviewId, role, content) => {
    const db = getDB();
    const id = randomUUID();

    db.prepare(
        `INSERT INTO interview_messages (id, interviewId, role, content) VALUES (?, ?, ?, ?)`
    ).run(id, interviewId, role, content);

    db.prepare(`UPDATE interviews SET updatedAt = datetime('now') WHERE id = ?`).run(interviewId);

    return db.prepare(`SELECT * FROM interview_messages WHERE id = ?`).get(id);
};

const getMessages = (interviewId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM interview_messages WHERE interviewId = ? ORDER BY createdAt ASC`)
        .all(interviewId);
};

module.exports = {
    VALID_MODES,
    createInterview,
    getInterviewById,
    getInterviewsByAnon,
    updateStatus,
    addMessage,
    getMessages,
};
