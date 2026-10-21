const express = require('express');
const router = express.Router();
const { getPickups, getPickupById, createPickup, updatePickupStatus } = require('../controllers/pickupController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: All authenticated users can read pickups.
// Only staff can create or update pickup status.
router.route('/')
  .get(protect, getPickups)
  .post(protect, authorize('admin', 'siteManager', 'recycler'), createPickup);

router.route('/:id')
  .get(protect, getPickupById);

router.route('/:id/status')
  .put(protect, authorize('admin', 'siteManager', 'recycler'), updatePickupStatus);

module.exports = router;
