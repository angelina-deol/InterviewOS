const { generateJSON } = require("../services/groqClient");
const { feedbackScoringPrompt } = require("../utils/prompts");
const interviewModel = require("../models/interviewModel");
const feedbackModel = require("../models/feedbackModel");

const formatTranscript = (messages) =>
    messages
        .map((m) => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`)
        .join("\n\n");

// @desc Generate scored feedback for an interview from its full transcript.
// Also marks the interview as completed, if it isn't already — asking for
// feedback is itself the natural "I'm done" signal.
// @route POST /api/interviews/:id/feedback
// @access Public, scoped to the visitor's anonymous ID
// @note Rate-limited (see routes/interviewRoutes.js) — this calls Groq.
const generateFeedback = async (req, res) => {
    try {
        const interview = interviewModel.getInterviewById(req.params.id, req.anonymousId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const messages = interviewModel.getMessages(interview.id);
        const candidateMessages = messages.filter((m) => m.role === "candidate");

        if (candidateMessages.length === 0) {
            return res.status(400).json({
                message: "This interview has no answers yet — nothing to give feedback on.",
            });
        }

        const transcript = formatTranscript(messages);
        const prompt = feedbackScoringPrompt(transcript, interview.mode, interview.role);
        const scored = await generateJSON(prompt);

        const feedback = feedbackModel.createFeedback({
            interviewId: interview.id,
            anonymousId: req.anonymousId,
            technicalDepth: scored.technicalDepth,
            communication: scored.communication,
            confidence: scored.confidence,
            summary: scored.summary,
            suggestions: scored.suggestions,
        });

        if (interview.status !== "completed") {
            interviewModel.updateStatus(interview.id, req.anonymousId, "completed");
        }

        res.status(201).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate feedback", error: error.message });
    }
};

// @desc Get existing feedback for an interview, if it's been generated.
// @route GET /api/interviews/:id/feedback
// @access Public, scoped to the visitor's anonymous ID
const getFeedback = async (req, res) => {
    try {
        const interview = interviewModel.getInterviewById(req.params.id, req.anonymousId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const feedback = feedbackModel.getFeedbackByInterview(interview.id, req.anonymousId);
        if (!feedback) {
            return res.status(404).json({ message: "No feedback generated yet" });
        }

        res.status(200).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { generateFeedback, getFeedback };
