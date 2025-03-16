import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaBars, FaTimes, FaCrown, FaUser } from 'react-icons/fa';
import { useState } from 'react';
import '../styles/NavBar.css';

const NavBar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userRole, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
            navigate('/loginPage');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/" title="Home">
                    <FaHome className="home-icon" />
                </Link>
            </div>
            
            <button className="menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                {isAuthenticated ? (
                    <>
                        {userRole === 'author' && (
                            <>
                                <Link to="/dashboard" className="dashboard-btn" onClick={() => setIsMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link to="/upload" className="upload-btn" onClick={() => setIsMenuOpen(false)}>
                                    Upload Image
                                </Link>
                            </>
                        )}
                        <span className="user-role" title={`Role: ${userRole || 'User'}`}>
                            {userRole === 'author' ? (
                                <FaCrown className="role-icon crown" />
                            ) : (
                                <FaUser className="role-icon user" />
                            )}
                        </span>
                        <button 
                            className="logout-btn" 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <div className="auth-links">
                        <Link to="/loginPage" className="login-btn" onClick={() => setIsMenuOpen(false)}>
                            Login
                        </Link>
                        <Link to="/register" className="register-btn" onClick={() => setIsMenuOpen(false)}>
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;