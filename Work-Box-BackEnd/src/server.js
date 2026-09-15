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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições originadas deste IP. Tente novamente mais tarde.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Servir o Front-End
app.use(express.static(path.join(__dirname, '../../Work-Box-FrontEnd')));
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor WorkBox rodando em http://localhost:${PORT}`);
});