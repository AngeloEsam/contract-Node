const mongoose = require("mongoose");

const otherCostSchema = new mongoose.Schema({
  projectName: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Project",
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Contract",
  },
  applyOn: { type: String, enum: ["Whole BOQ", "BOQ Line"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  boqLineItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Work",
  },
  otherCostName: { type: String, required: true },
  unitOfMeasure: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

module.exports = mongoose.model("OtherCost", otherCostSchema);
