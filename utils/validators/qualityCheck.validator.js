const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createQualityCheckValidator = [
  check("isDraft")
    .optional()
    .isBoolean()
    .withMessage("isDraft must be a boolean"),
  check("contractId")
    .notEmpty()
    .withMessage("contractId is required")
    .isMongoId()
    .withMessage("Invalid contractId"),
  check("projectId")
    .notEmpty()
    .withMessage("projectId is required")
    .isMongoId()
    .withMessage("Invalid projectId"),
  check("workItemId").optional().isMongoId().withMessage("Invalid workItemId"),
  check("tasks").optional().isArray().withMessage("tasks must be an array"),
  check("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignedTo ID"),
  check("qualityEngineer")
    .optional()
    .isMongoId()
    .withMessage("Invalid qualityEngineer ID"),
  check("note").isString().withMessage("note must be a string"),
  check("description")
    .notEmpty()
    .withMessage("description is required")
    .isString()
    .withMessage("description must be a string"),
  check("managerFeedback")
    .optional()
    .isString()
    .withMessage("managerFeedback must be a string"),
  validatorMiddleware,
];

exports.getAllQualityCheckValidator = [
  check("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  check("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  validatorMiddleware,
];

exports.updateQualityCheckValidator = [
  param("id").isMongoId().withMessage("Invalid Quality Check ID"),
  check("isDraft")
    .optional()
    .isBoolean()
    .withMessage("isDraft must be a boolean"),
  check("contractId")
    .notEmpty()
    .withMessage("contractId is required")
    .isMongoId()
    .withMessage("Invalid contractId"),
  check("projectId")
    .notEmpty()
    .withMessage("projectId is required")
    .isMongoId()
    .withMessage("Invalid projectId"),
  check("workItemId").optional().isMongoId().withMessage("Invalid workItemId"),
  check("tasks").optional().isArray().withMessage("tasks must be an array"),
  check("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assignedTo ID"),
  check("qualityEngineer")
    .optional()
    .isMongoId()
    .withMessage("Invalid qualityEngineer ID"),
  check("note").isString().withMessage("note must be a string"),
  check("description")
    .notEmpty()
    .withMessage("description is required")
    .isString()
    .withMessage("description must be a string"),
  check("managerFeedback")
    .optional()
    .isString()
    .withMessage("managerFeedback must be a string"),
  validatorMiddleware,
];

exports.deleteQualityCheckValidator = [
  param("id").isMongoId().withMessage("Invalid Quality Check ID"),
  validatorMiddleware,
];
