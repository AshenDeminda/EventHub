import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const images = [
    require('../assets/images/2.png'),
    require('../assets/images/3.png'),
    require('../assets/images/7.png'),
    require('../assets/images/8.png'),
    require('../assets/images/9.png')
  ];

  const motivationalPhrases = [
    "Make today amazing! ✨",
    "Your day, your way! 🎉",
    "Today is full of possibilities! 🚀",
    "Seize the day! 🌟",
    "Make it happen today! 💫"
  ];

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTodayEvents();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const fetchTodayEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Filter events for today
      const todayStr = today.toISOString().split('T')[0];
      const filtered = response.data.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.toISOString().split('T')[0] === todayStr;
      });
      
      // Sort filtered events by time (earliest first)
      const sortedFiltered = filtered.sort((a, b) => a.time.localeCompare(b.time));
      
      setTodayEvents(sortedFiltered);
    } catch (error) {
      console.error('Error fetching today events:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <Navbar user={user} />

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Today's Events</h1>
            <p className="hero-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="motivational-text">{motivationalPhrases[currentImageIndex]}</p>
          </div>
          
          <div className="image-showcase">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Event ${index + 1}`}
                className={`showcase-image ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="events-section">
          {todayEvents.length > 0 ? (
            <div className="events-grid">
              {todayEvents.map((event, index) => (
                <div 
                  key={index} 
                  className="event-card-home"
                  onClick={() => handleEventClick(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="event-card-header-home">
                    <h3>{event.eventName}</h3>
                    <span className="event-time-badge">{event.time}</span>
                  </div>
                  <div className="event-details-home">
                    <p><span className="icon">📍</span> {event.venue}</p>
                    {event.location && <p><span className="icon">🗺️</span> {event.location}</p>}
                    {event.description && (
                      <p className="event-description-home">{event.description}</p>
                    )}
                  </div>
                  <div className="click-hint">Click for details</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <h3>No Events Today</h3>
              <p>You have a free day! Add some events to your calendar.</p>
              <button className="add-event-btn" onClick={() => navigate('/events')}>
                + Plan Your Day
              </button>
            </div>
          )}
        </div>

        {/* Event Details Modal */}
        {isModalOpen && selectedEvent && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content-home" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
              
              <div className="modal-header-home">
                <h2>{selectedEvent.eventName}</h2>
                <span className="event-time-badge-large">{selectedEvent.time}</span>
              </div>

              <div className="modal-body-home">
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">🕐</span>
                  <div className="detail-content">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{selectedEvent.time}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <div className="detail-content">
                    <span className="detail-label">Venue</span>
                    <span className="detail-value">{selectedEvent.venue}</span>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="detail-row">
                    <span className="detail-icon">🗺️</span>
                    <div className="detail-content">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{selectedEvent.location}</span>
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="detail-row">
                    <span className="detail-icon">📝</span>
                    <div className="detail-content">
                      <span className="detail-label">Description</span>
                      <span className="detail-value">{selectedEvent.description}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer-home">
                <button className="close-modal-btn" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
