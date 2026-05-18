const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET || 'sdop-jwt-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5174').split(',')[0].trim();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  console.log('=== OAuth Callback Received ===');
  console.log('Query params:', Object.keys(req.query));
  console.log('Has code:', !!req.query.code);
  console.log('Has error:', req.query.error || 'none');
  
  passport.authenticate('google', { session: false }, (err, user, info) => {
    console.log('=== Passport Authenticate Result ===');
    console.log('Error:', err ? err.message : 'none');
    console.log('User:', user ? user.email : 'none');
    console.log('Info:', info ? JSON.stringify(info) : 'none');
    
    if (err) {
      console.error('OAuth error details:', err);
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_error&msg=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      console.error('No user returned from OAuth');
      return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
    }
    
    try {
      const token = generateToken(user);
      console.log('Token generated successfully for:', user.email);
      console.log('Redirecting to:', `${FRONTEND_URL}/auth/callback?token=***`);
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (tokenErr) {
      console.error('Token generation error:', tokenErr);
      res.redirect(`${FRONTEND_URL}/login?error=token_error`);
    }
  })(req, res, next);
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ status: 'success', data: req.usuario });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ status: 'success', message: 'Sesión cerrada' });
});

module.exports = router;
