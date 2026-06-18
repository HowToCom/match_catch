const express = require("express");

const auth = require("../middlewares/auth");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

router.post("/analyze", auth, aiController.analyze);

module.exports = router;
