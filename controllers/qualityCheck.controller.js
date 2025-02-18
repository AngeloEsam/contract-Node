const QualityCheck = require("../models/qualityCheck.model");
const asyncHandler = require("express-async-handler");
const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");
const path = require("path");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const Image = require("../models/image.model");
/**
 * @desc    Get all the quality checks
 * @route   GET  /api/qualityCheck/
 * @access  User
 */
exports.getAllQualityCheck = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let filterQueries = { ...req.query };
  const executedQueries = ["page", "limit", "sort", "field"];
  executedQueries.forEach((field) => delete filterQueries[field]);

  // Get page, limit, and calculate skip value for pagination
  const page = Math.max(1, req.query.page * 1 || 1);
  const limit = Math.max(1, req.query.limit * 1 || 5);

  const skip = (page - 1) * limit;

  const qualityCheckItems = await QualityCheck.find({
    submittedBy: { $in: userId },
  });
  const qualityChecks = await QualityCheck.find({
    ...filterQueries,
    submittedBy: { $in: userId },
  })
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: "tasks",
        populate: { path: "assignee", select: "_id firstName secondName" },
      },
      { path: "projectId", select: "_id projectName" },
      { path: "qualityEngineer", select: "_id firstName secondName" },
      { path: "attachments" },
    ]);
  const inProgress = qualityCheckItems.filter(
    (item) => Number(item.status) === 1
  ).length;
  const itp = qualityCheckItems.reduce(
    (cp, cv) => Number(cp) + Number(cv.itp || 0),
    0
  );
  const openIssues = qualityCheckItems.filter((item) => item.reviewedBy).length;
  res.status(200).json({
    skip,
    limit,
    page,
    inProgress,
    openIssues: openIssues,
    averageItp: itp / qualityCheckItems.length,
    totalQualityCheck: qualityCheckItems.length || 0,
    results: qualityChecks.length,
    pages: Math.ceil(qualityCheckItems.length / limit),
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

    const attachmentsArr = req.files.attachments
      ? req.files.attachments.map((file) => ({
          filename: file.filename,
          type: file.mimetype,
          size: file.size,
          workItemId,
        }))
      : [];

    let attachments = [];
    if (attachmentsArr.length > 0) {
      attachments = await Image.insertMany(attachmentsArr);
    }
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
      attachments: attachments.map((attachment) => attachment._id),
      tasks: createdTasks.map((task) => task._id),
    });

    res.status(201).json(qualityCheck);
  } catch (error) {
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
    workItemId,
    oldAttachments,
    noteRelation,
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

  const oldQualityCheck = await QualityCheck.findById(id).populate(
    "attachments"
  );
  if (!oldQualityCheck) throw new ApiError("Quality Check not found!");

  const receivedAttachments =
    req.files && req.files.attachments && req.files.attachments.length > 0
      ? req.files.attachments.map((file) => ({
          filename: file.filename,
          type: file.mimetype,
          size: file.size,
        }))
      : [];
  const oldAttachmentFilenames = oldQualityCheck.attachments.map(
    (item) => item.filename
  );
  const deletedAttachments = oldAttachmentFilenames.filter(
    (filename) => !oldAttachments.includes(filename)
  );

  if (deletedAttachments.length > 0) {
    await Promise.all(
      deletedAttachments.map(async (filename) => {
        const oldAttachmentPath = path.join(__dirname, "../uploads", filename);

        if (fs.existsSync(oldAttachmentPath)) {
          fs.unlinkSync(oldAttachmentPath);
        }

        await Image.findOneAndDelete({ filename });
      })
    );
  }

  const newAttachments =
    receivedAttachments.length > 0
      ? await Image.insertMany(receivedAttachments)
      : [];

  const allAttachments = [
    ...oldQualityCheck.attachments.filter((item) =>
      oldAttachments.includes(item.filename)
    ),
    ...newAttachments,
  ];
  const updatedTasks = [];

  for (const task of tasks) {
    const existingTask = await Task.findById(task._id);

    if (existingTask) {
      await Task.updateOne({ _id: task._id }, task);
      updatedTasks.push(existingTask._id);
    } else {
      const newTask = await Task.create(task);
      updatedTasks.push(newTask._id);
    }
  }

  const updatedQualityCheck = await QualityCheck.findByIdAndUpdate(
    id,
    {
      isDraft,
      status,
      noteRelation,
      correctionStatus,
      category,
      repeatedIssue,
      assignedTo,
      qualityEngineer,
      itp,
      note,
      description,
      managerFeedback,
      attachments: allAttachments.map((item) => item._id),
      tasks: updatedTasks,
    },
    { new: true }
  );

  res.status(200).json(updatedQualityCheck);
});
/**
 * @desc    Delete a Quality Check
 * @route   DELETE  /api/qualityCheck/:id
 * @access  User
 */
exports.deleteQualityCheck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentQualityCheck = await QualityCheck.findById(id).populate(
    "attachments"
  );

  if (!currentQualityCheck) {
    throw new ApiError("Quality Check not found!", 404);
  }

  if (currentQualityCheck.tasks?.length > 0) {
    await Task.deleteMany({ _id: { $in: currentQualityCheck.tasks } });
  }

  if (currentQualityCheck.attachments?.length > 0) {
    currentQualityCheck.attachments.forEach((attachment) => {
      if (!attachment.filename) {
        console.warn("Attachment missing filename:", attachment._id);
        return;
      }

      const attachmentPath = path.join(
        __dirname,
        "../uploads",
        attachment.filename
      );
      if (fs.existsSync(attachmentPath)) {
        fs.unlinkSync(attachmentPath);
      }
    });

    await Image.deleteMany({
      _id: { $in: currentQualityCheck.attachments.map((a) => a._id) },
    });
  }

  await QualityCheck.findByIdAndDelete(id);

  res.status(204).send();
});
