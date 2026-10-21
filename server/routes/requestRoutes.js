const express = require('express');
const router = express.Router();
const { getRequests, getRequestById, createRequest, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRequests).post(protect, createRequest);
router.route('/:id').get(protect, getRequestById);
router.route('/:id/status').put(protect, updateRequestStatus);

module.exports = router;
