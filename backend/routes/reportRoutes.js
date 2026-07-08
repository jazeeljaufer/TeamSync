const express = require("express");
const router = express.Router();

const {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
  getAllReports,
  filterReports,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { reportValidator } = require("../validators/reportValidator");

router.get(
  "/manager/all",
  protect,
  authorize("MANAGER"),
  getAllReports
);

router.get(
  "/manager/filter",
  protect,
  authorize("MANAGER"),
  filterReports
);

router.post(
  "/",
  protect,
  authorize("TEAM_MEMBER"),
  reportValidator,
  createReport
);

router.get(
  "/my",
  protect,
  authorize("TEAM_MEMBER"),
  getMyReports
);

router.put(
  "/:id",
  protect,
  authorize("TEAM_MEMBER"),
  reportValidator,
  updateReport
);

router.patch(
  "/:id/submit",
  protect,
  authorize("TEAM_MEMBER"),
  submitReport
);

router.get(
  "/:id",
  protect,
  getReportById
);

module.exports = router;
