const { generateJSON } = require("../services/groqClient");
const { questionAnswerPrompt, conceptExplainPrompt } = require("../utils/prompts");

// @desc Generate interview questions and answers using Groq
// @route POST /api/ai/generate-questions
// @access Public
const generateInterviewQuestions = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
        const data = await generateJSON(prompt);

        // The prompt asks for {"questions": [...]} (Groq's JSON mode requires
        // a top-level object, not a bare array) — unwrap it here so the
        // external API contract stays a plain array, unchanged from before.
        res.status(200).json(data.questions || []);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate questions",
            error: error.message,
        });
    }
};

// @desc Generate an explanation for an interview question using Groq
// @route POST /api/ai/generate-explanation
// @access Public
const generateConceptExplanation = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = conceptExplainPrompt(question);
        const data = await generateJSON(prompt);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate explanation",
            error: error.message,
        });
    }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
