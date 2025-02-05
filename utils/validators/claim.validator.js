const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { check } = require("express-validator");

exports.addClaimOnContractValidator = [
  check("contractId").isMongoId().withMessage("Invalid contract ID."),
  check("value").isEmpty().withMessage("Value is required."),
  validatorMiddleware,
];
exports.deleteClaimOnContractValidator = [
  check("contractId").isMongoId().withMessage("Invalid contract ID."),
  check("claimId").isMongoId().withMessage("Invalid contract ID."),
  validatorMiddleware,
];
