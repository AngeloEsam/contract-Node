const mongoose = require("mongoose");

const EstimatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  //   material: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       required: true,
  //       ref: "Material",
  //     },
  //   ],
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  totalMaterialCost: { type: Number, default: 0 },
  totalLaborCost: { type: Number, default: 0 },
  totalEquipmentCost: { type: Number, default: 0 },
  totalOtherCost: { type: Number, default: 0 },
  overallTotal: { type: Number, default: 0 },
  riskFactor: { type: Number, default: 0 },
});

module.exports = mongoose.model("Estimator", EstimatorSchema);
