const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id); // usa o ID do Sequelize
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: '***REMOVED***',
  clientSecret: '***REMOVED***',
  callbackURL: 'http://localhost:3000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verifica se já existe um usuário com esse Google ID
    let user = await User.findOne({ where: { googleId: profile.id } });

    if (!user) {
      // Se não, tenta encontrar pelo email (caso o usuário já tenha cadastro manual)
      user = await User.findOne({ where: { email: profile.emails[0].value } });

      if (user) {
        // Se existe, associa o googleId
        user.googleId = profile.id;
        await user.save();
      } else {
        // Cria novo usuário com dados do Google
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          passwordHash: null // não precisa de senha
        });
      }
    }

    return done(null, user);
  } catch (err) {
    console.error('Erro na autenticação com Google:', err);
    return done(err, null);
  }
}));
