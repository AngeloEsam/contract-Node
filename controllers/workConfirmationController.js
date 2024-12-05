const Contract = require("../models/contractModel");
const workConfirmationModel = require("../models/workConfirmationModel");
const WorkConfirmation = require("../models/workConfirmationModel");
const workItemModel = require("../models/workItemModel");

const getWorkItemsForSpecificContract = async (contractId) => {
  const contract = await Contract.findById(contractId).populate({
    path: "mainId",
    populate: {
      path: "subItems",
    },
  });
  if (!contract) {
    return [];
  }
  let workItemss = [];
  contract.mainId.map((item) => {
    item.subItems.map((sub) => {
      sub.workItems.map(async (workId) => {
        workItemss.push({ workItemId: workId });
      });
    });
  });
  // const workItemsss = await workItemModel.find({ _id: { $in: workItemss } });
  return workItemss;
};
const createWorkConfirmation = async (req, res) => {
  const userId = req.user._id;
  try {
    const {
      withContract,
      contractId,
      contractType,
      startDate,
      endDate,
      workConfirmationType,
      completionPercentage,
      activateInvoicingByPercentage,
      status,
      projectName,
      partner,
      typeOfProgress,
    } = req.body;
    const lastWorkConfirmationCount = await WorkConfirmation.find({
      contractId,
    }).countDocuments();

    const workItemsForContract = await getWorkItemsForSpecificContract(
      contractId
    );

    if (lastWorkConfirmationCount > 0) {
      const lastWorkConfirmation = await WorkConfirmation.findOne({
        contractId,
      })
        .sort({ createdAt: -1 })
        .lean();
      workItemsForContract.forEach((item) => {
        const matchingItem = lastWorkConfirmation.workItems.find(
          (lastItem) => String(lastItem.workItemId) === String(item.workItemId)
        );
        if (matchingItem) {
          item.previousQuantity = matchingItem.totalQuantity;
        }
      });
    }
    const newWorkConfirmation = new WorkConfirmation({
      contractId,
      numberWithSpecificContract: lastWorkConfirmationCount + 1,
      userId,
      withContract,
      contractType,
      startDate,
      endDate,
      workConfirmationType,
      completionPercentage,
      activateInvoicingByPercentage,
      status,
      projectName,
      partner,
      typeOfProgress,
      workItems: workItemsForContract,
    });

    await newWorkConfirmation.save();
    res.status(201).json({ data: newWorkConfirmation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const createWorkConfirmation = async (req, res) => {
//   const userId = req.user._id;
//   try {
//     const {
//       withContract,
//       contractId,
//       contractType,
//       startDate,
//       endDate,
//       workConfirmationType,
//       completionPercentage,
//       activateInvoicingByPercentage,
//       status,
//       projectName,
//       partner,
//       typeOfProgress,
//     } = req.body;
//     const lastWorkConfirmation = await WorkConfirmation.findOne({
//       contractId,
//     }).countDocuments();
//     const workItemsForContract = await getWorkItemsForSpecificContract(
//       contractId
//     );
//     const newNumber = lastWorkConfirmation + 1;
//     let newWorkConfirmation = {
//       contractId,
//       numberWithSpecificContract: newNumber,
//       userId,
//       withContract,
//       contractType,
//       startDate,
//       endDate,
//       workConfirmationType,
//       completionPercentage,
//       activateInvoicingByPercentage,
//       status,
//       projectName,
//       partner,
//       typeOfProgress,
//       workItems: workItemsForContract,
//     };

//     if (lastWorkConfirmation.length > 0) {
//       const findLastNumber = await workConfirmationModel.findOne({
//         contractId,
//         numberWithSpecificContract: lastWorkConfirmation,
//       });
//       if (findLastNumber) {
//         newWorkConfirmation.workItems.previousQuantity = lastWorkConfirmation + 1;
//       }
//     }
//     const workConfirmation = new WorkConfirmation(newWorkConfirmation);
//     await workConfirmation.save();
//     res.status(201).json({ data: workConfirmation });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const getAllWorkConfirmation = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const workConfirmations = await WorkConfirmation.find({ userId })
      .populate({
        path: "contractId",
        select: "code",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const sortedWorkConfirmations = workConfirmations.sort((a, b) => {
      const codeA = a.contractId?.code || "";
      const codeB = b.contractId?.code || "";
      return codeA.localeCompare(codeB);
    });
    const totalWorkConfirmations = await WorkConfirmation.countDocuments({
      userId,
    });
    const totalPages = Math.ceil(totalWorkConfirmations / limit);
    res.status(200).json({
      totalWorkConfirmations,
      totalPages,
      currentPage: page,
      data: sortedWorkConfirmations,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching work confirmations", error });
  }
};

const getSingleWorkConfirmation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const workConfirmation = await WorkConfirmation.findOne({
      _id: id,
      userId,
    })
      .populate({
        path: "contractId",
        select: "code",
      })
      .populate({
        path: "workItems",
        populate: {
          path: "workItemId",
          select: "workDetails workItemName _id",
        },
      });

    if (!workConfirmation) {
      return res
        .status(404)
        .json({ message: "Work confirmation not found or access denied" });
    }
    const modifiedWorkItems = workConfirmation.workItems
      .map((item) => {
        const { workItemId } = item;

        if (!workItemId || !workItemId.workDetails) {
          return null;
        }
        const { workDetails } = workItemId;
        const {
          remainingQuantity,
          previousQuantity,
          financialCategory,
          total,
          ...filteredWorkDetails
        } = workDetails;

        return {
          ...item.toObject(),
          workItemId: {
            ...workItemId.toObject(),
            workDetails: filteredWorkDetails,
          },
        };
      })
      .filter(Boolean);

    res.status(200).json({
      data: {
        ...workConfirmation.toObject(),
        workItems: modifiedWorkItems,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching the work confirmation", error });
  }
};

const deleteWorkConfirmation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const workConfirmation = await WorkConfirmation.findOne({
      _id: id,
      userId,
    });

    if (!workConfirmation) {
      return res
        .status(404)
        .json({ message: "Work confirmation not found or access denied" });
    }
    await WorkConfirmation.deleteOne({ _id: id });

    res.status(200).json({ message: "Work confirmation deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting the work confirmation", error });
  }
};

const updateWorkConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      startDate,
      endDate,
      typeOfProgress,
      workConfirmationType,
      activateInvoicingByPercentage,
      completionPercentage,
    } = req.body;
    const userId = req.user._id;

    const workConfirmation = await WorkConfirmation.findById(id);
    if (!workConfirmation) {
      return res.status(404).json({ message: "WorkConfirmation not found!" });
    }

    if (String(workConfirmation.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this WorkConfirmation!" });
    }

    const updatedWorkConfirmation = await WorkConfirmation.findByIdAndUpdate(
      id,
      {
        startDate,
        endDate,
        typeOfProgress,
        workConfirmationType,
        activateInvoicingByPercentage,
        completionPercentage,
      },
      { new: true }
    );

    res.status(200).json({
      message: "WorkConfirmation updated successfully!",
      data: updatedWorkConfirmation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating WorkConfirmation",
      error: error.message,
    });
  }
};

const updateWorkConfirmationBaseOnWorkItem = async (req, res) => {
  try {
    const { id, workConfirmationId } = req.params; // id: workItemId
    const { currentQuantity, invoicing, completion } = req.body;

    // Find the specific Work Item
    const existingWorkItem = await workItemModel.findById(id);
    if (!existingWorkItem) {
      return res.status(404).json({ message: "Work Item not found!" });
    }

    // Find the current Work Confirmation document
    const existingWorkConfirmation = await WorkConfirmation.findById(
      workConfirmationId
    );
    if (!existingWorkConfirmation) {
      return res.status(404).json({ message: "Work Confirmation not found!" });
    }

    // Locate the specific work item within the workItems array
    const workItemIndex = existingWorkConfirmation.workItems.findIndex(
      (item) => item.workItemId.toString() === id
    );

    if (workItemIndex === -1) {
      return res.status(404).json({
        message: "Work Item not associated with this Work Confirmation!",
      });
    }

    const currentWorkItem = existingWorkConfirmation.workItems[workItemIndex];

    // Check if already calculated
    if (currentWorkItem.isCalculated) {
      return res.status(400).json({
        message: "Work Item has already been calculated before!",
      });
    }

    // Calculate updated quantities
    const updatedTotalQuantity =
      currentWorkItem.previousQuantity + currentQuantity;

    if (updatedTotalQuantity > existingWorkItem.workDetails.assignedQuantity) {
      return res.status(400).json({
        message: `The total quantity (${updatedTotalQuantity}) exceeds the assigned contract quantity (${existingWorkItem.workDetails.assignedQuantity}).`,
      });
    }

    // Calculate total amount and net amount
    const totalAmount =
      updatedTotalQuantity * existingWorkItem.workDetails.price;
    const calculatedNetAmount =
      (invoicing / 100) * (completion / 100) * totalAmount;

    // Fetch the previous Work Confirmation to calculate due amount
    const previousWorkConfirmation = await WorkConfirmation.findOne({
      contractId: existingWorkConfirmation.contractId,
      numberWithSpecificContract:
        existingWorkConfirmation.numberWithSpecificContract - 1,
    });

    let previousNetAmount = 0;

    if (previousWorkConfirmation) {
      const previousWorkItemIndex =
        previousWorkConfirmation.workItems.findIndex(
          (item) => item.workItemId.toString() === id
        );

      if (previousWorkItemIndex !== -1) {
        previousNetAmount =
          previousWorkConfirmation.workItems[previousWorkItemIndex].netAmount ||
          0;
      }
    }

    const calculatedDueAmount = calculatedNetAmount - previousNetAmount;

    // Update the work item in the current Work Confirmation
    existingWorkConfirmation.workItems[workItemIndex].currentQuantity = currentQuantity;
    existingWorkConfirmation.workItems[workItemIndex].totalQuantity = updatedTotalQuantity;
    existingWorkConfirmation.workItems[workItemIndex].totalAmount = totalAmount;
    existingWorkConfirmation.workItems[workItemIndex].netAmount = calculatedNetAmount;
    existingWorkConfirmation.workItems[workItemIndex].dueAmount = calculatedDueAmount;
    existingWorkConfirmation.workItems[workItemIndex].isCalculated = true;

    // Debugging: Log the updated work items
    console.log(
      "Updated work items:",
      JSON.stringify(existingWorkConfirmation.workItems, null, 2)
    );

    // Save the updated Work Confirmation
    await existingWorkConfirmation.save();

    res.status(200).json({
      message: "Work Confirmation updated successfully!",
      data: existingWorkConfirmation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Work Confirmation",
      error: error.message,
    });
  }
};

module.exports = {
  createWorkConfirmation,
  getAllWorkConfirmation,
  getSingleWorkConfirmation,
  deleteWorkConfirmation,
  updateWorkConfirmation,
  updateWorkConfirmationBaseOnWorkItem,
};
