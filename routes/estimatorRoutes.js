const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { auth } = require("../middlewares/auth");
const { createEstimator, getAllEstimator, getTotalFromMaterial, deleteEstimator, getSingleEstimator } = require("../controllers/estimatorController");
const storage = multer.diskStorage({
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
const upload = multer({ storage: storage });
const router = express.Router();

router.post("/", auth, createEstimator);
router.get("/", auth, getAllEstimator);
router.get("/:estimatorId",auth, getSingleEstimator);
router.get("/total/:estimatorId", auth, getTotalFromMaterial);
router.delete("/:estimatorId",auth, deleteEstimator);
module.exports = router;
