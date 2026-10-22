const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// List invoices (ownership handled in controller)
router.get('/', protect, getInvoices);

// Invoice detail
router.get('/:id', protect, getInvoiceById);

module.exports = router;
