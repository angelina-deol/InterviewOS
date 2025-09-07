const questionModel = require("../models/questionModel");

// @desc Add additional questions to an existing session (must belong to this visitor)
// @route POST /api/questions/add
// @access Public, scoped to the visitor's anonymous ID
exports.addQuestionsToSession = async (req, res) => {
    try {
        const { sessionId, questions } = req.body;
        const { anonymousId } = req;

        if (!sessionId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const createdQuestions = questionModel.createManyQuestions(sessionId, anonymousId, questions);

        if (createdQuestions === null) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(201).json(createdQuestions);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Pin or unpin a question (must belong to this visitor)
// @route POST /api/questions/:id/pin
// @access Public, scoped to the visitor's anonymous ID
exports.togglePinQuestion = async (req, res) => {
    try {
        const question = questionModel.togglePin(req.params.id, req.anonymousId);

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Update a note for a question (must belong to this visitor)
// @route POST /api/questions/:id/note
// @access Public, scoped to the visitor's anonymous ID
exports.updateQuestionNote = async (req, res) => {
    try {
        const { note } = req.body;
        const question = questionModel.updateNote(req.params.id, req.anonymousId, note);

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
