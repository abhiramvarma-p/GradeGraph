import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Show session expired message if redirected from expired session
        if (searchParams.get('expired')) {
            setError('Your session has expired. Please log in again.');
        }
    }, [searchParams]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            redirectBasedOnRole(user.role);
        }
    }, [isAuthenticated, user]);

    const redirectBasedOnRole = (role) => {
        switch (role) {
            case 'student':
                navigate('/student/dashboard');
                break;
            case 'educator':
                navigate('/educator/dashboard');
                break;
            case 'admin':
                navigate('/admin/dashboard');
                break;
            default:
                navigate('/');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success && result.user) {
                redirectBasedOnRole(result.user.role);
            } else {
                setError(result.error || 'Invalid email or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(
                err.response?.data?.message || 
                'Unable to connect to the server. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Login to GradeGraph
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            error={!!error}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            error={!!error}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || !formData.email || !formData.password}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    Logging in...
                                </Box>
                            ) : (
                                'Login'
                            )}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/register" variant="body2">
                                Don't have an account? Sign Up
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 