const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  projectType: { type: String },
  startDate: { type: Date },
  expectedCompletion: { type: Date },
  projectManager: { type: String },
  status: { type: String, enum: ['Active', 'Completed', 'On Hold', 'Planning'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
