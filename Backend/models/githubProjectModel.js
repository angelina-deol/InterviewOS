const { randomUUID } = require("crypto");
const { getDB } = require("../config/db");

const createProject = ({
    anonymousId,
    repoUrl,
    repoFullName,
    name,
    description,
    technologies,
    architectureLayers,
    summary,
    commits,
}) => {
    const db = getDB();
    const id = randomUUID();

    db.prepare(
        `INSERT INTO github_projects
            (id, anonymousId, repoUrl, repoFullName, name, description, technologies, architectureLayers, summary, commits)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
        id,
        anonymousId,
        repoUrl,
        repoFullName || "",
        name || "",
        description || "",
        JSON.stringify(technologies || []),
        JSON.stringify(architectureLayers || []),
        summary || "",
        JSON.stringify(commits || [])
    );

    return getProjectByIdRaw(id);
};

const getProjectByIdRaw = (id) => {
    const db = getDB();
    const row = db.prepare(`SELECT * FROM github_projects WHERE id = ?`).get(id);
    return row ? deserialize(row) : null;
};

const getProjectById = (id, anonymousId) => {
    const db = getDB();
    const row = db
        .prepare(`SELECT * FROM github_projects WHERE id = ? AND anonymousId = ?`)
        .get(id, anonymousId);
    return row ? deserialize(row) : null;
};

const getProjectsByAnon = (anonymousId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM github_projects WHERE anonymousId = ? ORDER BY createdAt DESC`)
        .all(anonymousId)
        .map(deserialize);
};

const deserialize = (row) => ({
    ...row,
    technologies: JSON.parse(row.technologies || "[]"),
    architectureLayers: JSON.parse(row.architectureLayers || "[]"),
    commits: JSON.parse(row.commits || "[]"),
});

module.exports = { createProject, getProjectById, getProjectsByAnon };
