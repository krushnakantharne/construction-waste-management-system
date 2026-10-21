const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  materialName:     { type: String, required: true },
  materialType:     { type: String, required: true },
  quantity:         { type: Number, required: true, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  unit:             { type: String, required: true },
  condition:        { type: String },
  estimatedValue:   { type: Number },
  project:          { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sourceWaste:      { type: mongoose.Schema.Types.ObjectId, ref: 'Waste' },
  status:           { type: String, enum: ['Available', 'Reserved', 'Sold', 'Used'], default: 'Available' },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: quantity currently available for new requests
inventorySchema.virtual('availableQuantity').get(function () {
  return Math.max(0, this.quantity - (this.reservedQuantity || 0));
});

module.exports = mongoose.model('Inventory', inventorySchema);
