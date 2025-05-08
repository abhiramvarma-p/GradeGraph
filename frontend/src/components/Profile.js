import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    Avatar,
    IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedData = {
                ...formData,
                profilePicture: profilePicture
            };
            
            const result = await updateUser(updatedData);
            if (result.success) {
            setSuccess('Profile updated successfully!');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" sx={{ mb: 4, fontFamily: 'Futura Book' }}>
                    Profile Settings
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            src={profilePicture}
                            sx={{
                                width: 120,
                                height: 120,
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: '3rem'
                            }}
                        >
                            {!profilePicture && (user?.firstName?.[0] || '?')}
                        </Avatar>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="profile-picture-input"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="profile-picture-input">
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="span"
                            >
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                type="email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{
                                    mt: 2,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    }
                                }}
                            >
                                Update Profile
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default Profile; 