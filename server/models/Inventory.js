const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  materialType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  condition: { type: String },
  estimatedValue: { type: Number },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sourceWaste: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste' },
  status: { type: String, enum: ['Available', 'Reserved', 'Sold', 'Used'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
