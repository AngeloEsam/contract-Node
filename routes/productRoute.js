const express = require("express");
const {
  getProducts,
  postProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.route("/").get(getProducts).post(auth, postProduct);
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
