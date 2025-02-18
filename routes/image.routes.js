const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const storage = require("../middlewares/multerStorage");
const {
  createImage,
  getAllImages,
  updateImage,
  deleteImage,
} = require("../controllers/image.controller");
const {
  validateGetAllImages,
  validateUpdateImage,
  validateDeleteImage,
} = require("../utils/validators/image.validator");
const multer = require("multer");
const upload = multer({ storage });
router
  .route("/")
  .get(auth, validateGetAllImages, getAllImages)
  .post(auth, upload.fields([{ name: "images", maxCount: 10 }]), createImage);
router
  .route("/:id")
  .put(auth, validateUpdateImage, upload.single("image"), updateImage)
  .delete(auth, validateDeleteImage, deleteImage);
module.exports = router;
