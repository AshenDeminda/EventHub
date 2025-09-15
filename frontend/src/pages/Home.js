import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>Event Scheduler</h1>
          <div className="nav-actions">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome to Event Scheduler</h2>
          <p>This is your dashboard. Here you can manage your events and schedule your activities.</p>
          
          <div className="placeholder-content">
            <h3>Coming Soon Features:</h3>
            <ul>
              <li>Create and manage events</li>
              <li>Calendar view</li>
              <li>Event notifications</li>
              <li>Event sharing</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
