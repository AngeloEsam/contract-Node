const express = require("express");
const router = express.Router();
const {
  createWorkConfirmation,
  getAllWorkConfirmation,
  getSingleWorkConfirmation,
  deleteWorkConfirmation,
  updateWorkConfirmation,
  updateWorkConfirmationBaseOnWorkItem,
  searchByWorkItemName,
  searchWorkConfirmation,
  getWorkConfirmationByProjectId,
  deleteWorkItemDetails,
  updateWorkConfirmationBaseOnWorkItemDetails
} = require("../controllers/workConfirmationController");
const { getWorkConfirmationByProjectIdValidator } = require("../utils/validators/project.validator");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, "../uploads"); // Use path.resolve for OS compatibility
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Multer file filter with enhanced error handling
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    try {
      if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("application/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image and document files are allowed!"), false);
      }
    } catch (error) {
      cb(error, false);
    }
  },
});

// Multer field configuration
const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "documents", maxCount: 3 },
]);

// Routes
router.post("/create", auth, createWorkConfirmation);
router.get("/", auth, getAllWorkConfirmation);
router.get("/search/:workConfirmationId", auth, searchByWorkItemName);
router.get("/search/find", auth, searchWorkConfirmation);
router.get("/:id", auth, getSingleWorkConfirmation);
router.get("/:projectId/project", auth, getWorkConfirmationByProjectIdValidator, getWorkConfirmationByProjectId);
router.delete("/:id", auth, deleteWorkConfirmation);
router.put("/:id", auth, updateWorkConfirmation);
router.put(
  "/workConfirmation/:workConfirmationId/:id",
  auth,
  updateWorkConfirmationBaseOnWorkItem
);
router.put(
  "/workConfirmation/:workConfirmationId/:id/details",
  auth, uploadFields,
  updateWorkConfirmationBaseOnWorkItemDetails
);
router.delete(
  "/workConfirmation/:workConfirmationId/:id/details",
  auth,
  deleteWorkItemDetails
);

module.exports = router;
