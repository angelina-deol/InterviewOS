const { pipeline } = require("@xenova/transformers");

// Groq has no embeddings endpoint (confirmed against their API reference —
// Chat, Responses, Audio, Models, Batches, Files, Fine Tuning, nothing else).
// So embeddings run locally via a small transformer model (all-MiniLM-L6-v2,
// ~90MB) executed in-process with ONNX Runtime. No API key, no external call,
// no per-embedding cost — fits the "zero external services" decision for the
// vector store.
//
// NOTE: the model weights download from Hugging Face Hub on first use and
// are cached locally after that. That first download needs network access
// to huggingface.co.

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

let embedderPromise = null;
const getEmbedder = () => {
    if (!embedderPromise) {
        embedderPromise = pipeline("feature-extraction", MODEL_NAME);
    }
    return embedderPromise;
};

/**
 * Embeds a single piece of text into a fixed-length float vector.
 */
const embed = async (text) => {
    const embedder = await getEmbedder();
    const output = await embedder(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
};

/**
 * Embeds many texts. Sequential rather than Promise.all — the underlying
 * ONNX session isn't safe for unbounded concurrent calls, and for MVP-scale
 * chunk counts (dozens, not thousands) sequential is fast enough.
 */
const embedMany = async (texts) => {
    const results = [];
    for (const text of texts) {
        results.push(await embed(text));
    }
    return results;
};

const cosineSimilarity = (a, b) => {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Given a query string and a list of {..., embedding} chunks, returns the
 * topK most similar chunks by cosine similarity. Flat linear scan — fine
 * for MVP-scale corpora (a handful of repos, dozens of chunks each). Swap
 * for a real vector index (e.g. pgvector) if corpus size grows significantly.
 */
const searchSimilar = async (queryText, chunks, topK = 5) => {
    const queryEmbedding = await embed(queryText);
    return chunks
        .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
};

module.exports = { embed, embedMany, cosineSimilarity, searchSimilar };
