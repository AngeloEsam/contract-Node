const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { check } = require("express-validator");

exports.getAllMaterialsByBoqLineItemIdValidator = [
    check("boqLineItemId")
        .isMongoId()
        .withMessage("Boq line item ID isn't valid."),
    validatorMiddleware,
];