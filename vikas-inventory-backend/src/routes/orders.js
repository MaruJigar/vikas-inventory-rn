const express = require('express');
const pool = require('../db/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all orders (Role based filtering)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let query = 'SELECT o.*, s.name as shop_name, u.name as salesman_name FROM orders o JOIN shops s ON o.shop_id = s.id LEFT JOIN users u ON o.salesman_id = u.id';
    let params = [];

    if (role === 'distributor') {
      query += ' WHERE o.distributor_id = $1';
      params = [userId];
    } else if (role === 'salesman') {
      query += ' WHERE o.salesman_id = $1';
      params = [userId];
    }

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new order (with backorder logic)
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { shop_id, location_lat, location_lng, items } = req.body;
    const salesmanId = req.user.id;
    let distributorId = req.user.distributor_id;

    if (req.user.role !== 'salesman' && req.user.role !== 'distributor') {
         return res.status(403).json({ success: false, message: 'Only salesmen or distributors can create orders' });
    }
    
    if (req.user.role === 'distributor') {
        distributorId = req.user.id;
    }

    if (!distributorId) {
        throw new Error('Distributor ID is required to process order inventory');
    }

    // 1. Calculate total amount
    let totalAmount = 0;
    
    // 2. Insert Order
    const orderNumber = `ORD-${Date.now()}`;
    const newOrder = await client.query(
      'INSERT INTO orders (order_number, salesman_id, distributor_id, shop_id, total_amount, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [orderNumber, salesmanId, distributorId, shop_id, 0, location_lat, location_lng] // Temp total 0
    );
    const orderId = newOrder.rows[0].id;

    // 3. Process items and backorder logic
    for (let item of items) {
      const { product_id, quantity } = item;
      
      // Get product details
      const productRes = await client.query('SELECT price, discount FROM products WHERE id = $1', [product_id]);
      if (productRes.rowCount === 0) throw new Error(`Product ${product_id} not found`);
      const { price, discount } = productRes.rows[0];
      
      const itemTotal = (price - discount) * quantity;
      totalAmount += itemTotal;

      // Check distributor inventory
      const invRes = await client.query('SELECT available_stock FROM distributor_inventory WHERE product_id = $1 AND distributor_id = $2 FOR UPDATE', [product_id, distributorId]);
      
      let itemStatus = 'confirmed';
      let available = 0;
      
      if (invRes.rowCount > 0) {
          available = invRes.rows[0].available_stock;
      } else {
          // Create inventory record if it doesn't exist
          await client.query('INSERT INTO distributor_inventory (distributor_id, product_id, available_stock, reserved_stock) VALUES ($1, $2, 0, 0)', [distributorId, product_id]);
      }

      if (available >= quantity) {
          // Fully reserved
          await client.query('UPDATE distributor_inventory SET available_stock = available_stock - $1, reserved_stock = reserved_stock + $1 WHERE product_id = $2 AND distributor_id = $3', [quantity, product_id, distributorId]);
      } else if (available > 0) {
          // Partially reserved, partially backordered
          itemStatus = 'processing'; // indicating mixed state, or handle backorder splitting
          await client.query('UPDATE distributor_inventory SET available_stock = 0, reserved_stock = reserved_stock + $1 WHERE product_id = $2 AND distributor_id = $3', [available, product_id, distributorId]);
      } else {
          itemStatus = 'pending'; // Backordered
      }

      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, discount_at_time, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, product_id, quantity, price, discount, itemStatus]
      );
    }

    // 4. Update total amount
    await client.query('UPDATE orders SET total_amount = $1 WHERE id = $2', [totalAmount, orderId]);

    await client.query('COMMIT');
    res.status(201).json({ success: true, orderId: orderId, orderNumber: orderNumber });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Get order details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      
      const orderRes = await pool.query(`
        SELECT o.*, s.name as shop_name, s.address as shop_address, u.name as salesman_name, d.name as distributor_name
        FROM orders o 
        JOIN shops s ON o.shop_id = s.id 
        LEFT JOIN users u ON o.salesman_id = u.id
        LEFT JOIN users d ON o.distributor_id = d.id
        WHERE o.id = $1
      `, [id]);
  
      if (orderRes.rowCount === 0) return res.status(404).json({ success: false, message: 'Order not found' });
  
      const itemsRes = await pool.query(`
        SELECT oi.*, p.name as product_name, p.image_url 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $1
      `, [id]);
  
      res.status(200).json({ success: true, order: orderRes.rows[0], items: itemsRes.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update order status (Distributor Fulfillment)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { status } = req.body;
        
        if (req.user.role !== 'distributor' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update status' });
        }

        const orderCheck = await client.query('SELECT status, distributor_id FROM orders WHERE id = $1', [id]);
        if (orderCheck.rowCount === 0) throw new Error('Order not found');
        
        if (req.user.role === 'distributor' && orderCheck.rows[0].distributor_id !== req.user.id) {
             throw new Error('Not authorized to update this order');
        }

        const oldStatus = orderCheck.rows[0].status;

        // Inventory reduction logic on dispatch
        if (status === 'dispatched' && oldStatus !== 'dispatched') {
            const items = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
            const distributorId = orderCheck.rows[0].distributor_id;
            
            for (let item of items.rows) {
                // Reduce reserved stock since it's now dispatched
                await client.query(
                    'UPDATE distributor_inventory SET reserved_stock = GREATEST(0, reserved_stock - $1) WHERE product_id = $2 AND distributor_id = $3',
                    [item.quantity, item.product_id, distributorId]
                );
            }
        }

        const updated = await client.query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
        
        // Also update all item statuses for simplicity in this MVP
        await client.query('UPDATE order_items SET status = $1 WHERE order_id = $2', [status, id]);

        await client.query('COMMIT');
        res.status(200).json({ success: true, order: updated.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
