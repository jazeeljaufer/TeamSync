const Project = require("../models/Project");
const User = require("../models/User");

const allowedStatuses = ["ACTIVE", "COMPLETED", "ON_HOLD"];

const sanitizeStatus = (status) => {
  if (typeof status !== "string") return undefined;
  let cleaned = status.replace(/['"]/g, "").trim().toUpperCase();
  cleaned = cleaned.replace(/[-\s]+/g, "_");
  return cleaned;
};

const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const exists = await Project.findOne({ name });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Project already exists",
      });
    }

    let finalStatus;
    if (status === undefined || status === null || (typeof status === "string" && status.trim() === "")) {
      finalStatus = "ACTIVE";
    } else {
      finalStatus = sanitizeStatus(status);
      if (!allowedStatuses.includes(finalStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid project status: '${status}'. Allowed values are: ${allowedStatuses.join(", ")}`,
        });
      }
    }

    const assignedMembers = req.body.assignedMembers || [];

    const project = await Project.create({
      name,
      description,
      status: finalStatus,
      assignedMembers,
      createdBy: req.user._id,
    });

    if (assignedMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedMembers } },
        {
          $addToSet: {
            projects: project._id,
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "TEAM_MEMBER") {
      query.assignedMembers = req.user._id;
    }

    const projects = await Project.find(query)
      .populate("assignedMembers", "name email")
      .populate("createdBy", "name");

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("assignedMembers", "name email")
      .populate("createdBy", "name");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;

    if (req.body.status !== undefined && req.body.status !== null && req.body.status !== "") {
      const sanitizedStatus = sanitizeStatus(req.body.status);
      if (!allowedStatuses.includes(sanitizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid project status: '${req.body.status}'. Allowed values are: ${allowedStatuses.join(", ")}`,
        });
      }
      project.status = sanitizedStatus;
    }

    if (req.body.assignedMembers !== undefined) {
      const oldMembers = project.assignedMembers || [];
      const newMembers = req.body.assignedMembers || [];

      const removedMembers = oldMembers.filter(m => !newMembers.includes(m.toString()));
      const addedMembers = newMembers.filter(m => !oldMembers.map(om => om.toString()).includes(m));

      if (removedMembers.length > 0) {
        await User.updateMany(
          { _id: { $in: removedMembers } },
          {
            $pull: {
              projects: project._id,
            },
          }
        );
      }

      if (addedMembers.length > 0) {
        await User.updateMany(
          { _id: { $in: addedMembers } },
          {
            $addToSet: {
              projects: project._id,
            },
          }
        );
      }

      project.assignedMembers = newMembers;
    }

    await project.save();

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const assignMembers = async (req, res) => {
  try {
    const { members } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const oldMembers = project.assignedMembers || [];
    const newMembers = members || [];

    const removedMembers = oldMembers.filter(m => !newMembers.includes(m.toString()));
    const addedMembers = newMembers.filter(m => !oldMembers.map(om => om.toString()).includes(m));

    if (removedMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: removedMembers } },
        {
          $pull: {
            projects: project._id,
          },
        }
      );
    }

    if (addedMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: addedMembers } },
        {
          $addToSet: {
            projects: project._id,
          },
        }
      );
    }

    project.assignedMembers = newMembers;
    await project.save();

    res.json({
      success: true,
      message: "Members assigned successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembers,
};
