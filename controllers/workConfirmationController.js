const WorkConfirmation = require("../models/workConfirmationModel");

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
    const workConfirmations = await WorkConfirmation.find({ userId: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const totalWorkConfirmations = await WorkConfirmation.countDocuments();
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
    });
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

// const addAdditionWorkConfirmation = async (req, res) => {
//   const { workConfirmationId } = req.params;
//   const { _id: userId } = req.user;

//   try {
//     const {additionName, type, amount } = req.body;

//     if (!additionName || !type || !amount || !workConfirmationId) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const work = await WorkConfirmation.findById(workConfirmationId);
//     if (!work) {
//       return res.status(404).json({ message: "WorkConfirmation not found" });
//     }

//     let finalAdditionAmount;
//     if (type === "Percentage %") {
//       finalAdditionAmount = (work.totalNetAmount * amount) / 100;
//     } else {
//       finalAdditionAmount = amount;
//     }

//     const newAddition = new Addition({
//       additionName,
//       type,
//       amount: finalAdditionAmount,
//       userId,
//       workConfirmationId,
//     });
//     await newAddition.save();
//     const contractUpdated = await Contract.findByIdAndUpdate(
//       contractId,
//       {
//         $inc: { totalAddition: finalAdditionAmount },
//       },
//       { new: true }
//     );

//     res.status(201).json({
//       message: "Addition added and contract updated successfully!",
//       data: newAddition,
//       updatedContract: contractUpdated,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error adding Addition",
//       error: error.message,
//     });
//   }
// };
module.exports = {
  createWorkConfirmation,
  getAllWorkConfirmation,
  getSingleWorkConfirmation,
  deleteWorkConfirmation,
};
