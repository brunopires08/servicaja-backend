const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database');

const SECRET = 'servicaja_secret_2026';

// POST /auth/cadastro
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    // Verifica se já existe
    const existe = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado!' });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Salva no banco
    const resultado = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo',
      [nome, email, senhaCriptografada, tipo]
    );

    const usuario = resultado.rows[0];

    const token = jwt.sign(
      { id: usuario.id, email, tipo },
      SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensagem: 'Cadastro realizado!',
      token,
      usuario
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca no banco
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos!' });
    }

    const usuario = resultado.rows[0];

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha inválidos!' });
    }

    const token = jwt.sign(
      { id: usuario.id, email, tipo: usuario.tipo },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensagem: 'Login realizado!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;