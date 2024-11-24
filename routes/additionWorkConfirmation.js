const express = require("express");

const { auth } = require("../middlewares/auth.js");
const {
  addAdditionWorkConfirmation,
  getAdditionsWorkConfirmation,
} = require("../controllers/additionWorkConfirmation.js");

const router = express.Router();

router.post("/:workConfirmationId", auth, addAdditionWorkConfirmation);
router.get("/:workConfirmationId", auth, getAdditionsWorkConfirmation);

module.exports = router;
