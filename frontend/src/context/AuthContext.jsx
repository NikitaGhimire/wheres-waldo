import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));

    // Check authentication status and role on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedRole = localStorage.getItem('role');

            if (token) {
                try {
                    const response = await axios.get('http://localhost:5001/userDetails', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.valid) {
                        setIsAuthenticated(true);
                        setUserRole(storedRole || response.data.role);
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    handleLogout();
                }
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5001/login', {
                username,
                password
            });
            
            const { token, user } = response.data;
            
            // Store user data in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('username', user.username);
            
            // Update state
            setIsAuthenticated(true);
            setUserRole(user.role);

            console.log('Login successful, user:', user); // Debug log
            return user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userRole,
            login,
            logout: handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);