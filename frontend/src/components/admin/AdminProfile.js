import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Container,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { apiService } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
    const { user, updateUser, isAuthenticated: authIsAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        accessLevel: user?.accessLevel || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Check if user is authenticated
        if (!authIsAuthenticated) {
            navigate('/login');
            return;
        }
        
        // Initialize profile with user data
        if (user) {
            setProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                accessLevel: user.accessLevel || ''
            });
        }
    }, [authIsAuthenticated, navigate, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await updateUser(profile);
            if (result.success) {
                setSuccess('Profile updated successfully');
            } else {
                setError(result.error || 'Error updating profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Profile
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={profile.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={profile.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Access Level"
                                name="accessLevel"
                                value={profile.accessLevel}
                                onChange={handleChange}
                                disabled={true}
                                helperText="Access level cannot be changed"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CircularProgress size={24} sx={{ mr: 1 }} />
                                            Updating...
                                        </Box>
                                    ) : (
                                        'Update Profile'
                                    )}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default AdminProfile; 