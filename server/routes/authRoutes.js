const express = require('express');
const router = express.Router();
const { registerUser, adminRegisterUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Authenticated
router.get('/me', protect, getCurrentUser);

// Admin-only: create any user with any role (including admin)
router.post('/admin/register', protect, authorize('admin'), adminRegisterUser);

module.exports = router;
