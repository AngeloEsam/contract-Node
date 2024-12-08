const Contract = require("../models/contractModel");
const Labor = require("../models/laborModel");
const addLabor = async (req, res) => {
  try {
    const {
      projectName,
      contract,
      applyOn,
      boqLineItem,
      laborName,
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

    const newLabor = new Labor({
      projectName,
      contract,
      applyOn,
      userId,
      boqLineItem: applyOn === "BOQ Line" ? boqLineItem : null,
      laborName,
      unitOfMeasure,
      quantity,
      cost,
      total: quantity * cost,
    });

    await newLabor.save();
    res.status(201).json({ message: "Labor added successfully!", newLabor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getAllLabors = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const labors = await Labor.find({ userId: req.user._id })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: labors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getSingleLabor = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }

    const { laborId } = req.params;

    if (!laborId) {
      return res.status(400).json({ error: "Labor ID is required." });
    }

    const labor = await Labor.findOne({
      _id: laborId,
      userId: req.user._id,
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: labor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const deleteLabor = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const { laborId } = req.params;
    if (!laborId) {
      return res.status(400).json({ error: "Labor ID is required." });
    }
    const labor = await Labor.findOne({
      _id: laborId,
      userId: req.user._id,
    });

    if (!labor) {
      return res.status(404).json({ message: "Labor not found." });
    }
    await Labor.findByIdAndDelete(laborId);

    res.status(200).json({ message: "Labor deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getAllLaborNames = async (req, res) => {
  try {
    const laborNames = await Labor.find({ userId: req.user._id }, "laborName");
    res.status(200).json({
      message: "Labor  names fetched successfully",
      data: laborNames,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching Labor names",
      error: error.message,
    });
  }
};
module.exports = {
  addLabor,
  getAllLabors,
  getSingleLabor,
  deleteLabor,
  getAllLaborNames,
};
