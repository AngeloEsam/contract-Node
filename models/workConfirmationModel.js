const mongoose = require('mongoose');

const workConfirmationSchema = new mongoose.Schema({
    withContract: { type: Boolean, default: false },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    contractType: { type: String, required: true },
    projectName: { type: String },
    partner: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    workConfirmationType: { type: String, required: true },
    typeOfProgress: { type: String },
    status: { type: String, required: true },
    activateInvoicingByPercentage: { type: Boolean, default: false },
    completionPercentage: { type: Boolean, default: false }
});

module.exports = mongoose.model('WorkConfirmation', workConfirmationSchema);
