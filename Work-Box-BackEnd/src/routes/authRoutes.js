import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Array em memória para guardar os usuários cadastrados
const usuariosCadastrados = [];

// 1. Limitador de Taxa para Login (4 tentativas)
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
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

// 2. Rota de Cadastro
router.post('/cadastro', (req, res) => {
  const { nome, email, senha, tipoUsuario } = req.body;

  console.log(`\n📌 [NOVO CADASTRO] Recebido de IP: ${req.ip}`);
  console.log(`👤 Nome: ${nome} | E-mail: ${email}`);

  // Salva o usuário no array de memória
  usuariosCadastrados.push({ nome, email, senha, tipoUsuario });

  return res.status(201).json({
    success: true,
    message: 'Cadastro realizado com sucesso!'
  });
});

// 3. Rota de Login
router.post('/login', loginLimiter, (req, res) => {
  const { email, senha } = req.body;

  console.log(`\n📌 [TENTATIVA DE LOGIN] Recebida de IP: ${req.ip}`);
  console.log(`📧 E-mail informado: ${email || 'Não informado'}`);

  // Busca se o usuário existe com a mesma senha
  const usuarioEncontrado = usuariosCadastrados.find(
    (user) => user.email === email && user.senha === senha
  );

  if (!usuarioEncontrado) {
    console.log(`❌ [RESULTADO] Credenciais inválidas para: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
    });
  }

  console.log(`✅ [RESULTADO] Login efetuado com sucesso para: ${email}`);
  return res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    token: 'token-fake-workbox-jwt',
    user: { nome: usuarioEncontrado.nome, email: usuarioEncontrado.email }
  });
});

export default router;