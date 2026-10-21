const mongoose = require('mongoose');
const Pickup = require('../models/Pickup');
require('../models/Request');
require('../models/User');

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
    const bodyData = { ...req.body };
    // customer from frontend form is a plain string name, not a User ObjectId — strip it
    if (bodyData.customer && !mongoose.Types.ObjectId.isValid(bodyData.customer)) {
      delete bodyData.customer;
    }
    const pickup = new Pickup(bodyData);
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
