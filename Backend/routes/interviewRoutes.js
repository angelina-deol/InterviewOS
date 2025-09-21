const express = require("express");
const { rateLimitAI } = require("../middlewares/rateLimitMiddleware");
const {
    startInterview,
    respondToInterview,
    endInterview,
    getInterview,
    getInterviews,
} = require("../controllers/interviewController");
const { generateFeedback, getFeedback } = require("../controllers/feedbackController");

const router = express.Router();

router.post("/start", rateLimitAI, startInterview);
router.post("/:id/respond", rateLimitAI, respondToInterview);
router.post("/:id/end", endInterview);
router.post("/:id/feedback", rateLimitAI, generateFeedback);
router.get("/:id/feedback", getFeedback);
router.get("/:id", getInterview);
router.get("/", getInterviews);

module.exports = router;
