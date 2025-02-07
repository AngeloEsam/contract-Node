const mongoose = require("mongoose");

const WorkItemSchema = new mongoose.Schema({
  workItemName: { type: String, required: true },
  workDetails: { type: Object },
  documents: [
    {
      title: { type: String },
      size: { type: Number },
      type: { type: String },
    },
  ],
  images: [{ type: String, unique: true }],
  QC_Point: [
    {
      title: String,
      passed: { type: Boolean, default: false },
      QC_PointDate: { type: Date, default: Date.now() },
    },
  ],
  tasks: [
    {
      name: { type: String, required: true },
      description: String,
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      status: {
        type: String,
        enum: ["To Do", "In Progress", "Review", "Completed"],
        default: "In Progress",
      },
      priority: {
        type: String,
        enum: ["Critical", "High", "Medium", "Low"],
        default: "Low",
      },
      progress: { type: Number, default: 0 },
    },
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Work", WorkItemSchema);
