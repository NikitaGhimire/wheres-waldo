import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../styles/NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Where's Waldo Game</Link>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            {userRole === 'author' && (
              <>
                <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
                <Link to="/upload" className="upload-btn">Upload Image</Link>
              </>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default NavBar;