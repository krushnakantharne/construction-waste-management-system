const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  issueDate: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
