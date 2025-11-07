import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Calendar from '../components/Calendar';
import EventModal from '../components/EventModal';
import '../styles/Events.css';

const Events = () => {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const navigate = useNavigate();

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
      fetchEvents();
    }
  }, [user, currentDate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Sort events by date and time
      const sortedEvents = response.data.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        // If same date, sort by time
        return a.time.localeCompare(b.time);
      });
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleAddEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending event data:', eventData);
      
      if (eventData._id) {
        // Update existing event
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/events/${eventData._id}`,
          eventData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('Event updated successfully:', response.data);
      } else {
        // Create new event
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/events`,
          eventData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('Event created successfully:', response.data);
      }
      
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save event. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/events/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const navigateMonth = (direction) => {
    const newOffset = currentMonthOffset + direction;
    
    // Limit navigation to -1 (past month), 0 (current), 1 (next month)
    if (newOffset < -1 || newOffset > 1) return;
    
    setCurrentMonthOffset(newOffset);
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + newOffset);
    setCurrentDate(newDate);
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="events-container">
      <Navbar user={user} />

      <main className="events-main">
        <div className="calendar-navigation">
          <button 
            className="nav-arrow" 
            onClick={() => navigateMonth(-1)}
            disabled={currentMonthOffset <= -1}
          >
            ‹
          </button>
          <h2 className="month-title">{getMonthName()}</h2>
          <button 
            className="nav-arrow" 
            onClick={() => navigateMonth(1)}
            disabled={currentMonthOffset >= 1}
          >
            ›
          </button>
        </div>

        <Calendar 
          currentDate={currentDate}
          onDateClick={handleDateClick}
          events={events}
        />

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          events={getSelectedDateEvents()}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      </main>
    </div>
  );
};

export default Events;
