const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
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
    image: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    progress: { type: Number, default: 0 },
    workItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Work",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
