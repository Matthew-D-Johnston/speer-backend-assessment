const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./utils/errorHandlers');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();

const apiLimiter = rateLimit({
  windowMs: 10000,
  max: 2,
  message: 'Too many requests, please try again later.'
});

// Middleware
app.use('/api/', apiLimiter);
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Error handling middleware
app.use(errorHandler.notFound);
app.use(errorHandler.generic);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
