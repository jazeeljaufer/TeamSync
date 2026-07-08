const Report = require("../models/Report");
const Project = require("../models/Project");
const User = require("../models/User");

const getSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "TEAM_MEMBER",
    });

    const totalReports = await Report.countDocuments({
      status: "SUBMITTED",
    });

    const pendingReports = totalUsers - totalReports;

    const blockerReports = await Report.countDocuments({
      blockers: { $exists: true, $ne: [] },
    });

    const complianceRate =
      totalUsers === 0
        ? 0
        : Number(((totalReports / totalUsers) * 100).toFixed(2));

    res.json({
      success: true,
      summary: {
        totalUsers,
        totalReports,
        pendingReports,
        blockerReports,
        complianceRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCharts = async (req, res) => {
  try {
    const taskTrend = await Report.aggregate([
      {
        $group: {
          _id: "$weekStart",
          totalTasks: {
            $sum: {
              $size: "$tasksCompleted",
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const submissionStatus = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const workload = await Report.aggregate([
      {
        $group: {
          _id: "$project",
          reports: {
            $sum: 1,
          },
          hours: {
            $sum: "$hoursWorked",
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
    ]);

    res.json({
      success: true,
      charts: {
        taskTrend,
        submissionStatus,
        workload,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "name")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getCharts,
  getRecentActivity,
};
