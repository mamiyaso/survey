const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // IP başına limit
});
app.use(limiter);

// CORS ayarları
app.use(cors({
  origin: 'http://localhost:3000', // Frontend'inizin çalıştığı URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);

// Error handling middleware
app.use(errorHandler);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));