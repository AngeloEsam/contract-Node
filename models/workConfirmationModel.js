const mongoose = require("mongoose");

const workConfirmationSchema = new mongoose.Schema(
  {
    withContract: { type: Boolean, default: false },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contractType: { type: String, required: true },
    projectName: { type: String },
    partner: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    workConfirmationType: { type: String, required: true },
    typeOfProgress: {
      type: String,
      enum: [
        "Percentage per Line",
        "Quantity per Line",
        "Milestone-Based Confirmation",
      ],
    },
    status: { type: String, required: true },
    activateInvoicingByPercentage: { type: Boolean, default: false },
    completionPercentage: { type: Boolean, default: false },
    previousQuantity: { type: Number, default: 0 },
    currentQuantity: { type: Number, default: 0 },
    newCurrent: { type: Number, default: 0 },
    totalOfQuantityAndPrevious: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    //net amount= totalOfQuantityAndPrevious * price *completion * invoicing
    netAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    previousNetAmount: { type: Number, default: 0 },
    previousDueAmount: { type: Number, default: 0 },
    firstAction: { type: Boolean, default: false },
    totalDeduction: { type: Number, default: 0 },
    totalAddition: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkConfirmation", workConfirmationSchema);
