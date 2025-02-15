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
    createQualityCheckValidator,
    upload.array("attachments"),
    createQualityCheck
  );

router
  .route("/:id")
  .put(
    auth,
    updateQualityCheckValidator,
    upload.array("attachments"),
    updateQualityCheck
  )
  .delete(auth, deleteQualityCheckValidator, deleteQualityCheck);

module.exports = router;
