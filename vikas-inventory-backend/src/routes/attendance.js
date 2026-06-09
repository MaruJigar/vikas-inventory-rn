const express = require('express');
const pool = require('../db/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Salesman checks in for the day
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { location_lat, location_lng } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (req.user.role !== 'salesman') {
      return res.status(403).json({ success: false, message: 'Only salesmen can check in' });
    }

    // Check if already checked in today
    const existingLog = await pool.query(
      'SELECT id FROM attendance_logs WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existingLog.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const checkInTime = new Date();

    const newLog = await pool.query(
      'INSERT INTO attendance_logs (user_id, date, check_in_time, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, today, checkInTime, location_lat, location_lng]
    );

    res.status(201).json({ success: true, log: newLog.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Salesman checks out for the day
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { location_lat, location_lng } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Find today's log
    const existingLog = await pool.query(
      'SELECT id, check_out_time FROM attendance_logs WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existingLog.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Not checked in today' });
    }

    if (existingLog.rows[0].check_out_time) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    const checkOutTime = new Date();

    const updatedLog = await pool.query(
      'UPDATE attendance_logs SET check_out_time = $1, location_lat = COALESCE($2, location_lat), location_lng = COALESCE($3, location_lng) WHERE id = $4 RETURNING *',
      [checkOutTime, location_lat, location_lng, existingLog.rows[0].id]
    );

    res.status(200).json({ success: true, log: updatedLog.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance logs (Admin sees all, Distributor sees their salesmen, Salesman sees own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let query = '';
    let params = [];

    if (role === 'admin') {
      // Admin sees everyone's attendance
      query = `
        SELECT a.*, u.name as salesman_name 
        FROM attendance_logs a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.date DESC, a.check_in_time DESC
      `;
    } else if (role === 'distributor') {
      // Distributor sees their salesmen's attendance
      query = `
        SELECT a.*, u.name as salesman_name 
        FROM attendance_logs a
        JOIN users u ON a.user_id = u.id
        WHERE u.distributor_id = $1
        ORDER BY a.date DESC, a.check_in_time DESC
      `;
      params = [userId];
    } else if (role === 'salesman') {
      // Salesman sees own attendance
      query = `
        SELECT a.* 
        FROM attendance_logs a
        WHERE a.user_id = $1
        ORDER BY a.date DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
