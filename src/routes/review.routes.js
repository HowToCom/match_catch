const express = require("express");

const auth = require("../middlewares/auth");
const reviewController = require("../controllers/review.controller");

const router = express.Router();

router.post("/", auth, reviewController.createReview);

module.exports = router;