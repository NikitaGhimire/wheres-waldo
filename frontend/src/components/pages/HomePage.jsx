import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-container">
      <h1>Welcome to the game</h1>
      <img src="./file.png" alt="" />
      <p><strong>Please log in or register to find Waldo.</strong></p>
      <div className="home-buttons">
        <Link to="/loginPage">
          <button className="login-button">Login</button>
        </Link>
        <Link to="/register">
          <button className="register-button">Register</button>
        </Link>
      </div>
    </div>
    );
};

export default HomePage;
