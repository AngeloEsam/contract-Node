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
  searchWorkConfirmation,
  getWorkConfirmationByProjectId,
  getWorkConfirmationsByContractId
} = require("../controllers/workConfirmationController");
const { getWorkConfirmationByProjectIdValidator } = require("../utils/validators/project.validator");
const { getWorkConfirmationByContractIdValidator } = require("../utils/validators/workConfirmation.validator");
const { auth } = require("../middlewares/auth");



// Routes
router.post("/create", auth, createWorkConfirmation);
router.get("/", auth, getAllWorkConfirmation);
router.get("/search/:workConfirmationId", auth, searchByWorkItemName);
router.get("/search/find", auth, searchWorkConfirmation);
router.get("/:id", auth, getSingleWorkConfirmation);
router.get("/:projectId/project", auth, getWorkConfirmationByProjectIdValidator, getWorkConfirmationByProjectId);
router.delete("/:id", auth, deleteWorkConfirmation);
router.put("/:id", auth, updateWorkConfirmation);
router.put(
  "/workConfirmation/:workConfirmationId/:id",
  auth,
  updateWorkConfirmationBaseOnWorkItem
);
// get workConfirmations by contractId
router.get("/:contractId/contract", auth, getWorkConfirmationByContractIdValidator, getWorkConfirmationsByContractId)
module.exports = router;
