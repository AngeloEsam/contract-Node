const mongoose = require("mongoose");

const WorkItemSchema = new mongoose.Schema({
  workItemName: { type: String, required: true },
  workDetails: { type: Object },
  documents: [{
    title: { type: String },
    size: { type: Number },
    type: { type: String },
  }],
  images: [{ type: String, unique: true }],
  QC_Point: [
    {
      title: String,
      passed: { type: Boolean, default: false },
      QC_PointDate: { type: Date, default: Date.now() },
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Work", WorkItemSchema);
