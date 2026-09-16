import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://workbox-wvyh.onrender.com',
    'https://workbox-fawn.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições originadas deste IP. Tente novamente mais tarde.' }
});

app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));

const frontEndPath = path.join(__dirname, '../../Work-Box-FrontEnd');
app.use(express.static(frontEndPath));

app.use('/api/auth', authRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontEndPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor WorkBox rodando na porta ${PORT}`);
});