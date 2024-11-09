const Contract = require("../models/contractModel");
const workItemModel = require("../models/workItemModel");
const User = require("../models/userModel");
const mainItemModel = require("../models/mainItemModel");
const subItemModel = require("../models/subItemModel");
const Project = require("../models/projectModel");
const Partner = require("../models/partnerModel");

const createContract = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      contractType,
      projectId,
      partnerId,
      consultantId,
      startDate,
      endDate,
      typeOfProgress,
      status,
      description,
    } = req.body;
    if (!contractType || !startDate || !endDate || !typeOfProgress) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }
    const newContract = new Contract({
      contractType,
      project: projectId,
      partner: partnerId,
      consultant: consultantId,
      startDate,
      endDate,
      typeOfProgress,
      status,
      description,
    });

    await newContract.save();
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { contracts: newContract._id } },
      { new: true }
    );
    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      { $push: { contracts: newContract._id } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $push: { contracts: newContract._id } },
      { new: true }
    );

    res.status(201).json({ data: newContract });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getContracts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const contracts = await Contract.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const totalContracts = await Contract.countDocuments();
    const totalPages = Math.ceil(totalContracts / limit);
    res.status(200).json({
      totalContracts,
      totalPages,
      currentPage: page,
      data: contracts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving contracts",
      error: error.message,
    });
  }
};

const getUserContracts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).populate({
      path: "contracts",
      options: {
        skip: skip,
        limit: limit,
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "project", select: "_id projectName" },
        { path: "partner", select: "_id partnerName" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const totalContracts = await User.findById(userId)
      .populate("contracts")
      .then((user) => user.contracts.length);
    const totalPages = Math.ceil(totalContracts / limit);
    res.status(200).json({
      contracts: user.contracts,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { _id } = req.user;

    if (!contractId) {
      return res.status(400).json({ message: "Contract ID is required" });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const user = await User.findById(_id);
    if (!user.contracts.includes(contract._id) && user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this" });
    }

    for (const idMain of contract.mainId) {
      const mainItem = await mainItemModel.findById(idMain);
      if (mainItem) {
        for (const subItemId of mainItem.subItems) {
          const subItem = await subItemModel.findById(subItemId);
          if (subItem) {
            for (const workId of subItem.workItems) {
              await workItemModel.findByIdAndDelete(workId);
            }

            await subItemModel.findByIdAndDelete(subItemId);
          }
        }

        await mainItemModel.findByIdAndDelete(idMain);
      }
    }

    await Contract.findByIdAndDelete(contractId);

    await User.findByIdAndUpdate(
      _id,
      { $pull: { contracts: contractId } },
      { new: true }
    );

    await Project.updateMany(
      { contracts: contractId },
      { $pull: { contracts: contractId } }
    );

    await Partner.updateMany(
      { contracts: contractId },
      { $pull: { contracts: contractId } }
    );
    res.status(200).json({ message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting contract:", error);
    res.status(500).json({ message: error.message });
  }
};

const getSingleContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    if (!contractId) {
      return res.status(400).json({ message: "Contract ID is required" });
    }

    const contract = await Contract.findById(contractId).populate({
      path: "mainId",
      sort: { createdAt: -1 },
      populate: {
        path: "subItems",
        populate: {
          path: "workItems",
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const uniqueMainItems = new Set(
      contract.mainId.map((item) => item._id.toString())
    );
    const totalMainItems = uniqueMainItems.size;

    res.status(200).json({ data: contract, totalMainItems: totalMainItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { _id } = req.user;

    if (!contractId) {
      return res.status(400).json({ message: "Contract ID is required" });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const user = await User.findById(_id);
    if (!user.contracts.includes(contract._id) && user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this contract" });
    }

    const updateData = {
      contractType: req.body.contractType || contract.contractType,
      startDate: req.body.startDate || contract.startDate,
      endDate: req.body.endDate || contract.endDate,
      typeOfProgress: req.body.typeOfProgress || contract.typeOfProgress,
      status: req.body.status || contract.status,
      description: req.body.description || contract.description,
      project: req.body.project || contract.project,
      partner: req.body.partner || contract.partner,
      consultant: req.body.consultant || contract.consultant,
    };

    const updatedContract = await Contract.findByIdAndUpdate(contractId, updateData, {
      new: true,
    });

    res.status(200).json({ data: updatedContract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const calculateTaxAndPayment = async (req, res) => {
  const userId = req.user._id;
  const { contractId } = req.params;
  const { downPaymentValue, taxValue } = req.body;

  try {
    const workItems = await workItemModel.find({ userId });

    let total = 0;
    for (let i = 0; i < workItems.length; i++) {
      total += workItems[i].workDetails.total;
    }
    console.log("Total before tax:", total);
    const finalTaxValue = taxValue || 0;
    const tax = (total * finalTaxValue) / 100;
    console.log("Calculated tax:", tax);

    const totalContractValue = total + tax;
    const payment = (totalContractValue * (downPaymentValue || 0)) / 100;
    const dueAmount = totalContractValue - payment;
    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      {
        taxValue: tax,
        taxRate: taxValue,
        downPaymentValue: payment,
        downPaymentRate: downPaymentValue,
        total,
        totalContractValue,
        dueAmount,
      },
      { new: true }
    );
    console.log(updatedContract);
    res.status(200).json({
      data: { tax, payment, totalContractValue, dueAmount, updatedContract },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPreviousItemNamesByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "contracts",
      populate: {
        path: "mainId",
        populate: {
          path: "subItems",
        },
      },
    });
    const mainItemNames = new Set();
    const subItemNames = new Set();

    for (const contract of user.contracts) {
      for (const mainItem of contract.mainId) {
        if (mainItem.itemName) {
          mainItemNames.add(mainItem.itemName);
        }
        for (const subItem of mainItem.subItems || []) {
          if (subItem.subItemName) {
            subItemNames.add(subItem.subItemName);
          }
        }
      }
    }
    res.status(200).json({
      mainItemNames: [...mainItemNames],
      subItemNames: [...subItemNames],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving item names" });
  }
};

const getTenantContracts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "tenant not found" });
    }
    const parentUser = await User.findById(user.parentId).populate("contracts");
    console.log(parentUser)
    // if (parentUser.usersGroup.includes(user._id)) {
    //   res.status(200).json({
    //     contracts: parentUser.contracts,
    //   });
    // } else {
    //   res
    //     .status(403)
    //     .json({ message: "You don't have permission to view this" });
    // }
    res.status(200).json({
      contracts: parentUser.contracts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createContract,
  getContracts,
  deleteContract,
  updateContract,
  getSingleContract,
  calculateTaxAndPayment,
  getUserContracts,
  getPreviousItemNamesByUser,
  getTenantContracts,
};
