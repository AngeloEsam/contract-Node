const express = require("express");
const { addDeduction, getDeductions } = require("../controllers/deductionController");
const { auth, restrictTo } = require("../middlewares/auth.js");
const router = express.Router();

router.post("/:contractId",auth, addDeduction);
router.get("/:contractId",auth, getDeductions);

module.exports = router;
