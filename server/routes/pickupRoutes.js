const express = require('express');
const router = express.Router();
const { getPickups, getPickupById, createPickup, updatePickupStatus } = require('../controllers/pickupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPickups).post(protect, createPickup);
router.route('/:id').get(protect, getPickupById);
router.route('/:id/status').put(protect, updatePickupStatus);

module.exports = router;
