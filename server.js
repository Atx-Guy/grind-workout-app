const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
}

if (!process.env.SESSION_SECRET) {
    console.error('SESSION_SECRET environment variable is required');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const BCRYPT_ROUNDS = 10;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));
app.use(express.static('public'));

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const userId = uuidv4();

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
                [userId, email.toLowerCase(), passwordHash]
            );

            await client.query(
                'INSERT INTO user_profiles (user_id, equipment, setup_done) VALUES ($1, $2, $3)',
                [userId, JSON.stringify([]), false]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        req.session.userId = userId;
        req.session.email = email.toLowerCase();

        res.status(201).json({
            success: true,
            user: {
                id: userId,
                email: email.toLowerCase()
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await pool.query(
            'SELECT id, email, password_hash FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.email = user.email;

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, created_at FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

app.get('/api/users/:uid/equipment', requireAuth, async (req, res) => {
    try {
        if (req.params.uid !== req.session.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await pool.query(
            'SELECT equipment FROM user_profiles WHERE user_id = $1',
            [req.params.uid]
        );

        if (result.rows.length === 0) {
            return res.json({ equipment: [] });
        }

        res.json({
            equipment: result.rows[0].equipment || []
        });
    } catch (error) {
        console.error('Get equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

app.put('/api/users/:uid/equipment', requireAuth, async (req, res) => {
    try {
        if (req.params.uid !== req.session.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { equipment, setupDone } = req.body;

        await pool.query(
            `INSERT INTO user_profiles (user_id, equipment, setup_done, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id)
             DO UPDATE SET equipment = $2, setup_done = COALESCE($3, user_profiles.setup_done), updated_at = CURRENT_TIMESTAMP`,
            [req.params.uid, JSON.stringify(equipment || []), setupDone]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update equipment error:', error);
        res.status(500).json({ error: 'Failed to update equipment' });
    }
});

app.get('/api/users/:uid/profile', requireAuth, async (req, res) => {
    try {
        if (req.params.uid !== req.session.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await pool.query(
            `SELECT u.email, up.equipment, up.setup_done
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.id = $1`,
            [req.params.uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const row = result.rows[0];
        res.json({
            email: row.email,
            equipment: row.equipment || [],
            setupDone: row.setup_done || false
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

app.post('/api/users/:uid/history', requireAuth, async (req, res) => {
    try {
        if (req.params.uid !== req.session.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { workoutId, duration, completedAt } = req.body;

        if (!workoutId) {
            return res.status(400).json({ error: 'workoutId is required' });
        }

        const id = uuidv4();
        const completedTimestamp = completedAt ? new Date(completedAt) : new Date();

        await pool.query(
            'INSERT INTO workout_history (id, user_id, workout_id, duration, completed_at) VALUES ($1, $2, $3, $4, $5)',
            [id, req.params.uid, workoutId, duration || null, completedTimestamp]
        );

        res.status(201).json({
            success: true,
            id
        });
    } catch (error) {
        console.error('Add history error:', error);
        res.status(500).json({ error: 'Failed to add workout history' });
    }
});

app.get('/api/users/:uid/history', requireAuth, async (req, res) => {
    try {
        if (req.params.uid !== req.session.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await pool.query(
            `SELECT id, workout_id, duration, completed_at
             FROM workout_history
             WHERE user_id = $1
             ORDER BY completed_at DESC
             LIMIT 50`,
            [req.params.uid]
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
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get workout history' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
