import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // To store error messages
  const [loading, setLoading] = useState(false); // To show loading state
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading state when starting login
    setError(null);    // Clear any previous errors
    try {
      const response = await axios.post(`http://localhost:5001/login`, { username, password });
      console.log(response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token); // Store token on successful login
      localStorage.setItem('role', user.role); // Store the role
      localStorage.setItem('userId', user.id); //store author id
      
      // Verify the token and role are stored
      console.log('Token:', localStorage.getItem('token'));
      console.log('Role:', localStorage.getItem('role'));
      console.log("AuthorId", localStorage.getItem('userId'));
      
      login(token, user.role);
      
      if (user.role === 'author') {
        navigate('/dashboard'); // Redirect to admin dashboard
      } else {
        navigate('/'); // Redirect to post list for normal users
      }
    } catch (error) {
      setLoading(false);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className='main-div'>
      <div className='title'>
        <h2>Welcome</h2>
      </div>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button className='login' type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
