import React from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate(); // Initialize useHistory for redirecting

  // Handle logout
  const handleLogout = () => {
    // Remove the token from localStorage to log out the user
    localStorage.removeItem('token');

    // Redirect to login page
    navigate('/loginPage');
  };
  return (
    <header>
      <img className="logo" src="./nikitalogo.png" alt="waldo" />
      <div className="home-btns">
        {/* Conditionally render Login or Logout button */}
        {localStorage.getItem('token') ? (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/loginPage">
              <button className="login-button">Login</button>
            </Link>
            <Link to="/register">
              <button className="register-button">Register</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
