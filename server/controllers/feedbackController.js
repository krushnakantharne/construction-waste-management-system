const Feedback = require('../models/Feedback');

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
