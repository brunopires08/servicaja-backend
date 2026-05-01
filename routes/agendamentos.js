const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../database');

const SECRET = 'servicaja_secret_2026';

// Middleware — verifica se o usuário está logado
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido!' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido!' });
  }
}

// POST /agendamentos — cria novo agendamento
router.post('/', verificarToken, async (req, res) => {
  try {
    const { prestadorNome, servico, data, hora, preco } = req.body;

    const resultado = await pool.query(
      `INSERT INTO agendamentos 
       (usuario_id, prestador_nome, servico, data, hora, preco, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendente')
       RETURNING *`,
      [req.usuario.id, prestadorNome, servico, data, hora, preco]
    );

    res.status(201).json({
      mensagem: 'Agendamento criado!',
      agendamento: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /agendamentos — lista agendamentos do usuário
router.get('/', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT * FROM agendamentos 
       WHERE usuario_id = $1 
       ORDER BY criado_em DESC`,
      [req.usuario.id]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// PATCH /agendamentos/:id/cancelar
router.patch('/:id/cancelar', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `UPDATE agendamentos SET status = 'cancelado'
       WHERE id = $1 AND usuario_id = $2
       RETURNING *`,
      [req.params.id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado!' });
    }

    res.json({
      mensagem: 'Agendamento cancelado!',
      agendamento: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;