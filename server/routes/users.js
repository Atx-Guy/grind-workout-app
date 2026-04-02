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
    const result = await pool.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO users (clerk_id) VALUES ($1) RETURNING *',
        [req.params.userId]
      );
      return res.json(insertResult.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:userId/equipment', authMiddleware, async (req, res) => {
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
    const equipmentResult = await pool.query(
      'SELECT equipment FROM user_equipment WHERE user_id = $1',
      [userResult.rows[0].id]
    );
    res.json(equipmentResult.rows.map(r => r.equipment));
  } catch (error) {
    console.error('Equipment fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:userId/equipment', authMiddleware, async (req, res) => {
  try {
    if (req.session.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { equipment } = req.body;
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [req.params.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;
    await pool.query('DELETE FROM user_equipment WHERE user_id = $1', [userId]);
    for (const item of equipment) {
      await pool.query(
        'INSERT INTO user_equipment (user_id, equipment) VALUES ($1, $2)',
        [userId, item]
      );
    }
    res.json({ success: true, equipment });
  } catch (error) {
    console.error('Equipment update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
