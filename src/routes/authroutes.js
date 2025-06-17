const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
const passport = require('passport');
require('../config/passport');
const authController = require('../controllers/authControllers');


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/auth/success');
});


router.get('/success', authController.loginSuccess);
router.get('/logout', authController.logout);



// Registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email }});
    if (existingUser) {
      return res.status(400).json({ message: 'Email já registrado' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltando dados obrigatórios" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({ message: 'Usuário criado com sucesso', userId: user.id });
  } catch (error) {
    console.error(error);  // <<<<< log do erro no console do servidor
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email }});
    if (!user) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Senha inválida' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' , error: err.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // req.user.userId vem do token decodificado
        const user = await User.findByPk(req.user.userId, { attributes: ['id', 'name', 'email'] });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});


module.exports = router;
