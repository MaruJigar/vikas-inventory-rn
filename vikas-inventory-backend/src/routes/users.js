const express = require('express');
const pool = require('../db/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get users based on role
router.get('/', authMiddleware, async (req, res) => {
    try {
        const role = req.user.role;
        let query = 'SELECT id, name, phone, role, approval_status, distributor_id, created_at FROM users';
        let params = [];

        if (role === 'admin') {
            // Admin sees all distributors and salesmen
            query += ' WHERE role IN ($1, $2) ORDER BY created_at DESC';
            params = ['distributor', 'salesman'];
        } else if (role === 'distributor') {
            // Distributor sees their own salesmen
            query += ' WHERE role = $1 AND distributor_id = $2 ORDER BY created_at DESC';
            params = ['salesman', req.user.id];
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const result = await pool.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user approval status (Admin approves distributors/salesmen, Distributor could theoretically approve their own salesmen but admin handles all in this MVP)
router.patch('/:id/approve', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admin can approve users' });
        }

        const { id } = req.params;
        const { status } = req.body; // 'approved', 'rejected', 'suspended'

        if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updatedUser = await pool.query(
            'UPDATE users SET approval_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, role, approval_status',
            [status, id]
        );

        if (updatedUser.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user: updatedUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
