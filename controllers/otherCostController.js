const Contract = require("../models/contractModel");
const OtherCost = require("../models/otherCostModel");
const addOtherCost = async (req, res) => {
  try {
    const {
      projectName,
      contract,
      applyOn,
      boqLineItem,
      otherCostName,
      unitOfMeasure,
      quantity,
      cost,
    } = req.body;
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User ID is missing." });
    }
    const userId = req.user._id;
    if (!projectName || !contract || !applyOn) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (applyOn === "BOQ Line" && !boqLineItem) {
      return res
        .status(400)
        .json({ error: "BOQ Line is required when applyOn is 'BOQ Line'." });
    }
    if (applyOn === "BOQ Line") {
      const contractDetails = await Contract.findOne({
        _id: contract,
      }).populate({
        path: "mainId",
        populate: {
          path: "subItems",
          populate: {
            path: "workItems",
            model: "Work",
          },
        },
      });

      if (!contractDetails) {
        return res.status(400).json({ error: "Contract not found." });
      }

      const isBoqLineValid = contractDetails.mainId.some((mainItem) =>
        mainItem.subItems.some((subItem) =>
          subItem.workItems.some(
            (workItem) => workItem._id.toString() === boqLineItem
          )
        )
      );

      if (!isBoqLineValid) {
        return res.status(400).json({
          error:
            "The selected BOQ line is not associated with the given contract.",
        });
      }
    }

    const newOtherCost = new OtherCost({
      projectName,
      contract,
      applyOn,
      userId,
      boqLineItem: applyOn === "BOQ Line" ? boqLineItem : null,
      otherCostName,
      unitOfMeasure,
      quantity,
      cost,
      total: quantity * cost,
    });

    await newOtherCost.save();
    res
      .status(201)
      .json({ message: "Other Cost added successfully!", newOtherCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getAllOtherCosts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const others = await OtherCost.find({ userId: req.user._id })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: others });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getSingleOtherCost = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }

    const { otherCostId } = req.params;

    if (!otherCostId) {
      return res.status(400).json({ error: "Other Cost ID is required." });
    }

    const otherCost = await OtherCost.findOne({
      _id: otherCostId,
      userId: req.user._id,
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: otherCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const deleteOtherCost = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const { otherCostId } = req.params;
    if (!otherCostId) {
      return res.status(400).json({ error: "Other Cost ID is required." });
    }
    const otherCost = await OtherCost.findOne({
      _id: otherCostId,
      userId: req.user._id,
    });

    if (!otherCost) {
      return res.status(404).json({ message: "Other Cost not found." });
    }
    await OtherCost.findByIdAndDelete(otherCostId);

    res.status(200).json({ message: "Other Cost deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  addOtherCost,
  getAllOtherCosts,
  getSingleOtherCost,
  deleteOtherCost,
};
