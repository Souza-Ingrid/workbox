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

// Limitador Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições originadas deste IP. Tente novamente mais tarde.' }
});

app.use(globalLimiter);
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Servir os arquivos estáticos do Front-End
app.use(express.static(path.join(__dirname, '../../Work-Box-FrontEnd')));

// Rotas da API
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor WorkBox rodando em http://localhost:${PORT}`);
});