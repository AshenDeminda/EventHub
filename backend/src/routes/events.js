const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all events for the authenticated user
router.get('/', eventController.getEvents);

// Get events for a specific date
router.get('/date/:date', eventController.getEventsByDate);

// Create a new event
router.post('/', eventController.createEvent);

// Update an event
router.put('/:id', eventController.updateEvent);

// Delete an event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
