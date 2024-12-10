const mongoose = require("mongoose");

const materialCostSchema = new mongoose.Schema({
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
  materialName: { type: String, required: true },
  unitOfMeasure: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  includeTax:{ type: Boolean, default: false},
  showSales:{ type: Boolean, default: false},
  taxValue:{ type: Number, default: 0},
  profitMargin:{ type: Number, default: 0},
  totalMaterialCost:{type:Number,default: 0},
  taxDeductedValue:{type:Number,default: 0},
  profitValue:{type:Number,default: 0},
  totalLaborCost:{type:Number,default: 0},
  totalEquipmentCost:{type:Number,default: 0},
  totalOtherCost:{type:Number,default: 0},
  overallTotal :{type:Number,default: 0},
  riskFactor: { type: Number, default: 0 },
});

module.exports = mongoose.model("Material", materialCostSchema);
