const { randomUUID } = require("crypto");
const { getDB } = require("../config/db");

/**
 * @param {string} projectId
 * @param {string} anonymousId
 * @param {{source: string, content: string, embedding: number[]}[]} chunks
 */
const insertChunks = (projectId, anonymousId, chunks) => {
    if (!chunks.length) return [];

    const db = getDB();
    const insert = db.prepare(
        `INSERT INTO knowledge_chunks (id, anonymousId, projectId, source, content, embedding)
         VALUES (?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction((items) => {
        const ids = [];
        for (const chunk of items) {
            const id = randomUUID();
            insert.run(id, anonymousId, projectId, chunk.source, chunk.content, JSON.stringify(chunk.embedding));
            ids.push(id);
        }
        return ids;
    });

    return insertMany(chunks);
};

/**
 * Returns chunks for a project with embeddings parsed back into arrays,
 * ready for cosine-similarity search. Ownership-checked via anonymousId.
 */
const getChunksByProject = (projectId, anonymousId) => {
    const db = getDB();
    return db
        .prepare(`SELECT * FROM knowledge_chunks WHERE projectId = ? AND anonymousId = ?`)
        .all(projectId, anonymousId)
        .map((row) => ({ ...row, embedding: JSON.parse(row.embedding) }));
};

module.exports = { insertChunks, getChunksByProject };
