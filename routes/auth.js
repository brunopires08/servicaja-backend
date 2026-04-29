const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'servicaja_secret_2026';

let usuarios = [];

// POST /auth/cadastro
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado!' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id: usuarios.length + 1,
      nome,
      email,
      senha: senhaCriptografada,
      tipo,
    };

    usuarios.push(novoUsuario);

    const token = jwt.sign(
      { id: novoUsuario.id, email, tipo },
      SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensagem: 'Cadastro realizado!',
      token,
      usuario: { id: novoUsuario.id, nome, email, tipo }
    });

  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos!' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
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
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;