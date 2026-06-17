const express = require("express");

const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const foundItemController = require("../controllers/found-item.controller");

const router = express.Router();

router.post(
  "/",
  auth,
  upload.single("image"),
  foundItemController.createFoundItem
);

router.get("/", auth, foundItemController.getFoundItems);

router.get("/:found_item_id", auth, foundItemController.getFoundItemById);

module.exports = router;