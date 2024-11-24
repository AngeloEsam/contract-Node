const AdditionWorkConfirmation = require("../models/additionWorkConfirmation");
const workConfirmationModel = require("../models/workConfirmationModel");

const addAdditionWorkConfirmation = async (req, res) => {
  const { workConfirmationId } = req.params;
  const { _id: userId } = req.user;

  try {
    const { additionName, type, amount } = req.body;

    if (!additionName || !type || !amount || !workConfirmationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const work = await workConfirmationModel.findById(workConfirmationId);
    if (!work) {
      return res.status(404).json({ message: "WorkConfirmation not found" });
    }

    let finalAdditionAmount;
    if (type === "Percentage %") {
      finalAdditionAmount = (work.totalNetAmount * amount) / 100;
    } else {
      finalAdditionAmount = amount;
    }

    const newAdditionWorkConfirmation = new AdditionWorkConfirmation({
      additionName,
      type,
      amount: finalAdditionAmount,
      userId,
      workConfirmationId,
    });
    await newAdditionWorkConfirmation.save();
    const workConfirmationUpdated =
      await workConfirmationModel.findByIdAndUpdate(
        workConfirmationId,
        {
          $inc: { totalNetAmount: finalAdditionAmount },
          $inc: { totalAddition: finalAdditionAmount },
        },
        { new: true }
      );

    res.status(201).json({
      message: "Addition added and work confirmation updated successfully!",
      data: newAdditionWorkConfirmation,
      updatedWorkConfirmation: workConfirmationUpdated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding Addition",
      error: error.message,
    });
  }
};

const getAdditionsWorkConfirmation = async (req, res) => {
  const { workConfirmationId } = req.params;
  const { _id: userId } = req.user;

  try {
    const additions = await AdditionWorkConfirmation
      .find({ workConfirmationId, userId })
      .select("additionName type amount createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Additions retrieved successfully",
      data: additions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving additions",
      error: error.message,
    });
  }
};
module.exports = {
  addAdditionWorkConfirmation,
  getAdditionsWorkConfirmation,
};
