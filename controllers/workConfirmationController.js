const WorkConfirmation = require("../models/workConfirmationModel");
const workItemModel = require("../models/workItemModel");

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

    let newWorkConfirmation = {
      contractId,
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
    };

    const workConfirmation = new WorkConfirmation(newWorkConfirmation);
    await workConfirmation.save();
    res.status(201).json({ data: workConfirmation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllWorkConfirmation = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const workConfirmations = await WorkConfirmation.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const totalWorkConfirmations = await WorkConfirmation.countDocuments({
      userId,
    });
    const totalPages = Math.ceil(totalWorkConfirmations / limit);
    res.status(200).json({
      totalWorkConfirmations,
      totalPages,
      currentPage: page,
      data: workConfirmations,
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
    }).populate("contractId");
    if (!workConfirmation) {
      return res
        .status(404)
        .json({ message: "Work confirmation not found or access denied" });
    }

    res.status(200).json({ data: workConfirmation });
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
    const { id, workConfirmationId } = req.params;
    const {
      currentQuantity,
      netAmount,
      dueAmount,
      previousDueAmount,
      previousNetAmount,
    } = req.body;
    const existingWorkItem = await workItemModel.findById(id);
    if (!existingWorkItem) {
      return res.status(404).json({ message: "Work Item not found!" });
    }
    const existingWorkConfirmation = await WorkConfirmation.findById(
      workConfirmationId
    );
    if (!existingWorkConfirmation) {
      return res.status(404).json({ message: "Work Confirmation not found!" });
    }

    const previousQuantity = existingWorkConfirmation.previousQuantity || 0;

    const updatedTotalOfQuantityAndPrevious =
      currentQuantity + previousQuantity;

    if (
      updatedTotalOfQuantityAndPrevious >
      existingWorkItem.workDetails.assignedQuantity
    ) {
      return res.status(400).json({
        message: `The total quantity (${updatedTotalOfQuantityAndPrevious}) exceeds the assigned contract quantity (${existingWorkItem.workDetails.assignedQuantity}).`,
      });
    }

    const totalAmount =
      updatedTotalOfQuantityAndPrevious * existingWorkItem.workDetails.price;
    const updatedWorkConfirmation = await WorkConfirmation.findByIdAndUpdate(
      workConfirmationId,
      {
        previousQuantity: updatedTotalOfQuantityAndPrevious,
        currentQuantity,
        totalOfQuantityAndPrevious: updatedTotalOfQuantityAndPrevious,
        totalAmount,
        netAmount,
        dueAmount,
        previousDueAmount,
        previousNetAmount,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Work Confirmation updated successfully!",
      data: updatedWorkConfirmation,
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
