const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembers,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post(
  "/",
  protect,
  authorize("MANAGER"),
  createProject
);

router.put(
  "/:id",
  protect,
  authorize("MANAGER"),
  updateProject
);

router.delete(
  "/:id",
  protect,
  authorize("MANAGER"),
  deleteProject
);

router.patch(
  "/:id/assign",
  protect,
  authorize("MANAGER"),
  assignMembers
);

router.get(
  "/",
  protect,
  getProjects
);

router.get(
  "/:id",
  protect,
  getProjectById
);

module.exports = router;
