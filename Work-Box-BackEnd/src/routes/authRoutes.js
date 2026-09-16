import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Limitador de Login configurado para 4 tentativas
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 4, // Permite 4 tentativas antes do bloqueio
  message: {
    success: false,
    message: 'Bloqueio de Segurança: Limite de 4 tentativas excedido para este IP. Tente novamente em 30 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Função executada quando o limite de 4 tentativas é estourado
  handler: (req, res, next, options) => {
    console.log(`\n🚨 [ALERTA DE SEGURANÇA] IP Bloqueado por Rate Limit: ${req.ip}`);
    console.log(`🕒 Horário do Bloqueio: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`⚠️ Tentativa número 5 abortada (Limite: 4)\n`);
    res.status(429).json(options.message);
  }
});

// Rota de Login com logs detalhados no terminal
router.post('/login', loginLimiter, (req, res) => {
  const { email, senha } = req.body;

  // Log no terminal a cada tentativa individual
  console.log(`\n📌 [TENTATIVA DE LOGIN] Recebida de IP: ${req.ip}`);
  console.log(`📧 E-mail informado: ${email || 'Não informado'}`);

  // Substitua pela lógica de autenticação do seu projeto:
  const usuarioValido = false; // Exemplo de falha de credenciais para teste

  if (!usuarioValido) {
    console.log(`❌ [RESULTADO] Credenciais inválidas para: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
    });
  }

  console.log(`✅ [RESULTADO] Login efetuado com sucesso para: ${email}`);
  return res.json({ success: true, message: 'Login realizado com sucesso!' });
});

export default router;