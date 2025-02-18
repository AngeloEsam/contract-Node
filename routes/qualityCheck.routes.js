const router = require("express").Router();
const multer = require("multer");
const {
  createQualityCheck,
  getAllQualityCheck,
  updateQualityCheck,
  deleteQualityCheck,
} = require("../controllers/qualityCheck.controller");

const {
  createQualityCheckValidator,
  getAllQualityCheckValidator,
  updateQualityCheckValidator,
  deleteQualityCheckValidator,
} = require("../utils/validators/qualityCheck.validator");
const storage = require("../middlewares/multerStorage");
const { auth } = require("../middlewares/auth");
// Multer
const upload = multer({ storage });
router
  .route("/")
  .get(auth, getAllQualityCheckValidator, getAllQualityCheck)
  .post(
    auth,
    upload.fields([{ name: "attachments", maxCount: 10 }]),
    createQualityCheckValidator,
    (req, res, next) => {
      if (req.body.tasks) {
        req.body.tasks = JSON.parse(req.body.tasks);
      }
      next();
    },
    createQualityCheck
  );

router
  .route("/:id")
  .put(
    auth,
    upload.fields([{ name: "attachments", maxCount: 10 }]),
    updateQualityCheckValidator,
    (req, res, next) => {
      if (req.body.tasks) {
        req.body.tasks = JSON.parse(req.body.tasks);
      }
      next();
    },
    updateQualityCheck
  )
  .delete(auth, deleteQualityCheckValidator, deleteQualityCheck);

module.exports = router;
