const express = require("express");
const router = express.Router();

const {
  getSummary,
  getCharts,
  getRecentActivity,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get(
  "/summary",
  protect,
  authorize("MANAGER"),
  getSummary
);

router.get(
  "/charts",
  protect,
  authorize("MANAGER"),
  getCharts
);

router.get(
  "/recent",
  protect,
  authorize("MANAGER"),
  getRecentActivity
);

module.exports = router;
