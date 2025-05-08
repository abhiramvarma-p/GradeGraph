import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import axios from '../../utils/axiosConfig';

const ExportDialog = ({ open, onClose, userType, onExport }) => {
    const [branches, setBranches] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchBranches();
            generateBatchYears();
        }
    }, [open]);

    useEffect(() => {
        if (selectedBranch && selectedYear) {
            fetchCourses();
        }
    }, [selectedBranch, selectedYear]);

    const fetchBranches = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setError(error.response?.data?.message || 'Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    const generateBatchYears = () => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
        setBatchYears(years);
    };

    const fetchCourses = async () => {
        if (!selectedBranch || !selectedYear) return;
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/branches/courses', {
                params: {
                    branch: selectedBranch,
                    year: selectedYear
                }
            });
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.response?.data?.message || 'Failed to fetch courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        setError('');
        if (userType === 'educator' && (!selectedBranch || !selectedYear || !selectedCourse)) {
            setError('Please select all required fields');
            return;
        }
        if (userType === 'admin' && (!selectedBranch || !selectedYear)) {
            setError('Please select branch and year');
            return;
        }
        onExport(selectedBranch, selectedYear, selectedCourse);
        onClose();
    };

    const handleClose = () => {
        setError('');
        setSelectedBranch('');
        setSelectedYear('');
        setSelectedCourse('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Export Data</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Branch</InputLabel>
                    <Select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        label="Branch"
                        disabled={loading}
                    >
                        {branches.map((branch) => (
                            <MenuItem key={branch.code} value={branch.code}>
                                {branch.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Batch Year</InputLabel>
                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        label="Batch Year"
                        disabled={loading}
                    >
                        {batchYears.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {userType === 'educator' && (
                    <FormControl fullWidth>
                        <InputLabel>Course</InputLabel>
                        <Select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            label="Course"
                            disabled={loading || !selectedBranch || !selectedYear}
                        >
                            {courses.map((course) => (
                                <MenuItem key={course._id} value={course._id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleExport} 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                >
                    Export
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportDialog; 