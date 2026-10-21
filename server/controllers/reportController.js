const Waste = require('../models/Waste');
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
