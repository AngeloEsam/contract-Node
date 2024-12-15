const Contract = require("../models/contractModel");
const estimatorModel = require("../models/estimatorModel");
const Material = require("../models/materialModel");
const fs = require("fs");
const path = require("path");
const excelToJson = require("convert-excel-to-json");
const Project = require("../models/projectModel");
const workItemModel = require("../models/workItemModel");
const ProductModel = require("../models/productModel");
const addMaterial = async (req, res) => {
  try {
    const {
      estimatorId,
      projectName,
      contract,
      applyOn,
      category,
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
    if (applyOn === "BOQ Lines") {
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
      estimatorId,
      projectName,
      contract,
      applyOn,
      category,
      userId,
      boqLineItem: applyOn === "BOQ Lines" ? boqLineItem : null,
      materialName,
      unitOfMeasure,
      quantity,
      cost,
      total,
    });

    await newMaterial.save();
    res.status(201).json({
      message: "added successfully!",
      newMaterial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getAllMaterials = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in." });
    }
    const materials = await Material.find({
      userId: req.user._id,
      category: "Material",
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName")
      .populate("materialName", "name");
    const materialss = await Material.find({
      userId: req.user._id,
      category: "Labor" || "Equipment" || "OtherCost",
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName");
    res.status(200).json({ material: materials, other: materialss });
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

const calculateSalesAndTax = async (req, res) => {
  try {
    const { showSales, includeTax, taxValue, profitMargin, category } =
      req.body;

    if (typeof showSales !== "boolean" || typeof includeTax !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid or missing showSales/includeTax" });
    }
    if (showSales && (isNaN(profitMargin) || profitMargin < 0)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing profitMargin" });
    }
    if (includeTax && (isNaN(taxValue) || taxValue < 0)) {
      return res.status(400).json({ message: "Invalid or missing taxValue" });
    }
    const materials = await Material.find({ category: category });

    // تعديل البيانات بناءً على المعطيات
    const updatedMaterials = materials.map(async (material) => {
      const updatedMaterial = { ...material._doc };

      if (showSales && profitMargin > 0) {
        const profitValue =
          material.total + (material.total * profitMargin) / 100;
        updatedMaterial.profitValue = profitValue;
      }
      if (includeTax && taxValue > 0) {
        const taxDeductedValue =
          material.total - (material.total * taxValue) / 100;
        updatedMaterial.taxDeductedValue = taxDeductedValue;
      }

      await Material.updateOne(
        { _id: material._id },
        {
          $set: {
            profitMargin: profitMargin || material.profitMargin,
            taxValue: taxValue || material.taxValue,
            profitValue: updatedMaterial.profitValue || material.profitValue,
            taxDeductedValue:
              updatedMaterial.taxDeductedValue || material.taxDeductedValue,
          },
        },
        { new: true }
      );
      return updatedMaterial;
    });
    const results = await Promise.all(updatedMaterials);
    return res.status(200).json({
      message: "Calculation applied and data updated successfully.",
      data: results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getAllByCategory = async (req, res) => {
  try {
    const { category, estimatorId } = req.params;
    const validCategories = ["Material", "Labor", "Equipment", "OtherCost"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category provided." });
    }
    const materials = await Material.find({
      category,
      userId: req.user._id,
      estimatorId,
    })
      .populate("projectName", "projectName")
      .populate("contract", "code name")
      .populate("boqLineItem", "workItemName")
      .populate("estimatorId", "name");

    res.status(200).json({ data: materials });
  } catch (error) {
    console.error("Error fetching materials by category:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch materials by category.", error });
  }
};
const insertMaterial = async (req, res) => {
  const { estimatorId } = req.params;
  const { category, applyOn } = req.body;
  const { _id: userId } = req.user;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file found" });
    }

    const filePath = path.join(__dirname, "../excelFiles", req.file.filename);

    const excelData = excelToJson({
      sourceFile: filePath,
      header: { rows: 1 },
      columnToKey: {
        A: "projectName",
        B: "contract",
        C: "boqLineItem",
        D: "materialName",
        E: "unitOfMeasure",
        F: "quantity",
        G: "cost",
      },
    });

    const sheetName = Object.keys(excelData)[0];
    const sheetData = excelData[sheetName];
    if (!sheetData || sheetData.length === 0) {
      return res
        .status(400)
        .json({ message: "No data found in the Excel file" });
    }
    const esitimator = await estimatorModel.findById(estimatorId);
    if (!esitimator) {
      return res.status(404).json({ message: "Estimator not found" });
    }

    for (const row of sheetData) {
      const project = await Project.find({ projectName: row["projectName"] });
      const contract = await Contract.find({ code: row["contract"] });
      const product = await ProductModel.findOne({ name: row["materialName"] });
      const workItem = await workItemModel.find({
        workItemName: row["boqLineItem"],
      });
      const total = (row["quantity"] || 0) * (row["cost"] || 0);
      const materialDetails = {
        projectName: project._id,
        contract: contract._id,
        boqLineItem: applyOn == "BOQ Lines" ? workItem._id : null,
        applyOn: applyOn,
        category: category,
        materialName:
          category == "Material" ? product._id : row["materialName"],
        unitOfMeasure: row["unitOfMeasure"],
        quantity: row["quantity"],
        cost: row["cost"],
        total,
      };
      const newMaterial = new Material({
        userId,
        estimatorId,
        ...materialDetails,
      });
      await newMaterial.save();
    }
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
    res.status(201).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getAllByCategoryNames = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ["Labor", "Equipment", "OtherCost"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category provided." });
    }
    const materials = await Material.find({
      category,
      userId: req.user._id,
    }).select("materialName");

    res.status(200).json({ data: materials });
  } catch (error) {
    console.error("Error fetching materials by category:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch materials by category.", error });
  }
};
module.exports = {
  addMaterial,
  getAllMaterials,
  getSingleMaterial,
  deleteMaterial,
  calculateSalesAndTax,
  getAllByCategory,
  insertMaterial,
  getAllByCategoryNames,
};
