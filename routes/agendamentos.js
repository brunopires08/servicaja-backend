// routes/agendamentos.js
// Rotas de agendamento — criar, listar, cancelar

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET = 'servicaja_secret_2026';

// Banco temporário em memória
let agendamentos = [];

// Middleware — verifica se o usuário está logado
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido!' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded; // salva os dados do usuário na requisição
    next(); // continua para a rota
  } catch {
    res.status(401).json({ erro: 'Token inválido!' });
  }
}

// POST /agendamentos — cria um novo agendamento
router.post('/', verificarToken, (req, res) => {
  const { prestadorNome, servico, data, hora, preco } = req.body;

  const novoAgendamento = {
    id: agendamentos.length + 1,
    usuarioId: req.usuario.id,
    prestadorNome,
    servico,
    data,
    hora,
    preco,
    status: 'pendente',
    criadoEm: new Date().toISOString(),
  };

  agendamentos.push(novoAgendamento);

  res.status(201).json({
    mensagem: 'Agendamento criado!',
    agendamento: novoAgendamento
  });
});

// GET /agendamentos — lista agendamentos do usuário logado
router.get('/', verificarToken, (req, res) => {
  const meusAgendamentos = agendamentos.filter(
    ag => ag.usuarioId === req.usuario.id
  );
  res.json(meusAgendamentos);
});

// PATCH /agendamentos/:id/cancelar — cancela um agendamento
router.patch('/:id/cancelar', verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  const ag = agendamentos.find(a => a.id === id && a.usuarioId === req.usuario.id);

  if (!ag) {
    return res.status(404).json({ erro: 'Agendamento não encontrado!' });
  }

  ag.status = 'cancelado';
  res.json({ mensagem: 'Agendamento cancelado!', agendamento: ag });
});

module.exports = router;