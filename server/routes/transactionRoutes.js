const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: Financial data restricted to staff only.
router.route('/')
  .get(protect, authorize('admin', 'siteManager'), getTransactions)
  .post(protect, authorize('admin', 'siteManager'), createTransaction);

router.route('/:id')
  .put(protect, authorize('admin', 'siteManager'), updateTransaction)
  .delete(protect, authorize('admin'), deleteTransaction);

module.exports = router;
