const estimatorModel = require("../models/estimatorModel");

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
    res.status(200).json({ data:estimators });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createEstimator, getAllEstimator };
