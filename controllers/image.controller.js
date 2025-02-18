const Image = require("../models/image.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const path = require("path");
const fs = require("fs");

/**
 *  @desc   Create a new image
 *  @route  POST /api/images
 *  @access User
 */
exports.createImage = asyncHandler(async (req, res) => {
  const { workItemId } = req.query;
  const imagesFiles = req.files?.images;
  if (!imagesFiles) throw new ApiError("No images uploaded", 400);

  const imagesArray = Array.isArray(imagesFiles) ? imagesFiles : [imagesFiles];

  const imagesData = imagesArray.map((file) => ({
    filename: file.filename,
    size: file.size,
    type: file.mimetype,
    workItemId,
  }));

  const images = await Image.insertMany(imagesData);

  res.status(201).json(images);
});

/**
 *  @desc   Get all images
 *  @route  GET /api/images?workItemId
 *  @access User
 */

exports.getAllImages = asyncHandler(async (req, res) => {
  const { workItemId } = req.query;
  const options = workItemId ? { workItemId } : {};
  const images = await Image.find(options);

  res.status(200).json(images);
});

/**
 * @desc Update image
 * @route PUT /api/images/:id
 * @access User
 */
exports.updateImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const image = req.file;
  if (!image) throw new ApiError("No image uploaded", 400);

  const existsImage = await Image.findById(id);
  if (!existsImage) throw new ApiError("Image not found", 404);
  // Delete the old image from server
  const oldImagePath = path.join(__dirname, "./uploads", existsImage.filename);
  if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
  // Update the new image
  const updatedImage = await Image.findByIdAndUpdate(
    id,
    { filename: image.filename },
    { new: true }
  );
  res.status(200).json(updatedImage);
});

/**
 * @desc Delete image
 * @route DELETE /api/images/:id
 * @access User
 */
exports.deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existsImage = await Image.findById(id);
  if (!existsImage) throw new ApiError("Image not found", 404);
  // Delete the image from server
  const imagePath = path.join(__dirname, "./uploads", existsImage.filename);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  // Delete the image from database
  await Image.findByIdAndDelete(id);
  res.status(204).send();
});
