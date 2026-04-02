import express from 'express';
import Clerk from '@clerk/clerk-sdk-node';
import { pool } from '../index.js';

const router = express.Router();
const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    const token = authHeader.split(' ')[1];
    const session = await clerkClient.verifyToken(token);
    req.session = { userId: session.sub };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.session.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [req.params.userId]
    );
    if (userResult.rows.length === 0) {
      return res.json([]);
    }
    const result = await pool.query(
      'SELECT * FROM gateways WHERE user_id = $1 ORDER BY paired_at DESC',
      [userResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Gateway fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.session.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { gatewayId, gatewayName } = req.body;
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [req.params.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const result = await pool.query(
      `INSERT INTO gateways (user_id, gateway_id, gateway_name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (gateway_id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP
       RETURNING *`,
      [userResult.rows[0].id, gatewayId, gatewayName || gatewayId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Gateway pair error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:userId/:gatewayId', authMiddleware, async (req, res) => {
  try {
    if (req.session.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [req.params.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    await pool.query(
      'DELETE FROM gateways WHERE user_id = $1 AND gateway_id = $2',
      [userResult.rows[0].id, req.params.gatewayId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Gateway unpair error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
