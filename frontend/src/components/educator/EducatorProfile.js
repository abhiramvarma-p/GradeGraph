import React, { useState } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import axios from 'axios';

const EducatorProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        designation: user.designation || ''
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleAddScore = async (studentId, score) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/scores`, {
                student: studentId,
                score: score,
                course: 'Sample Course', // This would be selected from a dropdown in a real app
                semester: 'Current Semester',
                subject: 'Sample Subject'
            });
            setSuccess('Score added successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding score');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Educator Profile
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
                                        label="Department"
                                        name="department"
                                        value={profile.department}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Designation"
                                        name="designation"
                                        value={profile.designation}
                                        onChange={handleChange}
                                    />
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
                        <CardHeader title="Student Management" />
                        <CardContent>
                            <Typography variant="body1" gutterBottom>
                                As an educator, you can manage student scores and view performance metrics.
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Button variant="contained" color="primary">
                                    View All Students
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Recent Students" />
                        <CardContent>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Student ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Course</TableCell>
                                            <TableCell>Latest Score</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No students available
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EducatorProfile; 