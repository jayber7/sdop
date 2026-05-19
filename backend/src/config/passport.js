const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

module.exports = function (passport) {
  // Construir callbackURL con HTTPS para producción
  const backendUrl = process.env.NODE_ENV === 'production'
    ? 'https://sdop.onrender.com'
    : 'http://localhost:5001';

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${backendUrl}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('=== Google Profile Received ===');
          console.log('Profile ID:', profile.id);
          console.log('Display Name:', profile.displayName);
          console.log('Emails:', profile.emails ? profile.emails.map(e => e.value) : 'none');
          console.log('Photos:', profile.photos ? profile.photos[0]?.value : 'none');
          
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          if (!email) {
            console.error('No email found in Google profile');
            return done(new Error('No email found in Google profile'), null);
          }

          console.log('Looking for user with email:', email);
          let usuario = await Usuario.findOne({ email });

          if (!usuario) {
            console.log('Creating new user:', email);
            usuario = await Usuario.create({
              nombre: profile.displayName,
              email,
              googleId: profile.id,
              rol: 'VISOR',
              activo: true,
            });
            console.log('User created successfully:', usuario._id);
          } else {
            console.log('Existing user found:', usuario._id);
            usuario.googleId = profile.id;
            usuario.activo = true;
            await usuario.save();
            console.log('User updated successfully');
          }

          done(null, usuario);
        } catch (error) {
          console.error('Google OAuth callback error:', error.message);
          console.error('Stack:', error.stack);
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
