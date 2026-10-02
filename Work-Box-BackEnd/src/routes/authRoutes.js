import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();
const usuariosCadastrados = [];

// --------------------------------------------------------------------------
// 🔒 1. CRIPTOGRAFIA EM REPOUSO (Data at Rest) - AES-256-GCM
// Criptografa dados sensíveis em repouso antes de armazenar na memória/banco
// --------------------------------------------------------------------------
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = crypto.scryptSync('workbox-chave-secreta-lgpd', 'salt-seguro', 32);

function encryptData(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

// --------------------------------------------------------------------------
// 🎭 2. MASCARAMENTO DE DADOS (Data Masking)
// Ofusca dados sensíveis para exibições seguras nos Logs do Render
// --------------------------------------------------------------------------
function maskSensitiveData(email, cpfCnpj, telefone) {
  const emailMascarado = email ? email.replace(/(.{2})(.*)(?=@)/, (g1, g2, g3) => g2 + '*'.repeat(g3.length)) : 'N/A';
  const cpfMascarado = cpfCnpj ? cpfCnpj.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, '$1.***.***-$2') : 'N/A';
  const telMascarado = telefone ? telefone.replace(/^(\(\d{2}\)\s)\d{4,5}-(\d{4})$/, '$1*****-$2') : 'N/A';
  
  return { emailMascarado, cpfMascarado, telMascarado };
}

// --------------------------------------------------------------------------
// 🔑 3. PRINCIPIO DO MENOR PRIVILÉGIO (Least Privilege - RBAC)
// Middleware de verificação de permissão por perfil de usuário
// --------------------------------------------------------------------------
function authorizeRoles(...rolesPermitidas) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || 'CLIENTE';

    if (!rolesPermitidas.includes(userRole)) {
      console.log(`⛔ [MENOR PRIVILÉGIO] Perfil '${userRole}' tentou acessar rota restrita.`);
      return res.status(403).json({
        success: false,
        message: 'Acesso Negado: Seu perfil não possui permissão para este recurso.'
      });
    }
    next();
  };
}

// --------------------------------------------------------------------------
// 🛡️️ RATE LIMITER (Disponibilidade)
// --------------------------------------------------------------------------
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

// --------------------------------------------------------------------------
// 📝 ROTA DE CADASTRO (Com Hashing Avançado, Criptografia e Mascaramento)
// --------------------------------------------------------------------------
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario, cpfCnpj, telefone } = req.body;
    const ipCliente = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

    // 🛑 VALIDAÇÃO DO LIMITE MÁXIMO DE 30 CARACTERES NO NOME
    if (nome && nome.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Validação incorreta: O campo Nome deve ter no máximo 30 caracteres.'
      });
    }

    // 🔑 4. HASHING DE SENHA ELABORADO (Bcrypt + Salt)
    const saltRounds = 10;
    const generatedSalt = await bcrypt.genSalt(saltRounds);
    const senhaHash = await bcrypt.hash(senha, generatedSalt);

    // 🔒 1. CRIPTOGRAFIA EM REPOUSO
    const cpfCnpjCriptografado = encryptData(cpfCnpj);
    const telefoneCriptografado = encryptData(telefone);

    // Salva no banco de dados / memória com dados protegidos
    usuariosCadastrados.push({ 
      nome, 
      email, 
      senha: senhaHash, 
      tipoUsuario: tipoUsuario || 'CLIENTE',
      cpfCnpj: cpfCnpjCriptografado,
      telefone: telefoneCriptografado
    });

    // 🎭 2. MASCARAMENTO NOS LOGS
    const { emailMascarado, cpfMascarado } = maskSensitiveData(email, cpfCnpj, telefone);
    
    console.log(`\n======================================================`);
    console.log(`📌 [NOVO CADASTRO PROTEGIDO] IP: ${ipCliente}`);
    console.log(`👤 Nome (${nome ? nome.length : 0} chars): ${nome} | E-mail: ${emailMascarado} | CPF: ${cpfMascarado}`);
    console.log(`------------------------------------------------------`);
    console.log(`🔑 [DEMONSTRAÇÃO DE HASHING DE SENHA]`);
    console.log(` ├─ Senha em Texto Puro Recebida : "${senha}"`);
    console.log(` ├─ Algoritmo Aplicado           : Bcrypt / Blowfish`);
    console.log(` ├─ Custo de Processamento (Cost): ${saltRounds} rounds`);
    console.log(` ├─ Salt Aleatório Gerado        : ${generatedSalt}`);
    console.log(` └─ Hash Final Resultante (Banco): ${senhaHash}`);
    console.log(`------------------------------------------------------`);
    console.log(`🔒 Dados sensíveis (CPF/Tel) cifrados com AES-256-GCM em repouso: ${cpfCnpjCriptografado}`);
    console.log(`======================================================\n`);

    return res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar cadastro.' });
  }
});

// --------------------------------------------------------------------------
// 🔐 ROTA DE LOGIN (Com Comparação Hash de Senha)
// --------------------------------------------------------------------------
router.post('/login', loginLimiter, async (req, res) => {
  const { email, senha } = req.body;
  const ipCliente = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

  const { emailMascarado } = maskSensitiveData(email);
  console.log(`\n📌 [TENTATIVA DE LOGIN] IP: ${ipCliente} | E-mail: ${emailMascarado}`);

  const usuarioEncontrado = usuariosCadastrados.find((user) => user.email === email);

  // Compara o hash seguro da senha
  const senhaValida = usuarioEncontrado ? await bcrypt.compare(senha, usuarioEncontrado.senha) : false;

  if (!usuarioEncontrado || !senhaValida) {
    console.log(`❌ [RESULTADO] Credenciais inválidas para o e-mail mascarado: ${emailMascarado}`);
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
    });
  }

  console.log(`✅ [RESULTADO] Login efetuado com sucesso para: ${emailMascarado}`);
  return res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    token: 'token-fake-workbox-jwt',
    user: { nome: usuarioEncontrado.nome, email: usuarioEncontrado.email, tipoUsuario: usuarioEncontrado.tipoUsuario }
  });
});

// --------------------------------------------------------------------------
// 👑 ROTA PROTEGIDA PELO PRINCIPIO DO MENOR PRIVILÉGIO
// Apenas usuários do tipo 'PROFISSIONAL' podem acessar esta rota
// --------------------------------------------------------------------------
router.get('/painel-profissional', authorizeRoles('PROFISSIONAL'), (req, res) => {
  return res.json({
    success: true,
    message: 'Bem-vindo ao Painel Restrito de Prestadores de Serviço WorkBox!'
  });
});

export default router;