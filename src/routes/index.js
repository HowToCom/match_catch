const express = require("express");

const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const foundItemRoutes = require("./found-item.routes");
const lostItemRoutes = require("./lost-item.routes");
const matchRoutes = require("./match.routes");
const chatRoutes = require("./chat.routes");
const reviewRoutes = require("./review.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API root",
  });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/found-items", foundItemRoutes);
router.use("/lost-items", lostItemRoutes);
router.use("/matches", matchRoutes);
router.use("/chat-rooms", chatRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;