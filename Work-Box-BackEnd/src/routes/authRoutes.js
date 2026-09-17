import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const usuariosCadastrados = [];

const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.socket.remoteAddress;
  },
  handler: (req, res) => {
    const ipCliente = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    
    console.log(`\n🚨 [ALERTA DE SEGURANÇA] IP Bloqueado por Rate Limit: ${ipCliente}`);
    console.log(`🕒 Horário do Bloqueio: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`⚠️ Tentativa número 5 abortada (Limite de 4 tentativas excedido)\n`);
    
    return res.status(429).json({
      success: false,
      message: 'Bloqueio de Segurança: Limite de 4 tentativas excedido para este IP. Tente novamente em 30 minutos.'
    });
  }
});

router.post('/cadastro', (req, res) => {
  const { nome, email, senha, tipoUsuario } = req.body;

  const ipCliente = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  console.log(`\n📌 [NOVO CADASTRO] Recebido de IP: ${ipCliente}`);
  console.log(`👤 Nome: ${nome} | E-mail: ${email}`);

  usuariosCadastrados.push({ nome, email, senha, tipoUsuario });

  return res.status(201).json({
    success: true,
    message: 'Cadastro realizado com sucesso!'
  });
});

router.post('/login', loginLimiter, (req, res) => {
  const { email, senha } = req.body;

  const ipCliente = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  console.log(`\n📌 [TENTATIVA DE LOGIN] Recebida de IP: ${ipCliente}`);
  console.log(`📧 E-mail informado: ${email || 'Não informado'}`);

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