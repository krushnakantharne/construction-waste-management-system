const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  material: { type: String },
  quantity: { type: Number },
  pickupLocation: { type: String },
  pickupDate: { type: Date },
  vehicleNumber: { type: String },
  driver: { type: String },
  status: { type: String, enum: ['Scheduled', 'Out for Pickup', 'Collected', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Pickup', pickupSchema);
