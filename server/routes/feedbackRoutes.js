const express = require('express');
const router = express.Router();
const { getFeedback, createFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// Anyone can create feedback, maybe? For now protect get
router.route('/').get(protect, getFeedback).post(createFeedback); // Assuming user can create without auth or with auth handled in controller
router.route('/:id/status').put(protect, updateFeedbackStatus);

module.exports = router;
