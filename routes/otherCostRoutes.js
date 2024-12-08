const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { auth } = require("../middlewares/auth");
const {
  addOtherCost,
  getAllOtherCosts,
  getSingleOtherCost,
  deleteOtherCost,
  getAllOtherCostsNames,
} = require("../controllers/otherCostController");
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

router.post("/", auth, addOtherCost);
router.get("/", auth, getAllOtherCosts);
router.get("/names", auth, getAllOtherCostsNames);
router.get("/:otherCostId", auth, getSingleOtherCost);
router.delete("/:otherCostId", auth, deleteOtherCost);

module.exports = router;
