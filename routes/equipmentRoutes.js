const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { auth } = require("../middlewares/auth");
const {
  addEquipment,
  getAllEquipments,
  getSingleEquipment,
  deleteEquipment,
} = require("../controllers/equipmentController");
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

router.post("/", auth, addEquipment);
router.get("/", auth, getAllEquipments);
router.get("/:equipmentId", auth, getSingleEquipment);
router.delete("/:equipmentId", auth, deleteEquipment);

module.exports = router;
