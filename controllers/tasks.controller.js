const asyncHandler = require("express-async-handler");
const Task = require("../models/task.model");

/**
 * @desc    Get all tasks for user
 * @route   GET     /api/tasks
 * @access  User
 */
exports.getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.status(200).json(tasks);
});

/**
 * @desc    Add a task
 * @route   POST /api/tasks
 * @access  User
 */
exports.addTask = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    assignee,
    priority,
    status,
    startDate,
    endDate,
    image,
    workItemId,
    // QC_Point,
  } = req.body;
  const task = await Task.create({
    name,
    description,
    assignee,
    priority,
    status,
    startDate,
    endDate,
    image,
    workItemId,
    // QC_Point,
    userId: req.user._id,
  });
  res.status(201).json(task);
});

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  User
 */
exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    assignee,
    workItemId,
    priority,
    status,
    startDate,
    endDate,
    image,
  } = req.body;
  const task = await Task.findByIdAndUpdate(
    id,
    {
      name,
      description,
      assignee,
      workItemId,
      priority,
      status,
      startDate,
      endDate,
      image,
    },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.status(200).json(task);
});
/**
 * @desc    Update progress task
 * @route   PUT /api/tasks/:id/progress
 * @access  User
 */
exports.updateProgressTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  const task = await Task.findByIdAndUpdate(
    id,
    {
      progress,
    },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.status(200).json(task);
});
/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  User
 *
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.status(200).json({ message: "Task deleted successfully" });
});

/**
 * @desc    Get tasks for a specific workItem
 * @route   GET /api/tasks/:workItem
 * @access  User
 */
exports.getTasksByWorkItem = asyncHandler(async (req, res) => {
  const { workItem } = req.params;
  const tasks = await Task.find({ workItemId: workItem }).populate("assignee");
  res.status(200).json(tasks);
});
