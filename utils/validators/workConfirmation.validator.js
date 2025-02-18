const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const workConfirmationModel = require("../../models/workConfirmationModel");

exports.getWorkConfirmationByContractIdValidator = [
    check("contractId")
        .isMongoId()
        .withMessage("Invalid contract ID.")
        .custom(async (value) => {
            const existsConfirmations = await workConfirmationModel.find({ contractId: { $in: value } })
            if (existsConfirmations.length === 0) {
                throw new Error("No work confirmations found for this contract ID.")
            }
        }),
    validatorMiddleware
]