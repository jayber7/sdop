const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

dotenv.config();

const app = express();

// Trust proxy headers (Render uses HTTPS externally, HTTP internally)
app.set('trust proxy', 1);

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'sdop-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Config
require('./config/passport')(passport);
require('./config/cloudinary');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gestion', require('./routes/gestionRoutes'));
app.use('/api/avances', require('./routes/avanceRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'SDOP API v1.0', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  });
});

module.exports = app;
