const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let usuario = await Usuario.findOne({ email: profile.emails[0].value });

          if (!usuario) {
            usuario = await Usuario.create({
              nombre: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              rol: 'VISOR',
              activo: true,
            });
          } else {
            usuario.googleId = profile.id;
            usuario.isProfileComplete = true;
            await usuario.save();
          }

          done(null, usuario);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Usuario.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
