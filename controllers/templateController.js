const Template = require("../models/templateModel");
const Main = require("../models/mainItemModel");
const Contract = require("../models/contractModel");

const saveTemplate = async (req, res) => {
  try {
    const { name, description, category, tags } = req.body;
    const createdBy = req.user._id;
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized, please login first!" });
    }
    const main = await Main.findOne();
    if (!main) {
      return res.status(404).json({ message: "No main table found." });
    }
    const newTemplate = new Template({
      name,
      description,
      category,
      tags,
      mainId: main._id,
      createdBy,
    });
    await newTemplate.save();

    res
      .status(201)
      .json({ message: "Template saved successfully!", template: newTemplate });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save template!", error: error.message });
  }
};
const addTemplate = async (req, res) => {
  try {
    const { name, description,relevantProject } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    // const userContracts = user.contracts;
    // if (!userContracts) {
    //   return res.status(404).json({ message: "No contracts found for this user" });
    // }
    // const contract = await Contract.findOne({ _id: { $in: userContracts } }).populate("project");

    // if (!contract) {
    //   return res.status(404).json({ message: "No valid contract found for the user" });
    // }
    // const projectName = contract.project?.projectName;
    // if (!projectName) {
    //   return res.status(400).json({ message: "Project name not found for this contract" });
    // }
    const newTemplate = new Template({
      name,
      description,
      relevantProject
      // relevantProject: projectName,
    });
    await newTemplate.save();

    res.status(201).json({ message: "Template created successfully", data: newTemplate });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
const getTemplates = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }
    const templates = await Template.find({ createdBy: req.user._id }).populate(
      {
        path: "mainId",
        sort: { createdAt: -1 },
        populate: {
          path: "subItems",
          populate: {
            path: "workItems",
          },
        },
      }
    );

    res.status(200).json({ data: templates });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch templates!", error: error.message });
  }
};
module.exports = {
  saveTemplate,
  getTemplates,
  addTemplate
};
