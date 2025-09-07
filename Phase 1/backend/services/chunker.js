// Splits text into overlapping chunks for embedding. Simple character-based
// splitting rather than sentence/AST-aware chunking — good enough for MVP
// scale, and language-agnostic (works the same for Python, Go, README
// markdown, etc. without per-language parsers).

const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 100;

/**
 * @param {string} text
 * @param {{ source: string, chunkSize?: number, overlap?: number }} options
 * @returns {{ source: string, content: string }[]}
 */
const chunkText = (text, { source, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP }) => {
    const chunks = [];
    if (!text || !text.trim()) return chunks;

    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const content = text.slice(start, end).trim();
        if (content) {
            chunks.push({ source, content });
        }
        if (end >= text.length) break;
        start = end - overlap;
    }

    return chunks;
};

module.exports = { chunkText };
