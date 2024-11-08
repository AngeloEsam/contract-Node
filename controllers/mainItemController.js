const Contract = require("../models/contractModel");
const MainItem = require("../models/mainItemModel");
const subItemModel = require("../models/subItemModel");
const workItemModel = require("../models/workItemModel");
const mongoose = require("mongoose");
const addMainItem = async (req, res) => {
  const { itemName, contractId } = req.body;

  try {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const newMainItem = new MainItem({ itemName });
    await newMainItem.save();

    contract.mainId.push(newMainItem._id);
    await contract.save();

    res.status(201).json({
      message: "Main Item created and added to contract successfully!",
      data: newMainItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating Main Item",
      error: error.message,
    });
  }
};
const getAllMainItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const mainItems = await MainItem.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("subItems");
    const totalItems = await MainItem.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      totalItems,
      totalPages,
      currentPage: page,
      data: mainItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Main Items",
      error: error.message,
    });
  }
};

const getSingleMainItem = async (req, res) => {
  try {
    const { id } = req.params;
    const mainItem = await MainItem.findById(id);

    if (!mainItem) {
      return res.status(404).json({ message: "Main Item not found" });
    }

    res.status(200).json({ data: mainItem });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Main Item",
      error: error.message,
    });
  }
};

const updateMainItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMainItem = await MainItem.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedMainItem) {
      return res.status(404).json({ message: "Main Item not found" });
    }

    res.status(200).json({
      message: "Main Item updated successfully!",
      data: updatedMainItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Main Item",
      error: error.message,
    });
  }
};

const deleteMain = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBOQItem = await MainItem.findByIdAndDelete(id);

    if (!deletedBOQItem) {
      return res.status(404).json({ message: "Main Item not found" });
    }

    res.status(200).json({
      message: "Main Item deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Main Item",
      error: error.message,
    });
  }
};

const searchMainItemOrSubItem = async (req, res) => {
  try {
    const { itemName, subItemName, workItemName } = req.query;

    const itemRegex = itemName ? new RegExp(itemName, "i") : null;
    const subItemRegex = subItemName ? new RegExp(subItemName, "i") : null;
    const workItemRegex = workItemName ? new RegExp(workItemName, "i") : null;

    const matchConditions = [];
    if (itemRegex) matchConditions.push({ itemName: itemRegex });
    if (subItemRegex)
      matchConditions.push({ "subItems.subItemName": subItemRegex });
    if (workItemRegex)
      matchConditions.push({
        "subItems.workItems.workItemName": workItemRegex,
      });

    const boqItems = await MainItem.aggregate([
      {
        $lookup: {
          from: "subs",
          localField: "subItems",
          foreignField: "_id",
          as: "subItems",
        },
      },
      {
        $unwind: {
          path: "$subItems",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "works",
          localField: "subItems.workItems",
          foreignField: "_id",
          as: "subItems.workItems",
        },
      },
      {
        $unwind: {
          path: "$subItems.workItems",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: matchConditions,
        },
      },
      {
        $group: {
          _id: "$_id",
          itemName: { $first: "$itemName" },
          subItems: { $push: "$subItems" },
        },
      },
    ]);

    res.status(200).json({ data: boqItems });
  } catch (error) {
    res.status(500).json({
      message: "Error searching BOQ Items",
      error: error.message,
    });
  }
};

module.exports = {
  addMainItem,
  getAllMainItems,
  getSingleMainItem,
  updateMainItem,
  deleteMain,
  searchMainItemOrSubItem,
};
