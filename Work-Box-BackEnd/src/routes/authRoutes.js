import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 4, 
  message: {
    success: false,
    message: 'Bloqueio de Segurança: Limite de 4 tentativas excedido para este IP. Tente novamente em 30 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log(`\n🚨 [ALERTA DE SEGURANÇA] IP Bloqueado por Rate Limit: ${req.ip}`);
    console.log(`🕒 Horário do Bloqueio: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`⚠️ Tentativa número 5 abortada (Limite: 4)\n`);
    res.status(429).json(options.message);
  }
});

router.post('/cadastro', (req, res) => {
  const { nome, email, senha, tipoUsuario } = req.body;

  console.log(`\n📌 [NOVO CADASTRO] Recebido de IP: ${req.ip}`);
  console.log(`👤 Nome: ${nome || 'Não informado'} | E-mail: ${email || 'Não informado'} (${tipoUsuario || 'CLIENTE'})`);

  return res.status(201).json({
    success: true,
    message: 'Cadastro realizado com sucesso!'
  });
});

router.post('/login', loginLimiter, (req, res) => {
  const { email, senha } = req.body;

  console.log(`\n📌 [TENTATIVA DE LOGIN] Recebida de IP: ${req.ip}`);
  console.log(`📧 E-mail informado: ${email || 'Não informado'}`);

  const usuarioValido = false; 

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