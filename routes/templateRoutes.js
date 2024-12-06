const express = require("express");
const {
  saveTemplate,
  getTemplates,
  addTemplate,
} = require("../controllers/templateController");
const { auth } = require("../middlewares/auth");
const router = express.Router();
router.post("/save", auth, saveTemplate);
router.get("/", auth, getTemplates);
module.exports = router;
