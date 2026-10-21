const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const dirs = ['config', 'controllers', 'middleware', 'models', 'routes', 'utils'];

dirs.forEach(dir => {
    fs.mkdirSync(path.join(serverDir, dir), { recursive: true });
});

const models = {
    'User.js': `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'siteManager', 'customer', 'recycler'], default: 'customer' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
`,
    'Project.js': `const mongoose = require('mongoose');

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
`,
    'Waste.js': `const mongoose = require('mongoose');

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
`,
    'Inventory.js': `const mongoose = require('mongoose');

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
`,
    'Request.js': `const mongoose = require('mongoose');

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
`,
    'Pickup.js': `const mongoose = require('mongoose');

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
`,
    'Transaction.js': `const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  category: { type: String },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
`,
    'Feedback.js': `const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  role: { type: String },
  feedbackType: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
`
};

Object.keys(models).forEach(model => {
    fs.writeFileSync(path.join(serverDir, 'models', model), models[model]);
});

console.log('Backend folders and models created.');
