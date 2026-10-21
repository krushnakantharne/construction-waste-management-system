const express = require('express');
const router = express.Router();
const { getRequests, getRequestById, createRequest, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: All authenticated users can list/view their own requests (B5 filtering
//     is done inside the controller based on role).
router.route('/').get(protect, getRequests).post(protect, createRequest);
router.route('/:id').get(protect, getRequestById);

// B9: Only staff may change request status (approve / reject / complete).
router.route('/:id/status').put(protect, authorize('admin', 'siteManager', 'recycler'), updateRequestStatus);

module.exports = router;
