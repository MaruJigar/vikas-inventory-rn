const express = require('express');
const pool = require('../db/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all shops (Everyone can view, potentially filtered by some area logic later)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shops ORDER BY name ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new shop (Salesman, Distributor, Admin can all create)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, location_lat, location_lng } = req.body;
    const userId = req.user.id;

    // Optional: Duplicate detection could be added here before insert

    const newShop = await pool.query(
      'INSERT INTO shops (name, phone, address, location_lat, location_lng, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, phone, address, location_lat, location_lng, userId]
    );

    res.status(201).json({ success: true, shop: newShop.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Record a shop visit
router.post('/visit', authMiddleware, async (req, res) => {
  try {
    const { shop_id, visit_type, no_order_reason, notes, location_lat, location_lng } = req.body;
    const salesmanId = req.user.id;

    if (req.user.role !== 'salesman') {
        return res.status(403).json({ success: false, message: 'Only salesmen can record visits' });
    }

    if (visit_type === 'non_productive' && !no_order_reason) {
        return res.status(400).json({ success: false, message: 'Reason required for non-productive visits' });
    }

    const newVisit = await pool.query(
      'INSERT INTO shop_visits (salesman_id, shop_id, visit_type, no_order_reason, notes, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [salesmanId, shop_id, visit_type, no_order_reason, notes, location_lat, location_lng]
    );

    res.status(201).json({ success: true, visit: newVisit.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
