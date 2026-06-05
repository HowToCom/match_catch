const express = require("express");

const auth = require("../middlewares/auth");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/me", auth, profileController.getMyProfile);

router.get("/me/activities", auth, profileController.getMyActivities);

module.exports = router;