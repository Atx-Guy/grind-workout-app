import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

let pool = null;

export function initDb(databaseUrl) {
    if (!databaseUrl) {
        console.warn('DATABASE_URL not set, using mock database');
        return createMockPool();
    }

    pool = new Pool({ connectionString: databaseUrl });
    return pool;
}

export function getPool() {
    if (!pool) {
        throw new Error('Database not initialized. Call initDb first.');
    }
    return pool;
}

export async function query(text, params) {
    const client = await getPool().connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

export async function runMigrations() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    try {
        const sql = readFileSync(join(__dirname, 'init.sql'), 'utf8');
        await query(sql);
        console.log('Database migrations completed');
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
}

function createMockPool() {
    const mockData = {
        users: [],
        workout_history: []
    };

    pool = {
        connect: async () => ({
            query: async (text, params) => {
                if (text.includes('CREATE TABLE')) {
                    return { rows: [] };
                }
                if (text.includes('INSERT INTO users')) {
                    const id = mockData.users.length + 1;
                    mockData.users.push({ id, email: params[0], password_hash: params[1] });
                    return { rows: [{ id, email: params[0] }] };
                }
                if (text.includes('SELECT id FROM users WHERE email')) {
                    const user = mockData.users.find(u => u.email === params[0]);
                    return { rows: user ? [{ id: user.id }] : [] };
                }
                if (text.includes('SELECT * FROM users WHERE email')) {
                    const user = mockData.users.find(u => u.email === params[0]);
                    return { rows: user ? [user] : [] };
                }
                if (text.includes('SELECT id, email, equipment')) {
                    const user = mockData.users.find(u => u.id === params[0]);
                    return { rows: user ? [{ ...user, equipment: [], setup_done: false }] : [] };
                }
                if (text.includes('UPDATE users SET equipment')) {
                    return { rows: [] };
                }
                if (text.includes('INSERT INTO workout_history')) {
                    const id = mockData.workout_history.length + 1;
                    mockData.workout_history.push({ id, ...params });
                    return { rows: [{ id }] };
                }
                if (text.includes('SELECT id, workout_id')) {
                    return { rows: mockData.workout_history };
                }
                return { rows: [] };
            },
            release: () => {}
        })
    };

    return pool;
}

export default { initDb, query, runMigrations };
