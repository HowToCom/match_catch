const express = require("express");

const auth = require("../middlewares/auth");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/me", auth, profileController.getMyProfile);

router.patch("/me", auth, profileController.updateMyProfile);

router.get("/me/temperature", auth, profileController.getMyTemperature);

router.get("/me/activities", auth, profileController.getMyActivities);

module.exports = router;