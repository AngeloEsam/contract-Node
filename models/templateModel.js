const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    mainId: { type: mongoose.Schema.Types.ObjectId, ref: "Main" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    relevantProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
