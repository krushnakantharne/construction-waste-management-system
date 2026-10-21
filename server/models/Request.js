const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material:      { type: String, required: true },
  quantity:      { type: Number, required: true, min: 0.001 },
  unit:          { type: String },
  requiredDate:  { type: Date },
  purpose:       { type: String },
  sourceProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  inventory:     { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  estimatedValue:{ type: Number },
  status:        { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },
  cancelledAt:   { type: Date },
  // Extra contact fields submitted from the request form
  customerName:  { type: String },
  contactPerson: { type: String },
  phone:         { type: String },
  notes:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
