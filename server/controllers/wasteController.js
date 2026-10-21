const mongoose = require('mongoose');
const Project = require('../models/Project');
const Waste = require('../models/Waste');

const getWaste = async (req, res) => {
  try {
    let query = {};
    if (req.query.wasteType) query.wasteType = req.query.wasteType;
    if (req.query.project) query.project = req.query.project;
    
    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const count = await Waste.countDocuments(query);
    const waste = await Waste.find(query).populate('project', 'name').skip(skip).limit(limit).sort({ createdAt: -1 });

    // Prevent client-side caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
    let projectId = req.body.project;
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      let existingProj = await Project.findOne({ name: projectId });
      if (!existingProj) {
        existingProj = await Project.create({
          name: projectId,
          location: req.body.location || 'Site Location',
          createdBy: req.user?._id
        });
      }
      projectId = existingProj._id;
    }

    const wasteData = {
      project: projectId,
      wasteType: req.body.wasteType,
      quantity: Number(req.body.quantity),
      unit: req.body.unit || 'kg',
      generatedDate: req.body.date || req.body.generatedDate || new Date(),
      constructionActivity: req.body.activity || req.body.constructionActivity,
      treatment: req.body.method || req.body.treatment,
      status: req.body.status || 'Pending',
      notes: req.body.notes,
      createdBy: req.user?._id
    };

    const waste = new Waste(wasteData);
    const createdWaste = await waste.save();
    const populatedWaste = await Waste.findById(createdWaste._id).populate('project', 'name');
    res.status(201).json(populatedWaste);
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
