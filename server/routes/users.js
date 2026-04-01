import express from 'express';
import { query } from '../db/init.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id, email, equipment, setup_done, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            equipment: user.equipment || [],
            setupDone: user.setup_done,
            createdAt: user.created_at
        });
    } catch (error) {
        next(error);
    }
});

router.put('/me/equipment', requireAuth, async (req, res, next) => {
    try {
        const { equipment } = req.body;

        await query(
            'UPDATE users SET equipment = $1, updated_at = NOW() WHERE id = $2',
            [equipment, req.userId]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.get('/me/history', requireAuth, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, workout_id, duration, completed_at 
             FROM workout_history 
             WHERE user_id = $1 
             ORDER BY completed_at DESC 
             LIMIT 50`,
            [req.userId]
        );

        res.json({
            history: result.rows.map(row => ({
                id: row.id,
                workoutId: row.workout_id,
                duration: row.duration,
                completedAt: row.completed_at
            }))
        });
    } catch (error) {
        next(error);
    }
});

router.post('/me/history', requireAuth, async (req, res, next) => {
    try {
        const { workoutId, duration, completedAt } = req.body;

        const result = await query(
            `INSERT INTO workout_history (user_id, workout_id, duration, completed_at)
             VALUES ($1, $2, $3, $4)
             RETURNING id, workout_id, duration, completed_at`,
            [req.userId, workoutId, duration, completedAt || new Date()]
        );

        res.status(201).json({
            id: result.rows[0].id,
            workoutId: result.rows[0].workout_id,
            duration: result.rows[0].duration,
            completedAt: result.rows[0].completed_at
        });
    } catch (error) {
        next(error);
    }
});

export default router;
