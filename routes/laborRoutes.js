const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { auth } = require("../middlewares/auth");
const {
  addLabor,
  getAllLabors,
  getSingleLabor,
  deleteLabor,
  getAllLaborNames,
} = require("../controllers/laborController");
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

router.post("/", auth, addLabor);
router.get("/", auth, getAllLabors);
router.get("/names", auth, getAllLaborNames);
router.get("/:laborId", auth, getSingleLabor);
router.delete("/:laborId", auth, deleteLabor);

module.exports = router;
