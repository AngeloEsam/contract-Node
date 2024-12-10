const Contract = require("../models/contractModel");
const Material = require("../models/materialModel");
const addMaterial = async (req, res) => {
  try {
    const {
      projectName,
      contract,
      applyOn,
      boqLineItem,
      materialName,
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

    const total = quantity * cost;
    const newMaterial = new Material({
      projectName,
      contract,
      applyOn,
      userId,
      boqLineItem: applyOn === "BOQ Line" ? boqLineItem : null,
      materialName,
      unitOfMeasure,
      quantity,
      cost,
      total,
      totalMaterialCost:total
    });
    await newMaterial.save();  
    res.status(201).json({
      message: "Material added successfully!",
      newMaterial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getAllMaterials = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const materials = await Material.find({ userId: req.user._id })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: materials });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getSingleMaterial = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }

    const { materialId } = req.params;

    if (!materialId) {
      return res.status(400).json({ error: "Material ID is required." });
    }

    const material = await Material.findOne({
      _id: materialId,
      userId: req.user._id,
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ data: material });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const deleteMaterial = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const { materialId } = req.params;
    if (!materialId) {
      return res.status(400).json({ error: "Material ID is required." });
    }
    const material = await Material.findOne({
      _id: materialId,
      userId: req.user._id,
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found." });
    }
    await Material.findByIdAndDelete(materialId);

    res.status(200).json({ message: "Material deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const calculateSalesAndTax = async function (req, res) {
  try {
    const { showSales, includeTax, taxValue, profitMargin } = req.body;

    if (typeof showSales !== "boolean" || typeof includeTax !== "boolean") {
      return res.status(400).json({ message: "Invalid or missing showSales/includeTax" });
    }
    if (showSales && (isNaN(profitMargin) || profitMargin < 0)) {
      return res.status(400).json({ message: "Invalid or missing profitMargin" });
    }
    if (includeTax && (isNaN(taxValue) || taxValue < 0)) {
      return res.status(400).json({ message: "Invalid or missing taxValue" });
    }
    const materials = await Material.find();

    // تعديل البيانات بناءً على المعطيات
    const updatedMaterials = materials.map(async (material) => {
      const updatedMaterial = { ...material._doc };

      if (showSales && profitMargin > 0) {
        const profitValue = material.total + (material.total * profitMargin) / 100;
        updatedMaterial.profitValue = profitValue;
      }
      if (includeTax && taxValue > 0) {
        const taxDeductedValue = material.total - (material.total * taxValue) / 100;
        updatedMaterial.taxDeductedValue = taxDeductedValue;
      }
      await Material.updateOne(
        { _id: material._id },
        {
          $set: {
            profitValue: updatedMaterial.profitValue || 0, 
            taxDeductedValue: updatedMaterial.taxDeductedValue || 0,
          },
        }
      );
      return updatedMaterial;
    });
    const results = await Promise.all(updatedMaterials);

    return res.status(200).json({
      message: "Calculation applied and data updated successfully.",
      result: results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  addMaterial,
  getAllMaterials,
  getSingleMaterial,
  deleteMaterial,
  calculateSalesAndTax
};
