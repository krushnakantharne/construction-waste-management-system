const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  requiredDate: { type: Date },
  purpose: { type: String },
  sourceProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  estimatedValue: { type: Number },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Processing', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
