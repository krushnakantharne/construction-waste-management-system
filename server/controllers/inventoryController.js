const Inventory = require('../models/Inventory');
require('../models/Project');

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
