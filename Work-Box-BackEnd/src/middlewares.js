import rateLimit from 'express-rate-limit';

// Limitador Rígido para Login (Proteção contra Força Bruta)
export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 3, // Máximo de 3 tentativas por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[DISPONIBILIDADE / SEGURANÇA CID] IP ${req.ip} bloqueado após 3 tentativas de login.`);

    return res.status(429).json({
      message: 'Você atingiu o limite de 3 tentativas seguidas. Por motivos de segurança, seu acesso foi bloqueado por 30 minutos.'
    });
  }
});