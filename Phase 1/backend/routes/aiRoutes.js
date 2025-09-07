const express = require("express");
const {
    generateInterviewQuestions,
    generateConceptExplanation,
} = require("../controllers/aiController");
const { rateLimitAI } = require("../middlewares/rateLimitMiddleware");

const router = express.Router();

router.post("/generate-questions", rateLimitAI, generateInterviewQuestions);
router.post("/generate-explanation", rateLimitAI, generateConceptExplanation);

module.exports = router;
