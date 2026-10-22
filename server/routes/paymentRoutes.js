const express = require('express');
const router = express.Router();
const { getPayments, getPaymentById, createPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPayments);
router.get('/:id', protect, getPaymentById);
router.post('/', protect, createPayment);

module.exports = router;
