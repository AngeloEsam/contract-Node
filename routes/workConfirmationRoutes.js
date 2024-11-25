const express = require("express");
const router = express.Router();
const {
  createWorkConfirmation,
  getAllWorkConfirmation,
  getSingleWorkConfirmation,
  deleteWorkConfirmation,
  updateWorkConfirmation,
} = require("../controllers/workConfirmationController");
const { auth } = require("../middlewares/auth");

router.post("/create", auth, createWorkConfirmation);
router.get("/", auth, getAllWorkConfirmation);
router.get("/:id", auth, getSingleWorkConfirmation);
router.delete("/:id", auth, deleteWorkConfirmation);
router.put("/:id", auth, updateWorkConfirmation);
module.exports = router;
