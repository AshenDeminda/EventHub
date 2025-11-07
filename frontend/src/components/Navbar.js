import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, showAuthButtons = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <h1 onClick={() => navigate('/home')}>EventHub</h1>
        <div className="nav-actions">
          {user ? (
            <>
              <button onClick={() => navigate('/events')} className="event-btn">
                +Event
              </button>
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : showAuthButtons ? (
            <>
              <button onClick={() => navigate('/signin')} className="nav-auth-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="nav-auth-btn signup">
                Sign Up
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
