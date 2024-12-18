import { useState } from 'react';
import axiosInstance from '../axiosInstance';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('normal'); // Default role
  

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`http://localhost:5001/register`, {
        username,
        password,
        role
      });
      console.log('User registered:', response.data);
      // Redirect or show a success message
      window.location.href = '/';
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div className="register-form-container">
    <h1>Register</h1>
    <form onSubmit={handleRegister}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="normal">Player</option>
        <option value="author">Author</option>
      </select>
      <button type="submit">Register</button>
    </form>
  </div>
  
  );
};

export default RegisterPage;
