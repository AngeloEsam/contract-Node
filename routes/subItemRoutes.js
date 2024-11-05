const express = require("express");
const {
  addSubItem,
  getAllSubItems,
  searchSubItem,
  getSingleSubItem,
  updateSubItem,
  deleteSub,
} = require("../controllers/subItemController");
const router = express.Router();

router.post("/", addSubItem);
router.get("/", getAllSubItems);
router.get("/:id", getSingleSubItem);
router.put("/:id", updateSubItem);
router.delete("/:id", deleteSub);

module.exports = router;
