const Contract = require("../models/contractModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");

const createProject = async (req, res) => {
  try {
    const { _id } = req.user;
    let {
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
    if (typeof teamMember === "string") {
      teamMember = teamMember.split(",");
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map((file) => file.filename);
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
      documents,
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
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "tenant not found" });
    }
    let projects = [];
    let parentUser;
    let totalProjects;
    if (user.parentId == null) {
      projects = await Project.find({ userId })
        .select("projectName projectManger status")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      totalProjects = await Project.countDocuments({ userId });
    } else {
      parentUser = await User.findById(user.parentId);
      projects = await Project.find({ userId: parentUser._id })
        .select("projectName projectManger status")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      totalProjects = await Project.countDocuments({ userId: parentUser._id });
    }
    const totalPages = Math.ceil(totalProjects / limit);
    res.status(200).json({
      message: "Projects fetched successfully",
      projects,
      totalProjects,
      currentPage: page,
      totalPages,
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

    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map((file) => file.filename);
      project.documents = newDocuments;
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
    const parentName=user.firstName+" "+user.secondName
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const groups = user.usersGroup.map(
      (group) => group.firstName + " " + group.secondName
    );
    res.status(200).json({
      message: "Groups fetched successfully",
      groups: [...groups,parentName],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching groups", error: error.message });
  }
};

const getProjectStatusSummary = async (req, res) => {
  try {
    const { _id } = req.user;

    const projectsForUser = await Project.find({ userId: _id }).populate(
      "contracts"
    );

    const totalProjectsForUser = projectsForUser.length;

    const projectsForUserCompleted = projectsForUser.filter(
      (project) => project.status === "Completed"
    ).length;

    const projectsForUserPlanning = projectsForUser.filter(
      (project) => project.status === "Planning"
    ).length;

    const projectsForUserProgress = projectsForUser.filter(
      (project) => project.status === "in Progress"
    ).length;

    const totalContractValueSum = projectsForUser.reduce((total, project) => {
      if (project.contracts && project.contracts.length > 0) {
        const contractValueSum = project.contracts.reduce(
          (sum, contract) => sum + (contract.totalContractValue || 0),
          0
        );
        return total + contractValueSum;
      }
      return total;
    }, 0);

    const precentage =
      projectsForUserCompleted +
        projectsForUserPlanning +
        projectsForUserProgress || 1;

    const countStatus = [
      {
        status: "Completed",
        count: projectsForUserCompleted,
        percentage: (projectsForUserCompleted / precentage) * 100,
      },
      {
        status: "Planning",
        count: projectsForUserPlanning,
        percentage: (projectsForUserPlanning / precentage) * 100,
      },
      {
        status: "in Progress",
        count: projectsForUserProgress,
        percentage: (projectsForUserProgress / precentage) * 100,
      },
    ];

    res.status(200).json({
      message: "Project status summary fetched successfully",
      totalProjectsForUser,
      totalContractValueSum,
      countStatus,
    });
  } catch (error) {
    console.error("Error fetching project status summary:", error);
    res.status(500).json({
      message: "Error fetching project status summary",
      error: error.message,
    });
  }
};

const searchProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { projectName, projectManger, status } = req.query;
    const query = { userId };
    const orConditions = [];

    if (projectName)
      orConditions.push({ projectName: new RegExp(projectName, "i") });
    if (projectManger)
      orConditions.push({ projectManger: new RegExp(projectManger, "i") });
    if (status) orConditions.push({ status: new RegExp(status, "i") });

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    const projects = await Project.find(query).lean();
    res.status(200).json({
      message: "Projects fetched successfully",
      data: projects,
    });
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
  getProjectStatusSummary,
  searchProjects,
};
