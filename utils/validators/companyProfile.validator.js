const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { check } = require("express-validator");
const CompanyProfile = require("../../models/companyProfile.model")

// Validation for getting a Company Profile by ID
exports.getCompanyProfileValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid ID format")
        .bail()
        .custom(async (value) => {
            // Check if the company profile exists
            const companyProfile = await CompanyProfile.findById(value);
            if (!companyProfile) {
                throw new Error("Company profile not found");
            }
        }),
    validatorMiddleware,
];
// Validation for getting a Company Profile by ID
exports.getCompanyProfileByUserIdValidator = [
    check("userId")
        .isMongoId()
        .withMessage("Invalid user ID format"),
    validatorMiddleware,
];

// Validation for creating a new Company Profile
exports.createCompanyProfileValidator = [
    check("companyName")
        .notEmpty()
        .withMessage("Company name is required.")
        .isLength({ max: 128 })
        .withMessage("Company name's length exceeds the limit of 128 characters."),
    check("companyType")
        .optional()
        .isIn(["Contractor", "Sub-Contractor"])
        .withMessage("Company type must be either 'Contractor' or 'Sub-Contractor'."),
    check("companyEmail")
        .optional()
        .isEmail()
        .withMessage("Invalid email format."),
    check("phone")
        .optional()
        .isMobilePhone()
        .withMessage("Invalid phone number."),
    check("website")
        .optional()
        .isURL()
        .withMessage("Invalid website URL."),
    check("taxId")
        .optional()
        .isLength({ max: 64 })
        .withMessage("Tax ID's length exceeds the limit of 64 characters."),
    validatorMiddleware,
];

// Validation for updating an existing Company Profile
exports.updateCompanyProfileValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid ID format")
        .bail()
        .custom(async (value) => {
            // Check if the company profile exists
            const companyProfile = await CompanyProfile.findById(value);
            if (!companyProfile) {
                throw new Error("Company profile not found");
            }
        }),
    check("companyName")
        .optional()
        .isLength({ max: 128 })
        .withMessage("Company name's length exceeds the limit of 128 characters."),
    check("companyType")
        .optional()
        .isIn(["Contractor", "Sub-Contractor"])
        .withMessage("Company type must be either 'Contractor' or 'Sub-Contractor'."),
    check("companyEmail")
        .optional()
        .isEmail()
        .withMessage("Invalid email format."),
    check("phone")
        .optional()
        .isMobilePhone()
        .withMessage("Invalid phone number."),
    check("website")
        .optional()
        .isURL()
        .withMessage("Invalid website URL."),
    check("taxId")
        .optional()
        .isLength({ max: 64 })
        .withMessage("Tax ID's length exceeds the limit of 64 characters."),
    validatorMiddleware,
];

// Validation for deleting a Company Profile by ID
exports.deleteCompanyProfileValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid ID format")
        .bail()
        .custom(async (value) => {
            // Check if the company profile exists
            const companyProfile = await CompanyProfile.findById(value);
            if (!companyProfile) {
                throw new Error("Company profile not found");
            }
        }),
    validatorMiddleware,
];
