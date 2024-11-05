const express = require("express");
const {
  addAddition,
  getAdditions,
} = require("../controllers/additionController");
const { auth } = require("../middlewares/auth.js");

const router = express.Router();

router.post("/:contractId",auth, addAddition);
router.get("/:contractId",auth, getAdditions);

module.exports = router;
