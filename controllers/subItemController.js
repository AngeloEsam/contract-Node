const mainItemModel = require("../models/mainItemModel");
const SubItem = require("../models/subItemModel");

const addSubItem = async (req, res) => {
  try {
    const { mainId, subItemName } = req.body;

    const newSubItem = new SubItem({
      subItemName,
    });

    const savedSubItem = await newSubItem.save();
    console.log(savedSubItem);
    const mainItem = await mainItemModel.findById(mainId);
    if (!mainId) {
      return res.status(404).json({ message: "mainItem not found" });
    }
    mainItem.subItems.push(savedSubItem._id);
    await mainItem.save();

    res.status(201).json({
      message: "Sub Item added and linked to Main Item successfully!",
      data: savedSubItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding Work Item",
      error: error.message,
    });
  }
};
const getAllSubItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const subItems = await SubItem.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("workItems");
    const totalItems = await SubItem.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      totalItems,
      totalPages,
      currentPage: page,
      data: subItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Sub Items",
      error: error.message,
    });
  }
};

const getSingleSubItem = async (req, res) => {
  try {
    const { id } = req.params;
    const subItem = await SubItem.findById(id).populate("workItems");

    if (!subItem) {
      return res.status(404).json({ message: "Sub Item not found" });
    }

    res.status(200).json({ data: subItem });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Sub Item",
      error: error.message,
    });
  }
};

const updateSubItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubItem = await SubItem.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedSubItem) {
      return res.status(404).json({ message: "Sub Item not found" });
    }

    res.status(200).json({
      message: "Sub Item updated successfully!",
      data: updateSubItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Sub Item",
      error: error.message,
    });
  }
};

const deleteSub = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubItem = await SubItem.findByIdAndDelete(id);

    if (!deletedSubItem) {
      return res.status(404).json({ message: "Sub Item not found" });
    }

    res.status(200).json({
      message: "Sub Item deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Sub Item",
      error: error.message,
    });
  }
};


module.exports = {
  addSubItem,
  getAllSubItems,
  getSingleSubItem,
  updateSubItem,
  deleteSub,
  
};
