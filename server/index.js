import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import usersRouter from './routes/users.js';
import workoutsRouter from './routes/workouts.js';
import gatewaysRouter from './routes/gateways.js';

const app = express();
const PORT = process.env.PORT || 3000;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/gateways', gatewaysRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
