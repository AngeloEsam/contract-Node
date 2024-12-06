const express = require("express");
const router = express.Router();
const {
  createWorkConfirmation,
  getAllWorkConfirmation,
  getSingleWorkConfirmation,
  deleteWorkConfirmation,
  updateWorkConfirmation,
  updateWorkConfirmationBaseOnWorkItem,
  searchByWorkItemName,
} = require("../controllers/workConfirmationController");
const { auth } = require("../middlewares/auth");

router.post("/create", auth, createWorkConfirmation);
router.get("/", auth, getAllWorkConfirmation);
router.get("/search", auth, searchByWorkItemName);
router.get("/:id", auth, getSingleWorkConfirmation);
router.delete("/:id", auth, deleteWorkConfirmation);
router.put("/:id", auth, updateWorkConfirmation);
router.put(
  "/workConfirmation/:workConfirmationId/:id",
  auth,
  updateWorkConfirmationBaseOnWorkItem
);
module.exports = router;
