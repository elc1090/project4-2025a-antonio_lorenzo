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


const allowedOrigins = [
  'https://elc1090.github.io/project4-2025a-antonio_lorenzo'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

dotenv.config();

app.set('trust proxy', true);

// Configuração de rate limiting para a API do Google Places
const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições para o serviço de lugares. Tente novamente mais tarde.',
  skip: (req) => req.method === 'OPTIONS'
});

const pgSession = require('connect-pg-simple')(expressSession);

app.use(expressSession({
  store: new pgSession({
    conString: process.env.DATABASE_URL, // sua conexão PostgreSQL
    createTableIfMissing: true            // cria a tabela de sessão automaticamente
  }),
  secret: process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 dia
  }
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