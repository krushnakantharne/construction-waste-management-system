const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryById,
  getMovements,
  createInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: All authenticated users can read inventory.
router.route('/')
  .get(protect, getInventory)
  .post(protect, authorize('admin', 'siteManager'), createInventory);

// Stock movement history — staff only (contains operational detail)
router.get('/:id/movements', protect, authorize('admin', 'siteManager', 'recycler'), getMovements);

router.route('/:id')
  .get(protect, getInventoryById)
  .put(protect, authorize('admin', 'siteManager'), updateInventory)
  .delete(protect, authorize('admin'), deleteInventory);

module.exports = router;
