// database.js
// Conexão com o PostgreSQL

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'servicaja',
  password: 'admin123',
  port: 5432,
});

pool.connect()
  .then(() => console.log('✅ Banco de dados conectado!'))
  .catch(err => console.error('❌ Erro no banco:', err.message));

module.exports = pool;