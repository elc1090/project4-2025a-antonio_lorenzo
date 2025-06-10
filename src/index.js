const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/dataBase');
const authRoutes = require('./routes/authroutes');
const tripRoutes = require('./routes/tripRoutes');

dotenv.config();

const app = express();

app.use(cors());            
app.use(express.json());    

app.use('/auth', authRoutes);

app.use('/trips', tripRoutes);

// rota de teste
app.get('/', (req, res) => {
  res.send('API TripPlanner rodando!');
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    return sequelize.sync(); // Sincroniza os modelos com o banco de dados
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar com banco:', err);
  });
