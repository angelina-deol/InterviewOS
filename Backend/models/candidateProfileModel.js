const { getDB } = require("../config/db");

const upsertProfile = ({ anonymousId, name, skills, projects, rawResumeText, sourceFilename }) => {
    const db = getDB();

    db.prepare(
        `INSERT INTO candidate_profiles
            (anonymousId, name, skills, projects, rawResumeText, sourceFilename)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(anonymousId) DO UPDATE SET
            name = excluded.name,
            skills = excluded.skills,
            projects = excluded.projects,
            rawResumeText = excluded.rawResumeText,
            sourceFilename = excluded.sourceFilename,
            updatedAt = datetime('now')`
    ).run(
        anonymousId,
        name || "",
        JSON.stringify(skills || []),
        JSON.stringify(projects || []),
        rawResumeText || "",
        sourceFilename || ""
    );

    return getProfile(anonymousId);
};

const getProfile = (anonymousId) => {
    const db = getDB();
    const row = db
        .prepare(`SELECT * FROM candidate_profiles WHERE anonymousId = ?`)
        .get(anonymousId);

    if (!row) return null;

    return {
        ...row,
        skills: JSON.parse(row.skills || "[]"),
        projects: JSON.parse(row.projects || "[]"),
    };
};

module.exports = { upsertProfile, getProfile };
