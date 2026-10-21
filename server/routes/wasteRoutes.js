const express = require('express');
const router = express.Router();
const { getWaste, getWasteById, createWaste, updateWaste, deleteWaste } = require('../controllers/wasteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWaste).post(protect, createWaste);
router.route('/:id').get(protect, getWasteById).put(protect, updateWaste).delete(protect, deleteWaste);

module.exports = router;
