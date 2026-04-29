const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const agendamentosRoutes = require('./routes/agendamentos');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/agendamentos', agendamentosRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    mensagem: 'Servidor ServicaJá funcionando! 🚀',
    versao: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});