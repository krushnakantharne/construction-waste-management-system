const express = require('express');
const router = express.Router();
const { getWasteReport, getFinancialReport, getInventoryReport, getProjectReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: Waste and project reports available to all staff.
// Financial and inventory reports restricted to admin/siteManager only.
router.get('/', protect, authorize('admin', 'siteManager'), getWasteReport);
router.get('/waste', protect, authorize('admin', 'siteManager'), getWasteReport);
router.get('/financial', protect, authorize('admin', 'siteManager'), getFinancialReport);
router.get('/inventory', protect, authorize('admin', 'siteManager'), getInventoryReport);
router.get('/projects', protect, authorize('admin', 'siteManager'), getProjectReport);

module.exports = router;
