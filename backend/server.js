import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/db.js';
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/video.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
