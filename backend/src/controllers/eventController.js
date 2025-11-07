const Event = require('../models/Event');

// Get all events for a user
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { eventName, date, time, venue, location, description } = req.body;

    console.log('Creating event with data:', { eventName, date, time, venue, location, description });
    console.log('User ID:', req.user.id);

    // Validate required fields
    if (!eventName || !date || !time || !venue) {
      return res.status(400).json({ 
        message: 'Event name, date, time, and venue are required' 
      });
    }

    // Create new event
    const event = new Event({
      userId: req.user.id,
      eventName,
      date,
      time,
      venue,
      location,
      description
    });

    await event.save();
    console.log('Event created successfully:', event);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error while creating event',
      error: error.message 
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, date, time, venue, location, description } = req.body;

    // Find event and verify ownership
    const event = await Event.findOne({ _id: id, userId: req.user.id });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update fields
    if (eventName) event.eventName = eventName;
    if (date) event.date = date;
    if (time) event.time = time;
    if (venue) event.venue = venue;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete event (verify ownership)
    const event = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
};

// Get events for a specific date
exports.getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const events = await Event.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ time: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events by date:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};
