const express = require("express");
const { rateLimitAI } = require("../middlewares/rateLimitMiddleware");
const { analyzeRepository, getProjects, getProject } = require("../controllers/githubController");

const router = express.Router();

router.post("/analyze", rateLimitAI, analyzeRepository);
router.get("/projects", getProjects);
router.get("/projects/:id", getProject);

module.exports = router;
