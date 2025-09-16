const { searchSimilar } = require("./embeddingService");
const knowledgeChunkModel = require("../models/knowledgeChunkModel");

const MAX_CONTEXT_CHARS = 3000;

/**
 * Retrieves the most relevant chunks for a project given a query, and
 * formats them into a single context string ready to drop into a prompt.
 * Returns "" if the project has no chunks (e.g. analysis hasn't run yet).
 */
const getProjectContext = async (projectId, anonymousId, queryText, topK = 5) => {
    const chunks = knowledgeChunkModel.getChunksByProject(projectId, anonymousId);
    if (!chunks.length) return "";

    const results = await searchSimilar(queryText, chunks, topK);

    let context = "";
    for (const result of results) {
        const piece = `[${result.source}]\n${result.content}\n\n`;
        if (context.length + piece.length > MAX_CONTEXT_CHARS) break;
        context += piece;
    }
    return context.trim();
};

module.exports = { getProjectContext };
