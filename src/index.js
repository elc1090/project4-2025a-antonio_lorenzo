const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/dataBase');
const authRoutes = require('./routes/authroutes');
const tripRoutes = require('./routes/triproutes');
const passport = require('passport');
require('./config/passport');
const expressSession = require('express-session');
const placesRoutes = require('./routes/places');
const rateLimit = require('express-rate-limit'); // Adicione esta linha

const app = express();


const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};
app.use(cors(corsOptions));


app.use(express.json());

dotenv.config();

app.set('trust proxy', true);

// Configuração de rate limiting para a API do Google Places
const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP a cada 15 minutos
  message: 'Muitas requisições para o serviço de lugares, tente novamente mais tarde'
});

app.use(expressSession({
  secret: process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Aplica o rate limiting apenas nas rotas de places
app.use('/places', placesLimiter, placesRoutes);



app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API TripPlanner rodando!');
});

// Middleware de erro para capturar erros da API do Google
app.use((err, req, res, next) => {
  if (err.message.includes('Google API')) {
    return res.status(500).json({ 
      message: 'Erro no serviço de lugares',
      error: err.message
    });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar com banco:', err);
  });