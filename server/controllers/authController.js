const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Roles that cannot be self-assigned during public registration.
const PRIVILEGED_ROLES = ['admin'];

const generateToken = (id) => {
  // JWT_SECRET is guaranteed non-null/non-placeholder by server.js startup check.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// ── POST /api/auth/register (public) ─────────────────────────────────────────
// B10: Strips privileged roles supplied by the client.
// If you need to create an admin account, use POST /api/auth/admin/register
// (protected by authorize('admin')).
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Strip any privileged role the client tried to pass.
    const safeRole = PRIVILEGED_ROLES.includes(role) ? 'customer' : (role || 'customer');

    const user = await User.create({ name, email, password, role: safeRole });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── POST /api/auth/admin/register (admin only, enforced at route level) ───────
const adminRegisterUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: role || 'customer' });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { registerUser, adminRegisterUser, loginUser, getCurrentUser };

