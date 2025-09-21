const { randomUUID } = require("crypto");
const { getDB } = require("../config/db");

const createFeedback = ({ interviewId, anonymousId, technicalDepth, communication, confidence, summary, suggestions }) => {
    const db = getDB();
    const id = randomUUID();

    db.prepare(
        `INSERT INTO interview_feedback
            (id, interviewId, anonymousId, technicalDepth, communication, confidence, summary, suggestions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(interviewId) DO UPDATE SET
            technicalDepth = excluded.technicalDepth,
            communication = excluded.communication,
            confidence = excluded.confidence,
            summary = excluded.summary,
            suggestions = excluded.suggestions`
    ).run(
        id,
        interviewId,
        anonymousId,
        technicalDepth ?? null,
        communication ?? null,
        confidence ?? null,
        summary || "",
        JSON.stringify(suggestions || [])
    );

    return getFeedbackByInterview(interviewId, anonymousId);
};

const getFeedbackByInterview = (interviewId, anonymousId) => {
    const db = getDB();
    const row = db
        .prepare(`SELECT * FROM interview_feedback WHERE interviewId = ? AND anonymousId = ?`)
        .get(interviewId, anonymousId);

    if (!row) return null;

    return { ...row, suggestions: JSON.parse(row.suggestions || "[]") };
};

module.exports = { createFeedback, getFeedbackByInterview };
