const estimatorModel = require("../models/estimatorModel");
const materialModel = require("../models/materialModel");

const createEstimator = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const newEstimator = new estimatorModel({ name, userId });
    await newEstimator.save();
    res
      .status(201)
      .json({ message: "Estimator created successfully", data: newEstimator });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllEstimator = async (req, res) => {
  try {
    const userId = req.user._id;
    const estimators = await estimatorModel.find({ userId });
    res.status(200).json({ data: estimators });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTotalFromMaterial = async (req, res) => {
  try {
    const userId = req.user._id;
    const { riskFactor } = req.body || 0;
    const { estimatorId } = req.params;
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalEquipmentCost = 0;
    let totalOtherCost = 0;
    let overallTotal = 0;
    const materials = await materialModel.find({ estimatorId, userId });

    const allTotals = materials.map((material) => {
      if (material.category == "Material") {
        totalMaterialCost += material.total;
      } else if (material.category == "Labor") {
        totalLaborCost += material.total;
      } else if (material.category == "Equipment") {
        totalEquipmentCost += material.total;
      } else {
        totalOtherCost += material.total;
      }
    });
    if (riskFactor) {
      overallTotal =
        totalOtherCost +
        totalEquipmentCost +
        totalLaborCost +
        totalMaterialCost +
        ((totalOtherCost +
          totalEquipmentCost +
          totalLaborCost +
          totalMaterialCost) *
          riskFactor) /
          100;
    } else {
      overallTotal =
        totalOtherCost +
        totalEquipmentCost +
        totalLaborCost +
        totalMaterialCost;
    }
    const updateEstimator = await estimatorModel.findByIdAndUpdate(
      estimatorId,
      {
        totalMaterialCost,
        totalLaborCost,
        totalEquipmentCost,
        totalOtherCost,
        overallTotal,
        riskFactor,
      },
      { new: true }
    );
    res.status(200).json({ data: updateEstimator });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getSingleEstimator = async (req, res) => {
  try {
    const { estimatorId } = req.params;
    const userId = req.user._id;
    const estimator = await estimatorModel.findById(estimatorId);
    if (!estimator) {
      return res.status(404).json({ message: "Estimator not found" });
    }
    if (estimator.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this estimator" });
    }
    res.status(200).json({ data: estimator });
  } catch (error) {
    console.error("Error fetching estimator:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the estimator" });
  }
};

const deleteEstimator = async (req, res) => {
  try {
    const { estimatorId } = req.params;
    const userId = req.user._id;
    const estimator = await estimatorModel.findById(estimatorId);

    if (!estimator) {
      return res.status(404).json({ message: "Estimator not found" });
    }
    if (estimator.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this estimator" });
    }
    await estimatorModel.findByIdAndDelete(estimatorId);

    res.status(200).json({ message: "Estimator deleted successfully" });
  } catch (error) {
    console.error("Error deleting estimator:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the estimator" });
  }
};
module.exports = {
  createEstimator,
  getAllEstimator,
  getTotalFromMaterial,
  deleteEstimator,
  getSingleEstimator
};
