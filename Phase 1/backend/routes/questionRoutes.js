const express = require("express");
const {
    togglePinQuestion,
    updateQuestionNote,
    addQuestionsToSession,
} = require("../controllers/questionController");

const router = express.Router();

router.post("/add", addQuestionsToSession);
router.post("/:id/pin", togglePinQuestion);
router.post("/:id/note", updateQuestionNote);

module.exports = router;
