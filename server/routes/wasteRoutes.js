const express = require('express');
const router = express.Router();
const { getWaste, getWasteById, createWaste, updateWaste, deleteWaste } = require('../controllers/wasteController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: All authenticated users can read waste records.
// Customers (recyclers) can view but not create/delete waste records.
router.route('/')
  .get(protect, getWaste)
  .post(protect, authorize('admin', 'siteManager'), createWaste);

router.route('/:id')
  .get(protect, getWasteById)
  .put(protect, authorize('admin', 'siteManager'), updateWaste)
  .delete(protect, authorize('admin'), deleteWaste);

module.exports = router;
