const { crawlRepository } = require("../services/githubCrawler");
const { chunkText } = require("../services/chunker");
const { embedMany } = require("../services/embeddingService");
const { generateJSON } = require("../services/groqClient");
const { githubProjectSummaryPrompt } = require("../utils/prompts");
const githubProjectModel = require("../models/githubProjectModel");
const knowledgeChunkModel = require("../models/knowledgeChunkModel");

// @desc Crawl a GitHub repo, embed its content locally, summarize via Groq, and store it
// @route POST /api/github/analyze
// @access Public, scoped to the visitor's anonymous ID
// @note Rate-limited (see routes/githubRoutes.js) — this calls Groq once for
// the summary. The embedding step is local (no external call, no cost).
const analyzeRepository = async (req, res) => {
    try {
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ message: "repoUrl is required" });
        }

        const crawled = await crawlRepository(repoUrl);

        // Build the RAG corpus: README + each source file, chunked
        const rawChunks = [];
        if (crawled.readme) {
            rawChunks.push(...chunkText(crawled.readme, { source: "readme" }));
        }
        for (const file of crawled.files) {
            rawChunks.push(...chunkText(file.content, { source: `file:${file.path}` }));
        }

        // Embed locally — no external API call, no cost, no rate limit
        const embeddings = await embedMany(rawChunks.map((c) => c.content));
        const embeddedChunks = rawChunks.map((chunk, i) => ({ ...chunk, embedding: embeddings[i] }));

        // Summarize via Groq (the one LLM call in this pipeline)
        const fileList = crawled.files.map((f) => f.path);
        const prompt = githubProjectSummaryPrompt(
            crawled.fullName,
            crawled.readme,
            fileList,
            crawled.dependencyFile
        );
        const summary = await generateJSON(prompt);

        const project = githubProjectModel.createProject({
            anonymousId: req.anonymousId,
            repoUrl,
            repoFullName: crawled.fullName,
            name: crawled.repo,
            description: crawled.description,
            technologies: summary.technologies,
            architectureLayers: summary.architectureLayers,
            summary: summary.summary,
            commits: crawled.commits,
        });

        knowledgeChunkModel.insertChunks(project.id, req.anonymousId, embeddedChunks);

        res.status(201).json({
            success: true,
            project,
            chunkCount: embeddedChunks.length,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to analyze repository",
            error: error.message,
        });
    }
};

// @desc Get all GitHub projects analyzed by this visitor
// @route GET /api/github/projects
// @access Public, scoped to the visitor's anonymous ID
const getProjects = async (req, res) => {
    try {
        const projects = githubProjectModel.getProjectsByAnon(req.anonymousId);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Get a single analyzed project
// @route GET /api/github/projects/:id
// @access Public, scoped to the visitor's anonymous ID
const getProject = async (req, res) => {
    try {
        const project = githubProjectModel.getProjectById(req.params.id, req.anonymousId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { analyzeRepository, getProjects, getProject };
