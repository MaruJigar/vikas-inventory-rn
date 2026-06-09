const express = require('express');
const pool = require('../db/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all products (Everyone can view, but maybe distributors only see active ones)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query = 'SELECT * FROM products';
    
    if (role !== 'admin') {
      query += ' WHERE is_active = true';
    }
    
    query += ' ORDER BY name ASC';

    const result = await pool.query(query);
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new product (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can create products' });
    }

    const { name, description, price, discount, image_url, is_active } = req.body;

    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, discount, image_url, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, discount || 0, image_url, is_active !== false]
    );

    res.status(201).json({ success: true, product: newProduct.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a product (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can update products' });
    }

    const { id } = req.params;
    const { name, description, price, discount, image_url, is_active } = req.body;

    // Check if product exists
    const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, discount = $4, image_url = COALESCE($5, image_url), is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, description, price, discount, image_url, is_active, id]
    );

    res.status(200).json({ success: true, product: updatedProduct.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get distributor inventory for a specific product
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let distributorId = userId; // default if role is distributor
    
    if (req.user.role === 'salesman') {
        distributorId = req.user.distributor_id;
    }

    // Admin might want to see all or filter by distributor, not implemented for brevity
    
    const query = `
      SELECT p.id as product_id, p.name, p.price, p.discount, p.image_url, 
             COALESCE(di.available_stock, 0) as available_stock,
             COALESCE(di.reserved_stock, 0) as reserved_stock
      FROM products p
      LEFT JOIN distributor_inventory di ON p.id = di.product_id AND di.distributor_id = $1
      WHERE p.is_active = true
      ORDER BY p.name ASC
    `;

    const result = await pool.query(query, [distributorId]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
