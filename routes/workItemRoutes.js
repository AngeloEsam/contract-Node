const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  addWorkDetailsItem,
  getAllWorkItems,
  getSingleWorkItem,
  updateWorkItem,
  deleteWork,
  insertSheet,
  getWorkItemTotals,
  addSingleBoq,
  getWorkItemsForContract,
  getWorkItemsNameForContract,
  createWorkItemDetails,
  deleteWorkItemDetails,
  updateWorkItemDetails,
} = require("../controllers/workItemController");
const { auth } = require("../middlewares/auth");
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../excelFiles");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
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
const excelUpload = multer({ storage: excelStorage });
// Multer file filter with enhanced error handling
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    try {
      if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("application/")
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only image and document files are allowed!"), false);
      }
    } catch (error) {
      cb(error, false);
    }
  },
});
const router = express.Router();

// Multer field configuration
const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "documents", maxCount: 3 },
]);

router.post("/boq/:contractId", auth, addSingleBoq);
router.post("/:userId", addWorkDetailsItem);
router.post(
  "/sheet/:contractId",
  auth,
  excelUpload.single("file"),
  insertSheet
);
router.get("/", auth, getAllWorkItems);
router.get("/:contractId", auth, getWorkItemsForContract);
router.get("/names/:contractId", auth, getWorkItemsNameForContract);
router.get("/total/:userId", getWorkItemTotals);
router.get("/:id", getSingleWorkItem);
router.put("/:id", updateWorkItem);
router.delete("/:id", auth, deleteWork);
router.post("/:id/details", auth, uploadFields, createWorkItemDetails);
router.put("/:id/details", auth, upload.single("image"), updateWorkItemDetails);
router.delete("/:id/details", auth, uploadFields, deleteWorkItemDetails);
//router.delete("/boq/:contractId/:mainItemId", auth, deleteBoq);

module.exports = router;
