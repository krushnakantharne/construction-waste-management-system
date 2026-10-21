const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  wasteType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  generatedDate: { type: Date, default: Date.now },
  constructionActivity: { type: String },
  classification: { type: String },
  treatment: { type: String },
  status: { type: String, enum: ['Pending', 'Processed', 'Disposed', 'Recycled'], default: 'Pending' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Waste', wasteSchema);
