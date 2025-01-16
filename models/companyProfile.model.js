const mongoose = require("mongoose")

const CompanyProfileSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    companySize: { type: String },
    companyType: { type: String, enum: ["Contractor", "Sub-Contractor"] },
    companyEmail: String,
    logo: String,
    phone: String,
    website: String,
    taxId: String,
    companyId: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("CompanyProfile", CompanyProfileSchema)

