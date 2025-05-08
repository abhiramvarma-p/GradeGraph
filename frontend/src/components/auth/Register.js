import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Box,
    Alert,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [branchOptions, setBranchOptions] = useState([]);
    const [branchLoading, setBranchLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        collegeId: '',
        branch: '',
        graduationYear: new Date().getFullYear() + 4, // Default to 4 years from now
        // Educator specific fields
        department: '',
        designation: '',
        // Student specific fields
        year: '1',
        // Admin specific fields
        accessLevel: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        // Fetch branch options when component mounts
        const fetchBranches = async () => {
            setBranchLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/branches`);
                setBranches(response.data);
            } catch (err) {
                console.error('Error fetching branches:', err);
                setError('Failed to load branches. Please try again later.');
            } finally {
                setBranchLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare user data based on role
            const userData = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role
            };

            // Add role-specific fields
            if (formData.role === 'student') {
                userData.collegeId = formData.collegeId;
                userData.branch = formData.branch;
                userData.graduationYear = formData.graduationYear;
            } else if (formData.role === 'educator') {
                userData.department = formData.department;
                userData.designation = formData.designation;
            } else if (formData.role === 'admin') {
                userData.accessLevel = formData.accessLevel;
            }

            const result = await register(userData);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Register for GradeGraph
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    name="role"
                                    label="Role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="educator">Educator</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="firstName"
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    name="lastName"
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Student specific fields */}
                            {formData.role === 'student' && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="collegeId"
                                            label="College ID"
                                            value={formData.collegeId}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Branch</InputLabel>
                                            <Select
                                                name="branch"
                                                value={formData.branch}
                                                onChange={handleChange}
                                                label="Branch"
                                            >
                                                {branches.map((branch) => (
                                                    <MenuItem key={branch} value={branch}>
                                                        {branch}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="graduationYear"
                                            label="Graduation Year"
                                            type="number"
                                            value={formData.graduationYear}
                                            onChange={handleChange}
                                            inputProps={{ min: new Date().getFullYear(), max: new Date().getFullYear() + 4 }}
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Educator specific fields */}
                            {formData.role === 'educator' && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="department"
                                            label="Department"
                                            value={formData.department}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="designation"
                                            label="Designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Admin specific fields */}
                            {formData.role === 'admin' && (
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="accessLevel"
                                        label="Access Level"
                                        value={formData.accessLevel}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Registering...' : 'Register'}
                                </Button>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Link component={RouterLink} to="/login" variant="body2">
                                        Already have an account? Login
                                    </Link>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register; 