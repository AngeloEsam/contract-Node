const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
  getTasksByWorkItem,
  updateProgressTask
} = require("../controllers/tasks.controller");
const {
  addTaskValidation,
  updateTaskValidation,
  deleteTaskValidation,
  getTasksByWorkItemValidation,
  updateProgressTaskValidation,
} = require("../utils/validators/tasks.validator");
const router = express.Router();

router.route("/").get(auth, getAllTasks).post(auth, addTaskValidation, addTask);
router
  .route("/:id")
  .put(auth, updateTaskValidation, updateTask)
  .delete(auth, deleteTaskValidation, deleteTask);
router.get(
  "/:workItem",
  auth,
  getTasksByWorkItemValidation,
  getTasksByWorkItem
);
router.put(
  "/:id/progress",
  auth,
  updateProgressTaskValidation,
  updateProgressTask
);
module.exports = router;
