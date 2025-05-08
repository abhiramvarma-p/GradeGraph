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
    Card,
    CardContent,
    CardHeader,
    MenuItem
} from '@mui/material';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const StudentProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        collegeId: user.collegeId || '',
        branch: user.branch || ''
    });
    const [branchOptions, setBranchOptions] = useState([]);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchScores();
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/branches`);
            setBranchOptions(response.data);
        } catch (err) {
            console.error('Error fetching branches:', err);
        }
    };

    const fetchScores = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/scores/student/${user._id}`);
            setScores(response.data);
        } catch (err) {
            console.error('Error fetching scores:', err);
        }
    };

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
            await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, profile);
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Student Profile
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
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={profile.firstName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={profile.lastName}
                                        onChange={handleChange}
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
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="College ID"
                                        name="collegeId"
                                        value={profile.collegeId}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Branch"
                                        name="branch"
                                        value={profile.branch}
                                        onChange={handleChange}
                                    >
                                        {branchOptions.map((branch) => (
                                            <MenuItem key={branch} value={branch}>
                                                {branch}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Academic Performance" />
                        <CardContent>
                            {scores.length > 0 ? (
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={scores}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#8884d8"
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    No scores available yet.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentProfile; 