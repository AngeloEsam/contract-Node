const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QualityCheck = new Schema({
  isDraft: { type: Boolean, default: false },
  status: {
    type: String,
    enum: [1, 2, 3, 4], // 1: created 2: in-progress 3: under-review 4: closed
    default: 2,
  },
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  submittedDate: { type: Date, default: Date.now() },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedDate: { type: Date },
  closedBy: { type: Schema.Types.ObjectId, ref: "User" },
  closedDate: { type: Date },
  contractId: { type: Schema.Types.ObjectId, ref: "Contract" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  workItemId: { type: Schema.Types.ObjectId, ref: "WorkItem" },
  noteRelation: {
    type: String,
    enum: ["execution", "procedure"],
    required: true,
  },
  correctionStatus: {
    type: String,
    enum: ["ncr-released", "ncr-not-released", "other"],
    required: true,
  },
  category: {
    type: String,
    enum: ["architecture", "civil", "electrical", "mechanical"],
    required: true,
  },
  repeatedIssue: { type: String, enum: ["no", "yes"], required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  qualityEngineer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  itp: { type: String, required: true },
  note: { type: String },
  description: { type: String, required: true },
  managerFeedback: { type: String },
  attachments: [
    {
      filename: String,
    },
  ],
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

module.exports = mongoose.model("QualityCheck", QualityCheck);
