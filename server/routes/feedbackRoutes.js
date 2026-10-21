const express = require('express');
const router = express.Router();
const { getFeedback, createFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: Authenticated users can submit and view their own feedback.
// Only staff can view all feedback or update feedback status.
router.route('/')
  .get(protect, authorize('admin', 'siteManager'), getFeedback)
  .post(protect, createFeedback);       // any authenticated user can submit

router.route('/:id/status')
  .put(protect, authorize('admin', 'siteManager'), updateFeedbackStatus);

module.exports = router;
