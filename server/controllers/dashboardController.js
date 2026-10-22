const Project = require('../models/Project');
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
      const amt = typeof t.amount === 'number' && !isNaN(t.amount) ? t.amount : 0;
      if (t.type === 'Expense') totalCost += amt;
      if (t.type === 'Income') revenue += amt;
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
