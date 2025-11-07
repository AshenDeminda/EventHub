const express = require('express');
const authRoutes = require('./auth');
const eventRoutes = require('./events');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Auth routes
router.use('/auth', authRoutes);

// Event routes
router.use('/events', eventRoutes);

module.exports = router;
