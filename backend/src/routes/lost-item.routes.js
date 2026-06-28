const express = require("express");

const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const lostItemController = require("../controllers/lost-item.controller");

const router = express.Router();

router.post(
  "/",
  auth,
  upload.single("image"),
  lostItemController.createLostItem
);

router.get("/", auth, lostItemController.getLostItems);

router.patch(
  "/:lost_item_id",
  auth,
  upload.single("image"),
  lostItemController.updateLostItem
);

router.get(
  "/:lost_item_id/similar-found-items",
  auth,
  lostItemController.getSimilarFoundItems
);

router.get("/:lost_item_id", auth, lostItemController.getLostItemById);

module.exports = router;