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

// Configuração Avançada do CORS para aceitar requisições da Vercel e do Localhost
app.use(cors({
  origin: [
    'https://workbox-fawn.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Limitador Global de Requisições
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições originadas deste IP. Tente novamente mais tarde.' }
});

app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));

// Servir arquivos estáticos do Front-End (para rodar localmente)
app.use(express.static(path.join(__dirname, '../../Work-Box-FrontEnd')));

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota Fallback para redirecionar requisições desconhecidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Work-Box-FrontEnd/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor WorkBox rodando em http://localhost:${PORT}`);
});