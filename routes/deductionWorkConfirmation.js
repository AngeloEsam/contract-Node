const express = require("express");

const { auth } = require("../middlewares/auth.js");
const {
  deductionWorkConfirmation,
  getdeductionsWorkConfirmation,
} = require("../controllers/deductionWorkConfirmation.js");

const router = express.Router();

router.post("/:workConfirmationId", auth, deductionWorkConfirmation);
router.get("/:workConfirmationId", auth, getdeductionsWorkConfirmation);

module.exports = router;
