const mongoose = require("mongoose");

const WorkItemSchema = new mongoose.Schema({
  workItemName: { type: String, required: true },
  workDetails: { type: Object },
  previousQuantity: { type: Number},
  currentQuantity: { type: Number},
  totalOfQuantityAndPrevious: { type: Number},
  //net amount= totalOfQuantityAndPrevious * price *completion * invoicing
  netAmount:{ type: Number},
  userId: { type: mongoose.Schema.Types.ObjectId, required:true, ref:'User' },
});

module.exports = mongoose.model("Work", WorkItemSchema);
