const express = require("express");
const router = express.Router();
const {
  createWorkConfirmation,
  getAllWorkConfirmation,
  getSingleWorkConfirmation,
  deleteWorkConfirmation,
} = require("../controllers/workConfirmationController");
const { auth } = require("../middlewares/auth");

router.post("/create", auth, createWorkConfirmation);
router.get("/", auth, getAllWorkConfirmation);
router.get("/:id", auth, getSingleWorkConfirmation);
router.delete("/:id", auth, deleteWorkConfirmation);

module.exports = router;
