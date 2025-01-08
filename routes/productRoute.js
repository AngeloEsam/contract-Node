const express = require("express");
const {
  getProducts,
  postProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductNames,
} = require("../controllers/productController");
const { auth } = require("../middlewares/auth");
const { getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator } = require("../utils/validators/productValidator")
const router = express.Router();

router.get("/", auth, getProducts);
router.post("/", auth, createProductValidator, postProduct);
router.get("/names", auth, getProductNames);
router.get("/:id", getProductValidator, getProduct)
router.put("/:id", updateProductValidator, updateProduct)
router.delete("/:id", deleteProductValidator, deleteProduct);

module.exports = router;
