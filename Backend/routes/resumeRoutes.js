const express = require("express");
const upload = require("../middlewares/uploadMiddlewares");
const { rateLimitAI } = require("../middlewares/rateLimitMiddleware");
const { uploadResume, getProfile } = require("../controllers/resumeController");

const router = express.Router();

router.post("/upload", rateLimitAI, upload.single("resume"), uploadResume);
router.get("/profile", getProfile);

module.exports = router;
