const { isMongoId } = require("validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { body, check } = require("express-validator");

exports.addTaskValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
  body("assignee")
    .notEmpty()
    .withMessage("Assignee is required")
    .isMongoId()
    .withMessage("Invalid Assignee ID"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("status")
    .optional()
    .isIn(["To Do", "In Progress", "Review", "Completed"])
    .withMessage("Invalid status value"),
  body("priority")
    .optional()
    .isIn(["Critical", "High", "Medium", "Low"])
    .withMessage("Invalid priority value"),
  body("progress")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be an integer between 0 and 100"),
  body("image").optional().isString().withMessage("Image must be a string"),
  //   body("QC_Point")
  //     .optional()
  //     .isString()
  //     .withMessage("QC_Point must be a string"),
  body("workItemId")
    .notEmpty()
    .withMessage("Work item ID is required")
    .isMongoId()
    .withMessage("Invalid work item ID"),
  validatorMiddleware,
];
exports.updateTaskValidation = [
  check("id").isMongoId().withMessage("Task ID is required."),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
  body("assignee")
    .notEmpty()
    .withMessage("Assignee is required")
    .isMongoId()
    .withMessage("Invalid Assignee ID"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("status")
    .optional()
    .isIn(["To Do", "In Progress", "Review", "Completed"])
    .withMessage("Invalid status value"),
  body("priority")
    .optional()
    .isIn(["Critical", "High", "Medium", "Low"])
    .withMessage("Invalid priority value"),
  body("progress")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be an integer between 0 and 100"),
  body("image").optional().isString().withMessage("Image must be a string"),
  //   body("QC_Point")
  //     .optional()
  //     .isString()
  //     .withMessage("QC_Point must be a string"),
  body("workItemId")
    .notEmpty()
    .withMessage("Work item ID is required")
    .isMongoId()
    .withMessage("Invalid work item ID"),
  validatorMiddleware,
];
exports.deleteTaskValidation = [
  check("id").isMongoId().withMessage("Task ID is required."),
  validatorMiddleware,
];
exports.getTasksByWorkItemValidation = [
  check("workItem").isMongoId().withMessage("Invalid work item ID."),
  validatorMiddleware,
];
exports.updateProgressTaskValidation = [
  check("id").isMongoId().withMessage("Task ID is required."),
  body("progress")
    .notEmpty()
    .withMessage("Progress is required")
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be an integer between 0 and 100"),
  validatorMiddleware,
];
