require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { connectDB } = require("./config/db");
const { requireAnonId } = require("./middlewares/anonMiddleware");

const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Anon-Id"],
    })
);
app.use(express.json());

// DB
connectDB();

// Ensure uploads dir exists (needed by uploadMiddlewares.js's disk storage)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Health check — exempt from the anon-ID requirement, used for uptime checks
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Routes — all data routes require a valid anonymous visitor ID, since this
// app is meant to run on a public URL with no login system. See
// middlewares/anonMiddleware.js for why.
app.use("/api/sessions", requireAnonId, sessionRoutes);
app.use("/api/questions", requireAnonId, questionRoutes);
app.use("/api/ai", requireAnonId, aiRoutes);
app.use("/api/resume", requireAnonId, resumeRoutes);

// Serve uploads folder
app.use("/uploads", express.static(uploadsDir));

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
