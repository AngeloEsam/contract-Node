const Contract = require("../models/contractModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");

const createProject = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      projectName,
      clientName,
      projectLocation,
      projectManger,
      teamMember,
      description,
      scopeOfWork,
      budget,
      startDate,
      endDate,
      mitigationStrategies,
      impact,
      potential,
      taskTitleOne,
      taskStartDate,
      taskEndDate,
      status,
    } = req.body;
    if (
      !projectName ||
      !clientName ||
      !projectLocation ||
      !projectManger ||
      !teamMember
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let document = null;
    if (req.file) {
      document = req.file.filename;
    }
    const project = await Project.create({
      projectName,
      clientName,
      projectLocation,
      projectManger,
      teamMember,
      description,
      scopeOfWork,
      budget,
      startDate,
      endDate,
      mitigationStrategies,
      impact,
      potential,
      taskTitleOne,
      taskStartDate,
      taskEndDate,
      status,
      document,
      userId: _id,
    });
    res
      .status(201)
      .json({ message: "Project created successfully", data: project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const { _id } = req.user;
    const projects = await Project.find({ userId: _id }).select(
      "projectName id"
    );
    if (!projects) {
      return res
        .status(404)
        .json({ message: "No projects found for this user" });
    }
    res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { _id } = req.user;
    const projects = await Project.find({ userId: _id }).select(
      "projectName projectManger status"
    );
    if (!projects.length) {
      return res
        .status(404)
        .json({ message: "No projects found for this user" });
    }
    res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { _id } = req.user;

  try {
    const project = await Project.findOneAndDelete({
      _id: projectId,
      userId: _id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you're not authorized to delete it",
      });
    }

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting project",
      error: error.message,
    });
  }
};

const getSingleProject = async (req, res) => {
  const { projectId } = req.params;
  const { _id } = req.user;

  try {
    const project = await Project.findOne({ _id: projectId, userId: _id });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you're not authorized to view it",
      });
    }

    res.status(200).json({
      message: "Project retrieved successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving project",
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { _id: userId } = req.user;
  try {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        message: "Project not found or you're not authorized to update it",
      });
    }
    const updatedFields = req.body;
    Object.keys(updatedFields).forEach((key) => {
      project[key] = updatedFields[key];
    });

    if (req.file) {
      project.document = req.file.filename;
    }

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating project",
      error: error.message,
    });
  }
};

const getUserGroupsOfNames = async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id).populate("usersGroup");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const groups = user.usersGroup.map(
      (group) => group.firstName + " " + group.secondName
    );
    res.status(200).json({
      message: "Groups fetched successfully",
      groups: groups,
    });
  } catch (error) {}
};

const getProjectAndContractSummary = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const projects = await Project.find({ userId }).populate({
      path: "contracts",
      select: "totalContractValue",
    });
    const projectCount = projects.length;
    const totalContractValueSum = projects.reduce((total, project) => {
      const contractValueSum = project.contracts.reduce((sum, contract) => {
        return sum + (contract.totalContractValue || 0);
      }, 0);
      return total + contractValueSum;
    }, 0);

    res.status(200).json({
      message: "Summary fetched successfully",
      projectCount,
      totalContractValue: totalContractValueSum,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching summary",
      error: error.message,
    });
  }
};

const getProjectStatusSummary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();

    const statusCounts = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          percentage: {
            $multiply: [{ $divide: ["$count", totalProjects] }, 100],
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Project status summary fetched successfully",
      totalProjects,
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project status summary",
      error: error.message,
    });
  }
};

const searchProjects = async (req, res) => {
  try {
    const { projectName, projectManger, status } = req.query;
    const query = {};
    if (projectName) query.projectName = new RegExp(projectName, "i");
    if (projectManger) query.projectManger = new RegExp(projectManger, "i");
    if (status) query.status = new RegExp(status, "i");
    const projects = await Project.find(query).lean();
    res.status(200).json({ data: projects });
  } catch (error) {
    console.error("Error searching projects:", error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createProject,
  getUserProjects,
  getAllProjects,
  deleteProject,
  getSingleProject,
  updateProject,
  getUserGroupsOfNames,
  getProjectAndContractSummary,
  getProjectStatusSummary,
  searchProjects,
};
