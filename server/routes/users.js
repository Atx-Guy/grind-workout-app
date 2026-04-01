import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = req.app.locals.pool;
        
        const result = await pool.query(
            'SELECT id, email, equipment, setup_done, created_at FROM users WHERE clerk_id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.put('/:userId/equipment', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { equipment } = req.body;
        
        if (!Array.isArray(equipment)) {
            return res.status(400).json({ error: 'Equipment must be an array' });
        }
        
        const pool = req.app.locals.pool;
        
        await pool.query(
            'UPDATE users SET equipment = $1, updated_at = NOW() WHERE clerk_id = $2',
            [JSON.stringify(equipment), userId]
        );
        
        res.json({ success: true, equipment });
    } catch (err) {
        console.error('Error updating equipment:', err);
        res.status(500).json({ error: 'Failed to update equipment' });
    }
});

router.get('/:userId/history', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = req.app.locals.pool;
        
        const result = await pool.query(
            `SELECT id, workout_id, duration_seconds, completed_at 
             FROM workout_history 
             WHERE user_id = $1 
             ORDER BY completed_at DESC 
             LIMIT 50`,
            [userId]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.post('/:userId/history', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { workoutId, duration } = req.body;
        
        if (!workoutId || !duration) {
            return res.status(400).json({ error: 'workoutId and duration required' });
        }
        
        const pool = req.app.locals.pool;
        
        const result = await pool.query(
            `INSERT INTO workout_history (user_id, workout_id, duration_seconds, completed_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, completed_at`,
            [userId, workoutId, duration]
        );
        
        res.json({ 
            success: true, 
            id: result.rows[0].id,
            completedAt: result.rows[0].completed_at
        });
    } catch (err) {
        console.error('Error saving history:', err);
        res.status(500).json({ error: 'Failed to save workout history' });
    }
});

export default router;
