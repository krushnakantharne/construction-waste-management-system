const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');

const files = {
    'config/db.js': `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cwms');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;
`,
    'middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
`,
    'middleware/roleMiddleware.js': `const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: \`User role \${req.user.role} is not authorized\` });
    }
    next();
  };
};

module.exports = { authorize };
`,
    'middleware/errorMiddleware.js': `const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
`,
    'controllers/authController.js': `const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { registerUser, loginUser, getCurrentUser };
`,
    'routes/authRoutes.js': `const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;
`,
    'controllers/projectController.js': `const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const projects = await Project.find(query);
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) res.json(project);
    else res.status(404).json({ message: 'Project not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProject = async (req, res) => {
  try {
    const project = new Project({ ...req.body, createdBy: req.user._id });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (project) res.json(project);
    else res.status(404).json({ message: 'Project not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else { res.status(404).json({ message: 'Project not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
`,
    'routes/projectRoutes.js': `const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;
`,
    'controllers/wasteController.js': `const Waste = require('../models/Waste');

const getWaste = async (req, res) => {
  try {
    let query = {};
    if (req.query.wasteType) query.wasteType = req.query.wasteType;
    if (req.query.project) query.project = req.query.project;
    
    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await Waste.countDocuments(query);
    const waste = await Waste.find(query).populate('project', 'name').skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({ waste, page, pages: Math.ceil(count / limit), total: count });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getWasteById = async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id).populate('project', 'name');
    if (waste) res.json(waste);
    else res.status(404).json({ message: 'Waste record not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createWaste = async (req, res) => {
  try {
    const waste = new Waste({ ...req.body, createdBy: req.user._id });
    const createdWaste = await waste.save();
    res.status(201).json(createdWaste);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateWaste = async (req, res) => {
  try {
    const waste = await Waste.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (waste) res.json(waste);
    else res.status(404).json({ message: 'Waste not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteWaste = async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);
    if (waste) {
      await waste.deleteOne();
      res.json({ message: 'Waste removed' });
    } else { res.status(404).json({ message: 'Waste not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getWaste, getWasteById, createWaste, updateWaste, deleteWaste };
`,
    'routes/wasteRoutes.js': `const express = require('express');
const router = express.Router();
const { getWaste, getWasteById, createWaste, updateWaste, deleteWaste } = require('../controllers/wasteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWaste).post(protect, createWaste);
router.route('/:id').get(protect, getWasteById).put(protect, updateWaste).delete(protect, deleteWaste);

module.exports = router;
`,
    'controllers/inventoryController.js': `const Inventory = require('../models/Inventory');

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).populate('project', 'name');
    res.json(inventory);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('project', 'name');
    if (inventory) res.json(inventory);
    else res.status(404).json({ message: 'Inventory item not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createInventory = async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    const createdInventory = await inventory.save();
    res.status(201).json(createdInventory);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (inventory) res.json(inventory);
    else res.status(404).json({ message: 'Inventory not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (inventory) {
      await inventory.deleteOne();
      res.json({ message: 'Inventory removed' });
    } else { res.status(404).json({ message: 'Inventory not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getInventory, getInventoryById, createInventory, updateInventory, deleteInventory };
`,
    'routes/inventoryRoutes.js': `const express = require('express');
const router = express.Router();
const { getInventory, getInventoryById, createInventory, updateInventory, deleteInventory } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getInventory).post(protect, createInventory);
router.route('/:id').get(protect, getInventoryById).put(protect, updateInventory).delete(protect, deleteInventory);

module.exports = router;
`,
    'controllers/requestController.js': `const Request = require('../models/Request');
const Inventory = require('../models/Inventory');

const getRequests = async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const requests = await Request.find(query).populate('customer', 'name email').populate('sourceProject', 'name');
    res.json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('customer', 'name email').populate('sourceProject', 'name');
    if (request) res.json(request);
    else res.status(404).json({ message: 'Request not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createRequest = async (req, res) => {
  try {
    const request = new Request({ ...req.body, customer: req.user._id });
    const createdRequest = await request.save();
    res.status(201).json(createdRequest);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status, inventoryId } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (status === 'Approved') {
      const inventory = await Inventory.findById(inventoryId || request.inventory);
      if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
      if (inventory.quantity < request.quantity) {
        return res.status(400).json({ message: 'Insufficient inventory quantity' });
      }
      inventory.quantity -= request.quantity;
      if (inventory.quantity === 0) inventory.status = 'Used';
      await inventory.save();
      request.inventory = inventory._id;
    }

    request.status = status;
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getRequests, getRequestById, createRequest, updateRequestStatus };
`,
    'routes/requestRoutes.js': `const express = require('express');
const router = express.Router();
const { getRequests, getRequestById, createRequest, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRequests).post(protect, createRequest);
router.route('/:id').get(protect, getRequestById);
router.route('/:id/status').put(protect, updateRequestStatus);

module.exports = router;
`,
    'controllers/pickupController.js': `const Pickup = require('../models/Pickup');

const getPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({}).populate('request').populate('customer', 'name');
    res.json(pickups);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id).populate('request').populate('customer', 'name');
    if (pickup) res.json(pickup);
    else res.status(404).json({ message: 'Pickup not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createPickup = async (req, res) => {
  try {
    const pickup = new Pickup(req.body);
    const createdPickup = await pickup.save();
    res.status(201).json(createdPickup);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updatePickupStatus = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (pickup) {
      pickup.status = req.body.status;
      const updatedPickup = await pickup.save();
      res.json(updatedPickup);
    } else {
      res.status(404).json({ message: 'Pickup not found' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getPickups, getPickupById, createPickup, updatePickupStatus };
`,
    'routes/pickupRoutes.js': `const express = require('express');
const router = express.Router();
const { getPickups, getPickupById, createPickup, updatePickupStatus } = require('../controllers/pickupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPickups).post(protect, createPickup);
router.route('/:id').get(protect, getPickupById);
router.route('/:id/status').put(protect, updatePickupStatus);

module.exports = router;
`,
    'controllers/transactionController.js': `const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).populate('project', 'name');
    res.json(transactions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, createdBy: req.user._id });
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (transaction) res.json(transaction);
    else res.status(404).json({ message: 'Transaction not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) {
      await transaction.deleteOne();
      res.json({ message: 'Transaction removed' });
    } else { res.status(404).json({ message: 'Transaction not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
`,
    'routes/transactionRoutes.js': `const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;
`,
    'controllers/feedbackController.js': `const Feedback = require('../models/Feedback');

const getFeedback = async (req, res) => {
  try {
    const query = req.query.rating ? { rating: Number(req.query.rating) } : {};
    const feedback = await Feedback.find(query).populate('project', 'name');
    res.json(feedback);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createFeedback = async (req, res) => {
  try {
    const feedback = new Feedback({ ...req.body, user: req.user ? req.user._id : undefined });
    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (feedback) {
      feedback.status = req.body.status;
      const updatedFeedback = await feedback.save();
      res.json(updatedFeedback);
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getFeedback, createFeedback, updateFeedbackStatus };
`,
    'routes/feedbackRoutes.js': `const express = require('express');
const router = express.Router();
const { getFeedback, createFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// Anyone can create feedback, maybe? For now protect get
router.route('/').get(protect, getFeedback).post(createFeedback); // Assuming user can create without auth or with auth handled in controller
router.route('/:id/status').put(protect, updateFeedbackStatus);

module.exports = router;
`,
    'controllers/dashboardController.js': `const Project = require('../models/Project');
const Waste = require('../models/Waste');
const Inventory = require('../models/Inventory');
const Request = require('../models/Request');
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');

const getDashboardSummary = async (req, res) => {
  try {
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
    const scheduledPickups = await Pickup.countDocuments({ status: { $in: ['Scheduled', 'Out for Pickup'] } });
    
    const inventory = await Inventory.find({ status: 'Available' });
    const availableMaterials = inventory.reduce((acc, item) => acc + item.quantity, 0);

    const wasteRecords = await Waste.find();
    let totalWaste = 0;
    let reused = 0;
    let recycled = 0;
    let disposed = 0;

    wasteRecords.forEach(w => {
      totalWaste += w.quantity;
      if (w.treatment === 'Reuse' || w.treatment === 'Reused') reused += w.quantity;
      if (w.treatment === 'Recycle' || w.treatment === 'Recycled') recycled += w.quantity;
      if (w.treatment === 'Dispose' || w.treatment === 'Disposed') disposed += w.quantity;
    });

    const recoveryRate = totalWaste > 0 ? ((reused + recycled) / totalWaste) * 100 : 0;

    const transactions = await Transaction.find();
    let totalCost = 0;
    let revenue = 0;
    transactions.forEach(t => {
      if (t.type === 'Expense') totalCost += t.amount;
      if (t.type === 'Income') revenue += t.amount;
    });
    const netCost = totalCost - revenue;

    res.json({
      totalWaste,
      reused,
      recycled,
      disposed,
      recoveryRate,
      totalCost,
      revenue,
      netCost,
      activeProjects,
      pendingRequests,
      scheduledPickups,
      availableMaterials
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getDashboardSummary };
`,
    'routes/dashboardRoutes.js': `const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);

module.exports = router;
`,
    'controllers/reportController.js': `const Waste = require('../models/Waste');
const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');
const Project = require('../models/Project');

const getWasteReport = async (req, res) => {
  try {
    const waste = await Waste.find().populate('project', 'name');
    res.json(waste);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getFinancialReport = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('project', 'name');
    res.json(transactions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getInventoryReport = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('project', 'name');
    res.json(inventory);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProjectReport = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getWasteReport, getFinancialReport, getInventoryReport, getProjectReport };
`,
    'routes/reportRoutes.js': `const express = require('express');
const router = express.Router();
const { getWasteReport, getFinancialReport, getInventoryReport, getProjectReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/waste', protect, getWasteReport);
router.get('/financial', protect, getFinancialReport);
router.get('/inventory', protect, getInventoryReport);
router.get('/projects', protect, getProjectReport);

module.exports = router;
`,
    'server.js': `const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/waste', require('./routes/wasteRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/pickups', require('./routes/pickupRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`
};

Object.keys(files).forEach(file => {
    fs.writeFileSync(path.join(serverDir, file), files[file]);
});

console.log('Backend files created successfully.');
