import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));
    const [user, setUser] = useState(null); // Add user state

    // Check authentication status and role on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedRole = localStorage.getItem('role');

            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/userDetails`, {
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
            const response = await axiosInstance.post('/login', {
                username,
                password
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('username', response.data.user.username);
                localStorage.setItem('role', response.data.user.role);
                setUser(response.data.user);
                setIsAuthenticated(true);
                setUserRole(response.data.user.role);
                return true;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null); // Clear user state on logout
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userRole,
            user, // Add user to context value
            login,
            logout: handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);