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

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/callback?token=${token}`);
  }
);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ status: 'success', data: req.usuario });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ status: 'success', message: 'Sesión cerrada' });
});

module.exports = router;
