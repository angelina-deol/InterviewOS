const fs = require("fs");
const { extractTextFromPDF } = require("../services/pdfParser");
const { generateJSON } = require("../services/groqClient");
const { resumeExtractionPrompt } = require("../utils/prompts");
const candidateProfileModel = require("../models/candidateProfileModel");

// @desc Upload a resume PDF, extract text, and derive a structured candidate profile
// @route POST /api/resume/upload
// @access Public, scoped to the visitor's anonymous ID
// @note Rate-limited (see routes/resumeRoutes.js) — this calls Groq.
const uploadResume = async (req, res) => {
    let uploadedFilePath;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No resume file uploaded" });
        }

        uploadedFilePath = req.file.path;

        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "Only PDF resumes are supported" });
        }

        const buffer = fs.readFileSync(uploadedFilePath);
        const resumeText = await extractTextFromPDF(buffer);

        const prompt = resumeExtractionPrompt(resumeText);
        const extracted = await generateJSON(prompt);

        const profile = candidateProfileModel.upsertProfile({
            anonymousId: req.anonymousId,
            name: extracted.name,
            skills: extracted.skills,
            projects: extracted.projects,
            rawResumeText: resumeText,
            sourceFilename: req.file.originalname,
        });

        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Resume upload failed:", error);
        res.status(500).json({
            message: "Failed to process resume",
            error: error.message,
        });
    } finally {
        // Clean up the uploaded file regardless of outcome — we've already
        // extracted and stored the text we need; no reason to keep the PDF
        // sitting on disk indefinitely.
        if (uploadedFilePath) {
            fs.unlink(uploadedFilePath, () => {});
        }
    }
};

// @desc Get the current candidate profile for this visitor
// @route GET /api/resume/profile
// @access Public, scoped to the visitor's anonymous ID
const getProfile = async (req, res) => {
    try {
        const profile = candidateProfileModel.getProfile(req.anonymousId);

        if (!profile) {
            return res.status(404).json({ message: "No candidate profile yet" });
        }

        res.status(200).json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { uploadResume, getProfile };
