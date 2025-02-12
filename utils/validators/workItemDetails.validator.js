const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { body, param, query } = require("express-validator");

exports.createWorkItemDetailsValidator = [
  param("id").isMongoId().withMessage("Invalid Work Item ID."),

  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string.")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty."),

  body("passed")
    .optional()
    .isBoolean()
    .withMessage("Passed must be a boolean value."),

  body("task").optional().isObject().withMessage("Task must be an object."),

  body("comment")
    .optional()
    .isObject()
    .withMessage("Comment must be an object."),

  query("image").optional().isString().withMessage("Image must be a string."),
  validatorMiddleware,
];
exports.updateWorkItemDetailsValidator = [
  param("id").isMongoId().withMessage("Invalid Work Item ID."),

  body("task").optional().isObject().withMessage("Task must be an object."),

  body("comment")
    .optional()
    .isObject()
    .withMessage("Comment must be an object."),

  query("image")
    .optional()
    .isString()
    .withMessage("Image filename must be a string."),

  query("task")
    .optional()
    .isMongoId()
    .withMessage("Task ID must be a valid MongoDB ObjectId."),

  query("progress")
    .optional()
    .isNumeric()
    .withMessage("Progress must be a number."),

  query("comment")
    .optional()
    .isMongoId()
    .withMessage("Comment ID must be a valid MongoDB ObjectId."),
  validatorMiddleware,
];

exports.deleteWorkItemDetailsValidator = [
  param("id").isMongoId().withMessage("Invalid Work Item ID."),

  query("qcPointId").optional().isMongoId().withMessage("Invalid QC Point ID."),

  query("task").optional().isMongoId().withMessage("Invalid Task ID."),

  query("comment").optional().isMongoId().withMessage("Invalid Comment ID."),

  query("image")
    .optional()
    .isString()
    .withMessage("Image filename must be a string."),

  query("document").optional().isMongoId().withMessage("Invalid Document ID."),
  validatorMiddleware,
];
