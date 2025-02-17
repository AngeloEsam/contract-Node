const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ImageSchema = new Schema(
  {
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    workItemId: { type: mongoose.Types.ObjectId, ref: "Work" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Image", ImageSchema);
