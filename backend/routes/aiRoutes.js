const express = require("express");
const router = express.Router();

const { chatWithAI } = require("../controllers/aiController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post(
  "/chat",
  protect,
  authorize("MANAGER"),
  chatWithAI
);

module.exports = router;