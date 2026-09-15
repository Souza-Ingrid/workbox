import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersDB } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'workbox_chave_secreta_super_segura_2026';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const registerUser = async (req, res) => {
  try {
    const { nome, email, telefone, cpfCnpj, cep, senha, tipoUsuario, categoria, atendimento24h, descricao } = req.body;

    if (!nome || !email || !telefone || !cpfCnpj || !cep || !senha || !tipoUsuario) {
      return res.status(400).json({ message: 'Dados incompletos ou inválidos.' });
    }

    if (!emailRegex.test(email) || !passwordRegex.test(senha)) {
      return res.status(400).json({ message: 'E-mail ou senha fora do padrão exigido.' });
    }

    const existingUser = usersDB.find(user => user.email === email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ message: 'Não foi possível concluir o cadastro com este e-mail.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(senha, salt);

    const newUser = {
      id: usersDB.length + 1,
      nome: String(nome).trim(),
      email: email.toLowerCase().trim(),
      telefone: String(telefone).trim(),
      cpfCnpj: String(cpfCnpj).trim(),
      cep: String(cep).trim(),
      tipoUsuario,
      categoria: tipoUsuario === 'PROFISSIONAL' ? String(categoria) : null,
      atendimento24h: tipoUsuario === 'PROFISSIONAL' ? String(atendimento24h) : null,
      descricao: tipoUsuario === 'PROFISSIONAL' ? String(descricao) : null,
      senha: passwordHash,
      createdAt: new Date()
    };

    usersDB.push(newUser);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: { id: newUser.id, nome: newUser.nome, email: newUser.email, tipoUsuario: newUser.tipoUsuario }
    });
  } catch (error) {
    console.error('Erro interno omitido na resposta:', error.message);
    return res.status(500).json({ message: 'Ocorreu um erro ao processar sua solicitação.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Credenciais ausentes.' });
    }

    const user = usersDB.find(u => u.email === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, tipoUsuario: user.tipoUsuario },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      message: 'Autenticado com sucesso.',
      token,
      user: { id: user.id, nome: user.nome, email: user.email, tipoUsuario: user.tipoUsuario }
    });
  } catch (error) {
    console.error('Erro interno omitido na resposta:', error.message);
    return res.status(500).json({ message: 'Ocorreu um erro ao processar sua solicitação.' });
  }
};