const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/config');

const router = express.Router();

// Register a new user (Distributor or Salesman)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, distributor_id } = req.body;

    // Validate role
    if (!['distributor', 'salesman'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial status for distributor is pending. For salesman, also pending (admin must approve)
    const status = 'pending';

    const newUser = await pool.query(
      'INSERT INTO users (name, phone, password_hash, role, approval_status, distributor_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, phone, role, approval_status',
      [name, phone, passwordHash, role, status, distributor_id || null]
    );

    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check approval status
    if (user.approval_status !== 'approved' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: `Account is ${user.approval_status}. Please contact admin.` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        distributor_id: user.distributor_id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key', // Ensure JWT_SECRET is in .env
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            distributor_id: user.distributor_id
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Middleware to verify token (exporting it so other routes can use it)
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = { router, authMiddleware };
