const DeductionWorkConfirmation = require("../models/deductionWorkConfirmation");
const workConfirmationModel = require("../models/workConfirmationModel");

const deductionWorkConfirmation = async (req, res) => {
  const { workConfirmationId } = req.params;
  const { _id: userId } = req.user;

  try {
    const { deductionName, type, amount } = req.body;

    if (!deductionName || !type || !amount || !workConfirmationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const work = await workConfirmationModel.findById(workConfirmationId);
    if (!work) {
      return res.status(404).json({ message: "WorkConfirmation not found" });
    }

    let finalDeductionAmount;
    if (type === "Percentage %") {
      finalDeductionAmount = (work.totalNetAmount * amount) / 100;
    } else {
      finalDeductionAmount = amount;
    }

    const newDeductionWorkConfirmation = new DeductionWorkConfirmation({
      deductionName,
      type,
      amount: finalDeductionAmount,
      userId,
      workConfirmationId,
    });
    await newDeductionWorkConfirmation.save();
    const workConfirmationUpdated =
      await workConfirmationModel.findByIdAndUpdate(
        workConfirmationId,
        {
          $inc: { 
            totalNetAmount: -finalDeductionAmount,
            totalDeduction: finalDeductionAmount,
          },
        },
        { new: true }
      );

    res.status(201).json({
      message: "Deduction added and work confirmation updated successfully!",
      data: newDeductionWorkConfirmation,
      updatedWorkConfirmation: workConfirmationUpdated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding Deduction",
      error: error.message,
    });
  }
};

const getdeductionsWorkConfirmation = async (req, res) => {
  const { workConfirmationId } = req.params;
  const { _id: userId } = req.user;

  try {
    const deductions = await DeductionWorkConfirmation.find({
      workConfirmationId,
      userId,
    })
      .select("deductionName type amount createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "deductions retrieved successfully",
      data: deductions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving additions",
      error: error.message,
    });
  }
};
module.exports = {
  deductionWorkConfirmation,
  getdeductionsWorkConfirmation,
};
