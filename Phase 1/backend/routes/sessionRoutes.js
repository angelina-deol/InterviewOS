const express = require("express");
const {
    createSession,
    getSessionById,
    getMySessions,
    deleteSession,
} = require("../controllers/sessionController");

const router = express.Router();

router.post("/create", createSession);
router.get("/my-sessions", getMySessions);
router.get("/:id", getSessionById);
router.delete("/:id", deleteSession);

module.exports = router;
