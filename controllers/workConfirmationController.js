const WorkConfirmation = require("../models/workConfirmationModel");
const Contract = require("../models/contractModel");

const createWorkConfirmation = async (req, res) => {
  try {
    const {
      withContract,
      contractId,
      contractType,
      startDate,
      endDate,
      workConfirmationType,
      status,
      projectName,
      partner,
      typeOfProgress,
    } = req.body;

    let newWorkConfirmation = {
      contractId,
      withContract,
      contractType,
      startDate,
      endDate,
      workConfirmationType,
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

module.exports = {
  createWorkConfirmation,
};
