require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({
  success: true,
  message: 'PrideConnect India API v1.0 — Safe space for the LGBTQ+ community',
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/discover', require('./routes/match'));
app.use('/api/messages', require('./routes/messages'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PrideConnect India running on port ${PORT}`));
