const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { auth } = require("../middlewares/auth");
const {
  addMaterial,
  getAllMaterials,
  getSingleMaterial,
  deleteMaterial,
  calculateSalesAndTax,
  getAllByCategory,
  insertMaterial,
  getAllByCategoryNames,
} = require("../controllers/materialController");
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

router.post("/", auth, addMaterial);
router.post("/:estimatorId", auth, upload.single("file"), insertMaterial);
router.get("/", auth, getAllMaterials);
router.get("/:category/:estimatorId", auth, getAllByCategory);
router.get("/names/:category", auth, getAllByCategoryNames);
router.get("/single/:materialId", auth, getSingleMaterial);
router.delete("/:materialId", auth, deleteMaterial);
router.put("/calculate", auth, calculateSalesAndTax);

module.exports = router;
