const asyncHandler = require("express-async-handler")
const CompanyProfile = require("../models/companyProfile.model")
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

/**
 * @desc    Get all company profile
 * @route   /api/companyProfile
 * @access  Admin
*/
exports.getCompanyProfiles = asyncHandler(async (req, res) => {
    // Pagination
    let filterQueries = { ...req.query };
    const userId = req.user._id;
    // Fields that should be excluded from the filter query
    const excludedQueries = ["page", "pages", "limit", "sort", "field"];
    excludedQueries.forEach((field) => delete filterQueries[field]);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;
    filterQueries.userId = userId;
    // Get the total number of pages
    const totalCompanyProfiles = await CompanyProfile.countDocuments(filterQueries);
    const totalPages = Math.round(totalCompanyProfiles / limit)

    const companyProfiles = await CompanyProfile.find(filterQueries).skip(skip).limit(limit).populate({
        path: "userId",
        select: "-password"
    })
    res.status(200).json({ results: companyProfiles.length, page: 1, pages: totalPages, skip: 1, companyProfiles })
})

/**
 * @desc    Get single company profile
 * @route   /api/companyProfile/:id
 * @access  Admin & User
*/
exports.getCompanyProfile = asyncHandler(async (req, res) => {
    const { id } = req.params
    // Get single document
    const companyProfile = await CompanyProfile.findById(id).populate({
        path: "userId",
        select: "-password"
    })
    if (!companyProfile) {
        return next(new ApiError("No Company found.", 404))
    }
    res.status(200).json({ companyProfile })
})

/**
 * @desc    Create a company profile
 * @route   /api/companyProfile
 * @access  Admin & User
*/
exports.createCompanyProfile = asyncHandler(async (req, res) => {
    // Fields data
    const { companyName, companySize, companyType, phone, website, taxId, companyId } = req.body
    const { _id: userId } = req.user
    // Logo
    const logo = req.file.filename
    // Create company profile
    const companyProfile = await CompanyProfile.create({ companyName, companySize, companyType, userId, logo, phone, website, taxId, companyId })
    res.status(201).json({ companyProfile })
})

/**
 * @desc    Update a company profile
 * @route   /api/companyProfile/:id
 * @access  Admin & User
 */
exports.updateCompanyProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.user;
    const { companyName, companySize, companyType, phone, website, taxId, companyId } = req.body;
    const newLogo = req.file ? req.file.filename : undefined;

    // Fetch the current company profile
    const companyProfile = await CompanyProfile.findById(id);
    if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found" });
    }

    // Remove the old logo if a new logo is uploaded
    if (newLogo && companyProfile.logo) {
        const oldLogoPath = path.join(__dirname, "../companyProfileImages", companyProfile.logo);
        if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath); // Remove the old logo file
        }
    }

    // Prepare the update data
    const updateData = {
        companyName,
        companySize,
        companyType,
        phone,
        website,
        taxId,
        companyId,
    };
    if (newLogo) {
        updateData.logo = newLogo; // Add the new logo to the update
    }

    // Update the company profile
    const updatedCompanyProfile = await CompanyProfile.findByIdAndUpdate(id, updateData, { new: true });

    // Update user information
    await User.findByIdAndUpdate(userId, { companyName, companySize, companyType });

    // Send response
    res.status(201).json({ companyProfile: updatedCompanyProfile });
});


/**
 * @desc    Delete a company profile
 * @route   /api/companyProfile/:id
 * @access  Admin & User
*/
exports.deleteCompanyProfile = asyncHandler(async (req, res) => {
    const { id } = req.params
    // Delete company profile
    await CompanyProfile.findByIdAndDelete(id)
    res.status(204).send()
})

/**
 * @desc    Get a company profile by user id
 * @route   /api/companyProfile/:userId
 * @access  Admin & User
*/
exports.getCompanyProfileByUserId = asyncHandler(async (req, res, next) => {
    const { userId } = req.params
    const companyProfile = await CompanyProfile.findOne({ userId }).populate({
        path: "userId",
        select: "-password"
    })
    if (!companyProfile) {
        return next(new ApiError("No company found", 404))
    }

    res.status(200).json(companyProfile)
})