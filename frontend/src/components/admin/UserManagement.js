import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        branch: '',
        graduationYear: new Date().getFullYear() + 4,
        collegeId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        role: 'student',
        branch: '',
        graduationYear: ''
    });

    const branches = [
        'Computer Science & Engineering (CSE)',
        'Artificial Intelligence (AI)',
        'Electronics & Computer Engineering (ECM)',
        'Computation & Mathematics (CM)',
        'Mechanical Engineering (ME)',
        'Mechatronics (MT)',
        'Civil Engineering (CE)',
        'Nano Technology (NT)',
        'Electronics and Communication Engineering (ECE)',
        'Bio Technology',
        'Computational Biology (CB)',
        'Aerospace (Aero)',
        'Electrical and Computer Engineering (ELC)',
        'VLSI Design and Technology (VLSI)',
        '5 Yr. M.Tech- Computer Science and Engineering',
        '5 Yr. Integrated M.Tech -Biotechnology'
    ];

    const roles = ['student', 'educator', 'admin'];
    const graduationYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, filters]);

    const filterUsers = () => {
        let filtered = [...users];
        
        if (filters.role) {
            filtered = filtered.filter(user => user.role === filters.role);
        }
        
        if (filters.branch) {
            filtered = filtered.filter(user => user.branch === filters.branch);
        }
        
        if (filters.graduationYear) {
            filtered = filtered.filter(user => user.graduationYear === parseInt(filters.graduationYear));
        }
        
        setFilteredUsers(filtered);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            role: 'student',
            branch: '',
            graduationYear: new Date().getFullYear() + 4,
            collegeId: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await api.post('/auth/register', formData);
            setSuccess('User added successfully');
            fetchUsers();
            handleCloseDialog();
        } catch (err) {
            console.error('Error adding user:', err);
            setError('Failed to add user. Please try again later.');
        }
    };

    const handleDelete = async (userId) => {
        try {
            setError('');
            await api.delete(`/users/${userId}`);
            setSuccess('User deleted successfully');
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user. Please try again later.');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">User Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                >
                    Add User
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            label="Role"
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            {roles.map(role => (
                                <MenuItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            name="branch"
                            value={filters.branch}
                            onChange={handleFilterChange}
                            label="Branch"
                        >
                            <MenuItem value="">All Branches</MenuItem>
                            {branches.map(branch => (
                                <MenuItem key={branch} value={branch}>
                                    {branch}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Graduation Year</InputLabel>
                        <Select
                            name="graduationYear"
                            value={filters.graduationYear}
                            onChange={handleFilterChange}
                            label="Graduation Year"
                        >
                            <MenuItem value="">All Years</MenuItem>
                            {graduationYears.map(year => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Branch</TableCell>
                            <TableCell>Graduation Year</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.branch}</TableCell>
                                <TableCell>{user.graduationYear}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleDelete(user._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="educator">Educator</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        {formData.role === 'student' && (
                            <>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Branch</InputLabel>
                                    <Select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {branches.map((branch) => (
                                            <MenuItem key={branch} value={branch}>
                                                {branch}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Graduation Year"
                                    name="graduationYear"
                                    type="number"
                                    value={formData.graduationYear}
                                    onChange={handleInputChange}
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="College ID"
                                    name="collegeId"
                                    value={formData.collegeId}
                                    onChange={handleInputChange}
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement; 