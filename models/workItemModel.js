const mongoose = require("mongoose");

const WorkItemSchema = new mongoose.Schema({
  workItemName: { type: String, required: true },
  workDetails: { type: Object },
  previousQuantity: { type: Number, default: 0 },
  currentQuantity: { type: Number, default: 0 },
  newCurrent: { type: Number, default: 0 },
  totalOfQuantityAndPrevious: { type: Number, default: 0 },
  totalAmount:{type: Number, default: 0},
  //net amount= totalOfQuantityAndPrevious * price *completion * invoicing
  netAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  previousNetAmount: { type: Number, default: 0 },
  previousDueAmount: { type: Number, default: 0 },
  firstAction: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Work", WorkItemSchema);
