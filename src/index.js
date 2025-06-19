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
const rateLimit = require('express-rate-limit');
const pgSession = require('connect-pg-simple')(expressSession);

dotenv.config();

const app = express();

app.set('trust proxy', 1);


const allowedOrigins = [
  'https://elc1090.github.io'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.use(expressSession({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições para o serviço de lugares. Tente novamente mais tarde.',
  skip: (req) => req.method === 'OPTIONS'
});

app.use('/places', placesLimiter, placesRoutes);


app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);


app.get('/', (req, res) => {
  res.send('API TripPlanner rodando!');
});


app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Google API')) {
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
