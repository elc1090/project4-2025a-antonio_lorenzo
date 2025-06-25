const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.loginSuccess = (req, res) => {
  if (!req.user) return res.redirect('/');
  res.status(200).json({ success: true, message: "Login bem-sucedido", user: req.user });
};


exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};


exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'Usuário criado', user });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};
