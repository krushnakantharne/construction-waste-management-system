const mongoose = require('mongoose');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
require('../models/Project');
require('../models/User');

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
    const bodyData = { ...req.body, customer: req.user?._id };
    if (bodyData.sourceProject && !mongoose.Types.ObjectId.isValid(bodyData.sourceProject)) {
      delete bodyData.sourceProject;
    }
    if (bodyData.inventory && !mongoose.Types.ObjectId.isValid(bodyData.inventory)) {
      delete bodyData.inventory;
    }
    const request = new Request(bodyData);
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
