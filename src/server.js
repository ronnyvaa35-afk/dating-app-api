require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

// Security headers (important for mobile API)
app.use(helmet());

// Gzip — reduces payload size for mobile data
app.use(compression());

app.use(cors());
app.use(express.json({ limit: '10kb' })); // prevent oversized JSON payloads

// Serve uploaded photos statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting — auth endpoints are stricter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 2 req/sec average — comfortable for mobile
  message: { success: false, message: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', apiLimiter);

// Health check — used by mobile to test connectivity
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', ts: Date.now() }));

app.get('/', (req, res) => res.json({
  success: true,
  app: 'PrideConnect India',
  version: '1.0.0',
  platforms: ['android', 'ios'],
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/discover', require('./routes/match'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/upload', require('./routes/upload'));

// Global error handler — always returns JSON (never HTML) so mobile can parse it
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PrideConnect India running on port ${PORT}`));
