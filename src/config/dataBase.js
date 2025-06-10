const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nome do banco
  process.env.DB_USER,     // Usuário
  process.env.DB_PASSWORD, // Senha
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false, // ou console.log para ver as queries
  }
);

module.exports = sequelize;
