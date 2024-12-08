const Contract = require("../models/contractModel");
const Equipment = require("../models/equipmentModel");
const addEquipment = async (req, res) => {
  try {
    const {
      projectName,
      contract,
      applyOn,
      boqLineItem,
      equipmentName,
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

    const newEquipment = new Equipment({
      projectName,
      contract,
      applyOn,
      userId,
      boqLineItem: applyOn === "BOQ Line" ? boqLineItem : null,
      equipmentName,
      unitOfMeasure,
      quantity,
      cost,
      total: quantity * cost,
    });

    await newEquipment.save();
    res.status(201).json({ message: "Equipment added successfully!", newEquipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getAllEquipments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const equipments = await Equipment.find({ userId: req.user._id })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: equipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getSingleEquipment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }

    const { equipmentId } = req.params;

    if (!equipmentId) {
      return res.status(400).json({ error: "Equipment ID is required." });
    }

    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId: req.user._id,
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: equipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const deleteEquipment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const { equipmentId } = req.params;
    if (!equipmentId) {
      return res.status(400).json({ error: "Equipment ID is required." });
    }
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId: req.user._id,
    });

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found." });
    }
    await Equipment.findByIdAndDelete(equipmentId);

    res.status(200).json({ message: "Equipment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  addEquipment,
  getAllEquipments,
  getSingleEquipment,
  deleteEquipment,
};
