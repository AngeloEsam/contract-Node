const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getWorkConfirmationByProjectIdValidator = [
    check("projectId").isMongoId().withMessage("Invalid project ID."),
    validatorMiddleware
]