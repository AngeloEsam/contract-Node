const { param, query } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const validateCreateImage = [
  query("workItemId")
    .optional()
    .isMongoId()
    .withMessage("Invalid work item ID"),
  validatorMiddleware,
];
const validateGetAllImages = [
  query("workItemId")
    .optional()
    .isMongoId()
    .withMessage("Invalid work item ID"),
  validatorMiddleware,
];

const validateUpdateImage = [
  param("id").isMongoId().withMessage("Invalid image ID"),
  validatorMiddleware,
];

const validateDeleteImage = [
  param("id").isMongoId().withMessage("Invalid image ID"),
  validatorMiddleware,
];

module.exports = {
  validateGetAllImages,
  validateUpdateImage,
  validateDeleteImage,
  validateCreateImage,
};
