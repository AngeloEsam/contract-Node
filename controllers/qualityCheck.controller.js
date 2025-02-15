const QualityCheck = require("../models/qualityCheck.model");
const asyncHandler = require("express-async-handler");
const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");
const path = require("path");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
/**
 * @desc    Get all the quality checks
 * @route   GET  /api/qualityCheck/
 * @access  User
 */
exports.getAllQualityCheck = asyncHandler(async (req, res) => {
  let filterQueries = { ...req.query };
  const executedQueries = ["page", "limit", "sort", "field"];
  executedQueries.forEach((field) => delete filterQueries[field]);

  // Get page, limit, and calculate skip value for pagination
  const page = Math.max(1, req.query.page * 1 || 1);
  const limit = Math.max(1, req.query.limit * 1 || 5);

  const skip = (page - 1) * limit;

  // Get the total number of Quality Checks based on filter queries
  const totalQualityCheck = await QualityCheck.countDocuments(filterQueries);
  const qualityChecks = await QualityCheck.find(filterQueries)
    .skip(skip)
    .limit(limit)
    .populate("tasks");
  res.status(200).json({
    skip,
    limit,
    page,
    results: qualityChecks.length,
    pages: Math.ceil(totalQualityCheck / limit),
    qualityChecks: qualityChecks,
  });
});
/**
 * @desc    Create a new Quality Check
 * @route   POST  /api/qualityCheck/
 * @access  User
 */
exports.createQualityCheck = asyncHandler(async (req, res) => {
  try {
    let {
      isDraft,
      status,
      noteRelation,
      contractId,
      projectId,
      workItemId,
      correctionStatus,
      category,
      repeatedIssue,
      assignedTo,
      qualityEngineer,
      itp,
      note,
      description,
      managerFeedback,
      tasks,
    } = req.body;

    const attachments = req.files
      ? req.files.map((file) => ({ filename: file.filename }))
      : [];
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!workItemId) {
      return res.status(400).json({ message: "workItemId is required" });
    }

    let createdTasks = [];
    if (tasks && tasks.length > 0) {
      tasks = tasks.map((task) => {
        if (task.assignee) {
          task.assignee = task.assignee.split(",")[1].trim();
          // Validate ObjectId
          if (!mongoose.Types.ObjectId.isValid(task.assignee)) {
            console.error(`Invalid ObjectId: ${task.name}`);
            throw new Error(`Invalid ObjectId: ${task.name}`);
          }
        }
        return task;
      });

      createdTasks = await Task.insertMany(tasks);
    }

    const qualityCheck = await QualityCheck.create({
      submittedBy: userId,
      isDraft,
      status,
      noteRelation,
      contractId,
      projectId,
      workItemId,
      correctionStatus,
      category,
      repeatedIssue,
      assignedTo,
      qualityEngineer,
      itp,
      note,
      description,
      managerFeedback,
      attachments,
      tasks: createdTasks.map((task) => task._id),
    });

    res.status(201).json(qualityCheck);
  } catch (error) {
    console.error("Error creating QualityCheck:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Edit a Quality Check
 * @route   PUT  /api/qualityCheck/:id
 * @access  User
 */
exports.updateQualityCheck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let {
    isDraft,
    status,
    noteRelation,
    contractId,
    projectId,
    workItemId,
    correctionStatus,
    category,
    repeatedIssue,
    assignedTo,
    qualityEngineer,
    itp,
    note,
    description,
    managerFeedback,
    tasks,
  } = req.body;
  const attachments =
    req.files && Array.isArray(req.files)
      ? req.files.map((file) => ({ filename: file.filename }))
      : [];
  const qualityCheck = await QualityCheck.findById(id);
  if (!qualityCheck) throw new ApiError("Quality Check not found!");
  let updatedTasks = qualityCheck.tasks;
  tasks = tasks.map((task) => (task.assignee = task.assignee.split(",")[1]));
  if (tasks && tasks.length > 0) {
    tasks = tasks.map((task) => {
      if (task.assignee) {
        task.assignee = task.assignee.split(",")[1].trim();
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(task.assignee)) {
          console.error(`Invalid ObjectId: ${task.name}`);
          throw new Error(`Invalid ObjectId: ${task.name}`);
        }
      }
      return task;
    });
    const newTasks = await Task.insertMany(tasks);
    updatedTasks = [...updatedTasks, ...newTasks.map((task) => task._id)];
  }
  const updatedQualityCheck = await QualityCheck.findByIdAndUpdate(
    id,
    {
      isDraft,
      status,
      noteRelation,
      contractId,
      projectId,
      workItemId,
      correctionStatus,
      category,
      repeatedIssue,
      assignedTo,
      qualityEngineer,
      itp,
      note,
      description,
      managerFeedback,
      attachments,
      tasks: updatedTasks.map((task) => task._id),
    },
    { new: true }
  );
  res.status(200).json(updatedQualityCheck);
});
/**
 * @desc    Delete a Quality Check
 * @route   DELETE  /api/qualityCheck/
 * @access  User
 */
exports.deleteQualityCheck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentQualityCheck = await QualityCheck.findById(id);
  if (!currentQualityCheck) throw new ApiError("Quality Check not found!");
  if (currentQualityCheck.tasks && currentQualityCheck.tasks.length) {
    await Task.deleteMany({ _id: { $in: currentQualityCheck.tasks } });
  }
  if (
    currentQualityCheck.attachments &&
    currentQualityCheck.attachments.length > 0
  ) {
    currentQualityCheck.attachments.map((attachment) => {
      const attachmentPath = path.join(
        __dirname,
        "../uploads",
        attachment.filename
      );
      if (fs.existsSync(attachmentPath)) {
        fs.unlinkSync(attachmentPath);
      }
    });
  }
  await QualityCheck.findByIdAndDelete(id);
  res.status(204).send();
});
