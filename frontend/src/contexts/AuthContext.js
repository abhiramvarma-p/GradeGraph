import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Validate token on mount and after token changes
    const validateToken = async (token) => {
        try {
            const response = await api.get('/auth/validate-token');
            return response.data.valid;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
                try {
                    const isValid = await validateToken(token);
                    if (isValid) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
                    } else {
                        // Clear invalid token and user data
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
        }
            }
        setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            const { token, user } = response.data;
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update state
            setUser(user);
            setIsAuthenticated(true);
            
            return { success: true, user };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            const { token, user } = response.data;
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update state
            setUser(user);
            setIsAuthenticated(true);
            
            return { success: true, user };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    const logout = () => {
        // Clear stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Update state
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = async (userData) => {
        try {
            // If profilePicture is a File object, convert it to base64
            if (userData.profilePicture instanceof File) {
                const reader = new FileReader();
                reader.readAsDataURL(userData.profilePicture);
                userData.profilePicture = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                });
            }

            const response = await api.put('/users/profile', userData);
            const updatedUser = response.data;
            
            // Update stored user data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update state
            setUser(updatedUser);
            
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update profile'
            };
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 