const { generateJSON } = require("../services/groqClient");
const { interviewOpeningPrompt, interviewFollowUpPrompt } = require("../utils/prompts");
const { getProjectContext } = require("../services/ragRetrieval");
const interviewModel = require("../models/interviewModel");
const githubProjectModel = require("../models/githubProjectModel");

const formatTranscript = (messages) =>
    messages
        .map((m) => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`)
        .join("\n\n");

// @desc Start a new interview: validates input, optionally pulls RAG context
// for deep-dive mode, generates an opening question via Groq, and stores it.
// @route POST /api/interviews/start
// @access Public, scoped to the visitor's anonymous ID
// @note Rate-limited (see routes/interviewRoutes.js) — this calls Groq.
const startInterview = async (req, res) => {
    try {
        const { mode, role, experience, topicsToFocus, projectId } = req.body;

        if (!mode || !interviewModel.VALID_MODES.includes(mode)) {
            return res.status(400).json({
                message: `mode must be one of: ${interviewModel.VALID_MODES.join(", ")}`,
            });
        }
        if (!role) {
            return res.status(400).json({ message: "role is required" });
        }
        if (mode === "deep_dive" && !projectId) {
            return res.status(400).json({ message: "projectId is required for deep_dive mode" });
        }

        let projectContext = "";
        if (mode === "deep_dive") {
            const project = githubProjectModel.getProjectById(projectId, req.anonymousId);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
            // Seed query for the opening question: what the project actually is
            const seedQuery = `${project.summary} ${project.architectureLayers.join(" ")} ${project.technologies.join(" ")}`;
            projectContext = await getProjectContext(projectId, req.anonymousId, seedQuery);
        }

        const prompt = interviewOpeningPrompt({ mode, role, experience, topicsToFocus, projectContext });
        const { question } = await generateJSON(prompt);

        const interview = interviewModel.createInterview({
            anonymousId: req.anonymousId,
            mode,
            role,
            experience,
            topicsToFocus,
            projectId: mode === "deep_dive" ? projectId : null,
        });

        interviewModel.addMessage(interview.id, "interviewer", question);
        const messages = interviewModel.getMessages(interview.id);

        res.status(201).json({ success: true, interview, messages });
    } catch (error) {
        res.status(500).json({ message: "Failed to start interview", error: error.message });
    }
};

// @desc Submit a candidate answer and get the interviewer's follow-up question.
// @route POST /api/interviews/:id/respond
// @access Public, scoped to the visitor's anonymous ID
// @note Rate-limited — this calls Groq.
const respondToInterview = async (req, res) => {
    try {
        const { answer } = req.body;
        if (!answer || !answer.trim()) {
            return res.status(400).json({ message: "answer is required" });
        }

        const interview = interviewModel.getInterviewById(req.params.id, req.anonymousId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        if (interview.status !== "active") {
            return res.status(400).json({ message: "This interview has already ended" });
        }

        interviewModel.addMessage(interview.id, "candidate", answer);

        let projectContext = "";
        if (interview.mode === "deep_dive" && interview.projectId) {
            // Ground the follow-up in what the candidate just said, not just
            // the original seed query — pulls newly-relevant chunks as the
            // conversation moves to different parts of the codebase.
            projectContext = await getProjectContext(interview.projectId, req.anonymousId, answer);
        }

        const transcript = formatTranscript(interviewModel.getMessages(interview.id));
        const prompt = interviewFollowUpPrompt({ mode: interview.mode, transcript, projectContext });
        const { question } = await generateJSON(prompt);

        interviewModel.addMessage(interview.id, "interviewer", question);
        const messages = interviewModel.getMessages(interview.id);

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ message: "Failed to continue interview", error: error.message });
    }
};

// @desc Mark an interview as completed
// @route POST /api/interviews/:id/end
// @access Public, scoped to the visitor's anonymous ID
const endInterview = async (req, res) => {
    try {
        const interview = interviewModel.getInterviewById(req.params.id, req.anonymousId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const updated = interviewModel.updateStatus(req.params.id, req.anonymousId, "completed");
        res.status(200).json({ success: true, interview: updated });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Get a single interview with its full transcript
// @route GET /api/interviews/:id
// @access Public, scoped to the visitor's anonymous ID
const getInterview = async (req, res) => {
    try {
        const interview = interviewModel.getInterviewById(req.params.id, req.anonymousId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const messages = interviewModel.getMessages(interview.id);
        res.status(200).json({ success: true, interview, messages });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc List all interviews for this visitor
// @route GET /api/interviews
// @access Public, scoped to the visitor's anonymous ID
const getInterviews = async (req, res) => {
    try {
        const interviews = interviewModel.getInterviewsByAnon(req.anonymousId);
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { startInterview, respondToInterview, endInterview, getInterview, getInterviews };
