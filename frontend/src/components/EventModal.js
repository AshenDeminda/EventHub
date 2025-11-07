import React, { useState, useEffect } from 'react';
import '../styles/EventModal.css';

const EventModal = ({ isOpen, onClose, selectedDate, events = [], onAddEvent, onDeleteEvent }) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    eventName: '',
    time: '',
    venue: '',
    description: '',
    location: ''
  });

  const images = [
    require('../assets/images/2.png'),
    require('../assets/images/3.png'),
    require('../assets/images/7.png'),
    require('../assets/images/8.png'),
    require('../assets/images/9.png')
  ];

  const cheerfulPhrases = [
    "Time to create something amazing! ✨",
    "Let's make memories happen! 🎉",
    "Your next adventure awaits! 🚀",
    "Plan something extraordinary! 🌟",
    "Make today count! 💫"
  ];

  useEffect(() => {
    if (isOpen && events.length === 0 && !isAddingEvent) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, events.length, isAddingEvent, images.length]);

  useEffect(() => {
    if (!isOpen) {
      setIsAddingEvent(false);
      setEditingEventId(null);
      setFormData({
        eventName: '',
        time: '',
        venue: '',
        description: '',
        location: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPast = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEventId) {
      // Update existing event
      onAddEvent({
        ...formData,
        date: selectedDate,
        _id: editingEventId
      });
      setEditingEventId(null);
    } else {
      // Create new event
      onAddEvent({
        ...formData,
        date: selectedDate
      });
    }
    setFormData({
      eventName: '',
      time: '',
      venue: '',
      description: '',
      location: ''
    });
    setIsAddingEvent(false);
  };

  const handleEditEvent = (event) => {
    setFormData({
      eventName: event.eventName,
      time: event.time,
      venue: event.venue,
      description: event.description || '',
      location: event.location || ''
    });
    setEditingEventId(event._id);
    setIsAddingEvent(true);
  };

  const handleMapClick = () => {
    // Placeholder for Google Maps integration
    alert('Google Maps integration - Coming soon!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>{formatDate(selectedDate)}</h2>
          <p className="date-status">{isPast() ? 'Past Day' : 'Plan Your Events'}</p>
        </div>

        <div className="modal-body">
          {events.length === 0 && !isAddingEvent ? (
            <div className="empty-event-state">
              <div className="image-slider">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Event ${index + 1}`}
                    className={`slider-image ${index === currentImageIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
              <h3>{cheerfulPhrases[currentImageIndex]}</h3>
              {!isPast() && (
                <button className="add-first-event-btn" onClick={() => setIsAddingEvent(true)}>
                  + Add Your First Event
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="events-list">
                {events
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event, index) => (
                  <div 
                    key={index} 
                    className="event-card"
                    onClick={() => !isPast() && handleEditEvent(event)}
                    style={{ cursor: isPast() ? 'default' : 'pointer' }}
                  >
                    <div className="event-card-header">
                      <h3>
                        {event.eventName}
                        {!isPast() && <span className="edit-icon">✏️</span>}
                      </h3>
                      <button 
                        className="delete-event-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event._id);
                        }}
                        title="Delete Event"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="event-details">
                      <p><span className="icon">🕐</span> {event.time}</p>
                      <p><span className="icon">📍</span> {event.venue}</p>
                      {event.location && <p><span className="icon">🗺️</span> {event.location}</p>}
                      {event.description && (
                        <p className="event-description">
                          <span className="icon">📝</span> {event.description}
                        </p>
                      )}
                    </div>
                    {!isPast() && (
                      <div className="edit-hint">Click to edit</div>
                    )}
                  </div>
                ))}
              </div>
              
              {!isPast() && !isAddingEvent && (
                <button 
                  className="add-another-event-btn" 
                  onClick={() => setIsAddingEvent(true)}
                >
                  + Add Another Event
                </button>
              )}
            </>
          )}

          {isAddingEvent && (
            <form className="event-form" onSubmit={handleSubmit}>
              <h3>{editingEventId ? 'Edit Event' : 'Create New Event'}</h3>
              
              <div className="form-group">
                <label><span className="icon">🎉</span> Event Name *</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                  placeholder="Birthday Party, Meeting, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label><span className="icon">🕐</span> Time *</label>
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                  <span className="time-icon">🕐</span>
                </div>
              </div>

              <div className="form-group">
                <label><span className="icon">📍</span> Venue *</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="Conference Room, Restaurant, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label><span className="icon">🗺️</span> Location</label>
                <div className="location-input-wrapper">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter location or use map"
                  />
                  <button 
                    type="button" 
                    className="map-btn"
                    onClick={handleMapClick}
                    title="Select from Google Maps"
                  >
                    <span className="map-icon">🗺️</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label><span className="icon">📝</span> Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us more about your event..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setIsAddingEvent(false);
                  setEditingEventId(null);
                  setFormData({
                    eventName: '',
                    time: '',
                    venue: '',
                    description: '',
                    location: ''
                  });
                }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingEventId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
