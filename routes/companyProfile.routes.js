const express = require("express")
const router = express.Router()

const { getCompanyProfiles, createCompanyProfile, getCompanyProfile, updateCompanyProfile, deleteCompanyProfile, getCompanyProfileByUserId } = require("../controllers/companyProfile.controller")
const { auth, restrictTo } = require("../middlewares/auth.js");
const { getCompanyProfileValidator, createCompanyProfileValidator, updateCompanyProfileValidator, deleteCompanyProfileValidator, getCompanyProfileByUserIdValidator } = require("../utils/validators/companyProfile.validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../companyProfileImages");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

router.route("/")
    .get(auth, restrictTo("Admin"), getCompanyProfiles)
    .post(auth, restrictTo("Admin", "User"), createCompanyProfileValidator, upload.single("logo"), createCompanyProfile)
router.route("/:id")
    .get(auth, getCompanyProfileValidator, getCompanyProfile)
    .put(auth, updateCompanyProfileValidator, upload.single("logo"), updateCompanyProfile)
    .delete(auth, deleteCompanyProfileValidator, deleteCompanyProfile)
router.route("/:userId/user")
    .get(auth, getCompanyProfileByUserIdValidator, getCompanyProfileByUserId)

module.exports = router