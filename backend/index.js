import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import medRoutes from './routes/medicines.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', medRoutes);

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MedTrack backend is healthy' });
});

// Root endpoint
app.get('/', (req, res) => res.json({ status: 'MedTrack backend running' }));

// MongoDB connection
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medtrack';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

// Cron job for expiry alerts
cron.schedule('0 9 * * *', async () => {
  try {
    const Medicine = (await import('./models/Medicine.js')).default;
    const now = new Date();
    const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const list = await Medicine.find({ expiryDate: { $lte: soon } });
    if (list.length > 0)
      console.log('[Expiry Alert]', list.map(l => ({ id: l._id, name: l.name, expiry: l.expiryDate })));
  } catch (e) {
    console.error('Cron error', e);
  }
}, { timezone: 'Asia/Kolkata' });

// Start server
app.listen(PORT, () => console.log('MedTrack backend listening on', PORT));
