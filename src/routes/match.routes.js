const express = require("express");

const auth = require("../middlewares/auth");
const matchController = require("../controllers/match.controller");

const router = express.Router();

router.post("/", auth, matchController.createMatchRequest);

router.get("/", auth, matchController.getMyMatches);

router.patch("/:match_id/accept", auth, matchController.acceptMatchRequest);

router.patch("/:match_id/deliver", auth, matchController.deliverMatch);

router.get("/:match_id", auth, matchController.getMatchById);

module.exports = router;