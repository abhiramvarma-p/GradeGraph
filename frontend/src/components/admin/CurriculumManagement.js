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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

const CurriculumManagement = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [filters, setFilters] = useState({
        branch: '',
        batchYear: ''
    });
    const [educators, setEducators] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        semester: '1',
        branch: '',
        credits: '3',
        courseType: 'core',
        batchYear: (new Date().getFullYear() + 4).toString(),
        maxScore: '100',
        educator: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const batchYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

    useEffect(() => {
        fetchCourses();
        fetchEducators();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, filters]);

    const filterCourses = () => {
        let filtered = [...courses];
        console.log('Filtering courses:', {
            allCourses: courses,
            filters: filters,
            branchFilter: filters.branch,
            batchYearFilter: filters.batchYear
        });
        
        if (filters.branch) {
            filtered = filtered.filter(course => {
                const matches = course.branch === filters.branch;
                console.log(`Course ${course.code} branch match:`, {
                    courseBranch: course.branch,
                    filterBranch: filters.branch,
                    matches
                });
                return matches;
            });
        }
        
        if (filters.batchYear) {
            filtered = filtered.filter(course => {
                const matches = course.batchYear === parseInt(filters.batchYear);
                console.log(`Course ${course.code} batch year match:`, {
                    courseBatchYear: course.batchYear,
                    filterBatchYear: filters.batchYear,
                    matches
                });
                return matches;
            });
        }
        
        // Sort by semester and then by name
        filtered.sort((a, b) => {
            if (a.semester !== b.semester) {
                return a.semester - b.semester;
            }
            return a.name.localeCompare(b.name);
        });
        
        console.log('Final filtered courses:', filtered);
        setFilteredCourses(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching all courses...');
            const response = await api.get('/courses');
            console.log('Courses response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                // Ensure all numeric fields are properly converted
                const processedCourses = response.data.map(course => ({
                    ...course,
                    semester: parseInt(course.semester),
                    batchYear: parseInt(course.batchYear),
                    credits: parseInt(course.credits)
                }));
                console.log('Processed courses:', processedCourses);
                setCourses(processedCourses);
            } else {
                console.log('No valid course data received');
                setCourses([]);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses. Please try again later.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEducators = async () => {
        try {
            const response = await api.get('/users');
            const educatorList = response.data.filter(user => user.role === 'educator');
            setEducators(educatorList);
        } catch (err) {
            console.error('Error fetching educators:', err);
            setError('Failed to fetch educators');
        }
    };

    const handleOpenDialog = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                name: course.name || '',
                code: course.code || '',
                description: course.description || '',
                semester: course.semester?.toString() || '1',
                branch: course.branch || '',
                credits: course.credits?.toString() || '3',
                courseType: course.courseType || 'core',
                batchYear: course.batchYear?.toString() || (new Date().getFullYear() + 4).toString(),
                maxScore: course.maxScore?.toString() || '100',
                educator: course.educator?._id || ''
            });
        } else {
            setEditingCourse(null);
            setFormData({
                name: '',
                code: '',
                description: '',
                semester: '1',
                branch: '',
                credits: '3',
                courseType: 'core',
                batchYear: (new Date().getFullYear() + 4).toString(),
                maxScore: '100',
                educator: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCourse(null);
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
            setSuccess('');
            setLoading(true);

            // Validate required fields
            if (!formData.name || !formData.code || !formData.description || 
                !formData.semester || !formData.branch || !formData.credits || 
                !formData.courseType || !formData.batchYear) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Clean and validate data
            const courseData = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                description: formData.description.trim(),
                semester: parseInt(formData.semester),
                branch: formData.branch,
                credits: parseInt(formData.credits),
                courseType: formData.courseType,
                batchYear: parseInt(formData.batchYear),
                maxScore: 100
            };

            // Add educator if selected
            if (formData.educator) {
                courseData.educator = formData.educator;
            }

            // Validate numeric ranges
            if (courseData.semester < 1 || courseData.semester > 8) {
                setError('Semester must be between 1 and 8');
                setLoading(false);
                return;
            }

            if (courseData.credits < 1 || courseData.credits > 5) {
                setError('Credits must be between 1 and 5');
                setLoading(false);
                return;
            }

            if (courseData.batchYear < 2000 || courseData.batchYear > new Date().getFullYear() + 4) {
                setError('Invalid batch year');
                setLoading(false);
                return;
            }

            // Validate branch is one of the allowed values
            const validBranches = [
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

            if (!validBranches.includes(courseData.branch)) {
                setError('Invalid branch selected');
                setLoading(false);
                return;
            }

            // Validate courseType
            if (!['core', 'elective'].includes(courseData.courseType)) {
                setError('Invalid course type');
                setLoading(false);
                return;
            }

            // Check if course code already exists
            const existingCourse = courses.find(course => 
                course.code === courseData.code && 
                course.branch === courseData.branch && 
                course.semester === courseData.semester && 
                course.batchYear === courseData.batchYear
            );

            if (existingCourse && (!editingCourse || editingCourse._id !== existingCourse._id)) {
                setError(`A course with code ${courseData.code} already exists for this branch, semester, and batch year`);
                setLoading(false);
                return;
            }

            let response;
            if (editingCourse) {
                response = await api.put(`/courses/${editingCourse._id}`, courseData);
                setSuccess('Course updated successfully');
            } else {
                response = await api.post('/courses', courseData);
                setSuccess('Course added successfully');
            }

            // Only close dialog and refresh if the request was successful
            if (response && response.status >= 200 && response.status < 300) {
                handleCloseDialog();
                await fetchCourses(); // Wait for courses to be refreshed
            }
        } catch (err) {
            console.error('Error saving course:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                setError(err.response.data.errors.join(', '));
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network error. Please check your connection.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to save course. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        try {
            setError('');
            await api.delete(`/courses/${courseId}`);
            setSuccess('Course deleted successfully');
            fetchCourses();
        } catch (err) {
            console.error('Error deleting course:', err);
            setError('Failed to delete course. Please try again later.');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Curriculum Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Course
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Batch Year</InputLabel>
                        <Select
                            name="batchYear"
                            value={filters.batchYear}
                            onChange={handleFilterChange}
                            label="Batch Year"
                        >
                            <MenuItem value="">All Years</MenuItem>
                            {batchYears.map(year => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {filters.branch && filters.batchYear ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Semester</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Credits</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course._id}>
                                    <TableCell>Semester {course.semester}</TableCell>
                                    <TableCell>{course.code}</TableCell>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell>{course.courseType}</TableCell>
                                    <TableCell>{course.credits}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(course)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(course._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                        Please select both Branch and Batch Year to view courses
                    </Typography>
                </Paper>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Course Code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Course Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Branch</InputLabel>
                                    <Select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        label="Branch"
                                        required
                                    >
                                        {branches.map((branch) => (
                                            <MenuItem key={branch} value={branch}>
                                                {branch}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Semester</InputLabel>
                                    <Select
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleInputChange}
                                        label="Semester"
                                        required
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                            <MenuItem key={sem} value={sem.toString()}>
                                                Semester {sem}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Course Type</InputLabel>
                                    <Select
                                        name="courseType"
                                        value={formData.courseType}
                                        onChange={handleInputChange}
                                        label="Course Type"
                                        required
                                    >
                                        <MenuItem value="core">Core</MenuItem>
                                        <MenuItem value="elective">Elective</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Credits</InputLabel>
                                    <Select
                                        name="credits"
                                        value={formData.credits}
                                        onChange={handleInputChange}
                                        label="Credits"
                                        required
                                    >
                                        {[1, 2, 3, 4, 5].map((credit) => (
                                            <MenuItem key={credit} value={credit.toString()}>
                                                {credit}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Maximum Score"
                                    name="maxScore"
                                    type="number"
                                    value={formData.maxScore}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Batch Year"
                                    name="batchYear"
                                    type="number"
                                    value={formData.batchYear}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Educator</InputLabel>
                                    <Select
                                        name="educator"
                                        value={formData.educator}
                                        onChange={handleInputChange}
                                        label="Educator"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {educators.map((educator) => (
                                            <MenuItem key={educator._id} value={educator._id}>
                                                {`${educator.firstName} ${educator.lastName}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {editingCourse ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CurriculumManagement; 