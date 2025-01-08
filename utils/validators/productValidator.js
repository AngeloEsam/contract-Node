const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { check } = require("express-validator");

exports.getProductValidator = [
    check("id")
        .isMongoId()
        .withMessage("Product ID isn't valid."),
    validatorMiddleware,
];

exports.createProductValidator = [
    check("sku")
        .notEmpty()
        .withMessage("Sku is required")
        .isLength({ max: 32 })
        .withMessage("Sku's length exceeds the limit of 32 characters."),
    check("uom")
        .notEmpty()
        .withMessage("Uom is required")
        .isLength({ max: 32 })
        .withMessage("Uom's length exceeds the limit of 32 characters."),
    check("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name's too short. Minimum 3 characters required.")
        .isLength({ max: 64 })
        .withMessage("Name's too long. Maximum 64 characters allowed."),
    check("slug")
        .notEmpty()
        .withMessage("Slug is required")
        .isLowercase()
        .withMessage("Slug must be lowercase.")
        .isLength({ max: 64 })
        .withMessage("Slug's length exceeds the limit of 64 characters."),
    check("category")
        .notEmpty()
        .withMessage("Category ID is required")
        .isMongoId()
        .withMessage("Category ID must be a valid Mongo ID."),
    check("price")
        .notEmpty()
        .withMessage("Price is required")
        .isNumeric()
        .withMessage("Price must be a numeric value")
        .isFloat({ min: 0.1 })
        .withMessage("Price must be greater than 0."),
    check("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 0 })
        .withMessage("Quantity cannot be negative."),
    check("supplier")
        .notEmpty()
        .withMessage("Supplier is required")
        .isLength({ max: 64 })
        .withMessage("Supplier's name is too long. Maximum 64 characters allowed."),
    check("description")
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 256 })
        .withMessage("Description's length exceeds the limit of 256 characters."),
    validatorMiddleware,
];

exports.updateProductValidator = [
    check("id")
        .isMongoId()
        .withMessage("Product ID isn't valid."),
    check("price")
        .optional()
        .isNumeric()
        .withMessage("Price must be a numeric value")
        .isFloat({ min: 0.1 })
        .withMessage("Price must be greater than 0."),
    check("quantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Quantity cannot be negative."),
    check("name")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Name's too short. Minimum 3 characters required.")
        .isLength({ max: 64 })
        .withMessage("Name's too long. Maximum 64 characters allowed."),
    validatorMiddleware,
];

exports.deleteProductValidator = [
    check("id")
        .isMongoId()
        .withMessage("Product ID isn't valid."),
    validatorMiddleware,
];
