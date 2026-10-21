const express = require('express');
const router = express.Router();
const { getWasteReport, getFinancialReport, getInventoryReport, getProjectReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWasteReport);
router.get('/waste', protect, getWasteReport);
router.get('/financial', protect, getFinancialReport);
router.get('/inventory', protect, getInventoryReport);
router.get('/projects', protect, getProjectReport);

module.exports = router;
