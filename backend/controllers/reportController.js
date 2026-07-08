const Report = require("../models/Report");
const { validationResult } = require("express-validator");

const createReport = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const report = await Report.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Weekly report created successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      user: req.user._id,
    })
      .populate("project")
      .sort({ weekStart: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "name email")
      .populate("project");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (req.user.role === "TEAM_MEMBER" && report.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own reports.",
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (report.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Submitted reports cannot be edited",
      });
    }

    Object.assign(report, req.body);

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    report.status = "SUBMITTED";
    report.submittedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "name email role")
      .populate("project")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const filterReports = async (req, res) => {
  try {
    const filter = {};

    if (req.query.user) {
      filter.user = req.query.user;
    }

    if (req.query.project) {
      filter.project = req.query.project;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.start && req.query.end) {
      filter.weekStart = {
        $gte: new Date(req.query.start),
        $lte: new Date(req.query.end),
      };
    }

    const reports = await Report.find(filter)
      .populate("user", "name email")
      .populate("project");

    res.json({
      success: true,
      count: reports.length,
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
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
  getAllReports,
  filterReports,
};
