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
    Grid,
    InputAdornment,
    Alert,
    Tooltip,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

const ScoreManagement = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({
        branch: '',
        batchYear: '',
        courseId: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formData, setFormData] = useState({
        score: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [studentScores, setStudentScores] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedScore, setSelectedScore] = useState(null);
    const [editFormData, setEditFormData] = useState({
        score: ''
    });

    const branches = [
        { value: 'Computer Science & Engineering (CSE)', label: 'Computer Science & Engineering (CSE)' },
        { value: 'Artificial Intelligence (AI)', label: 'Artificial Intelligence (AI)' },
        { value: 'Electronics & Computer Engineering (ECM)', label: 'Electronics & Computer Engineering (ECM)' },
        { value: 'Computation & Mathematics (CM)', label: 'Computation & Mathematics (CM)' },
        { value: 'Mechanical Engineering (ME)', label: 'Mechanical Engineering (ME)' },
        { value: 'Mechatronics (MT)', label: 'Mechatronics (MT)' },
        { value: 'Civil Engineering (CE)', label: 'Civil Engineering (CE)' },
        { value: 'Nano Technology (NT)', label: 'Nano Technology (NT)' },
        { value: 'Electronics and Communication Engineering (ECE)', label: 'Electronics and Communication Engineering (ECE)' },
        { value: 'Bio Technology', label: 'Bio Technology' },
        { value: 'Computational Biology (CB)', label: 'Computational Biology (CB)' },
        { value: 'Aerospace (Aero)', label: 'Aerospace (Aero)' },
        { value: 'Electrical and Computer Engineering (ELC)', label: 'Electrical and Computer Engineering (ELC)' },
        { value: 'VLSI Design and Technology (VLSI)', label: 'VLSI Design and Technology (VLSI)' },
        { value: '5 Yr. M.Tech- Computer Science and Engineering', label: '5 Yr. M.Tech- Computer Science and Engineering' },
        { value: '5 Yr. Integrated M.Tech -Biotechnology', label: '5 Yr. Integrated M.Tech -Biotechnology' }
    ];

    const batchYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

    useEffect(() => {
        if (filters.branch && filters.batchYear) {
            fetchStudents();
            fetchCourses();
        }
    }, [filters]);

    useEffect(() => {
        filterStudents();
    }, [students, searchQuery]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching students with filters:', filters);
            const response = await api.get('/users/students', {
                params: {
                    branch: filters.branch,
                    graduationYear: filters.batchYear
                }
            });
            console.log('API Response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setStudents(response.data);
                setFilteredStudents(response.data);
            } else {
                console.log('No valid student data received');
                setStudents([]);
                setFilteredStudents([]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to fetch students. Please try again later.');
            setStudents([]);
            setFilteredStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            console.log('Fetching courses with filters:', filters);
            const response = await api.get('/courses', {
                params: {
                    branch: filters.branch,
                    semester: filters.semester,
                    educatorId: user._id
                }
            });
            console.log('Courses Response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setCourses(response.data);
            } else {
                console.log('No valid course data received');
                setCourses([]);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses. Please try again later.');
            setCourses([]);
        }
    };

    const filterStudents = () => {
        if (!students || !Array.isArray(students)) {
            setFilteredStudents([]);
            return;
        }

        let filtered = [...students];
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(student => {
                if (!student) return false;
                const collegeId = student.collegeId || '';
                const firstName = student.firstName || '';
                const lastName = student.lastName || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                return (
                    collegeId.toLowerCase().includes(query) ||
                    fullName.includes(query)
                );
            });
        }
        
        setFilteredStudents(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log('Filter changed:', name, value);
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setSearchQuery('');
        setError('');
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        filterStudents();
    };

    const handleCourseSelect = (courseId) => {
        const course = courses.find(c => c._id === courseId);
        if (course) {
            setSelectedCourse(course);
            setFormData(prev => ({
                ...prev,
                courseId: course._id,
                semester: course.semester
            }));
        }
    };

    const handleOpenDialog = (student) => {
        setSelectedStudent(student);
        // If a course is already selected in filters, use it
        if (filters.courseId) {
            const course = courses.find(c => c._id === filters.courseId);
            if (course) {
                setSelectedCourse(course);
                setFormData({
                    score: '',
                    courseId: course._id,
                    semester: course.semester
                });
            }
        } else {
            setFormData({
                score: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setSelectedCourse(null);
        setFormData({
            score: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!user || user.role !== 'educator') {
                setError('Only educators can add scores. Please log in with an educator account.');
                return;
            }

            // Validate all required fields
            if (!selectedStudent?._id) {
                setError('Please select a student');
                return;
            }
            if (!selectedCourse?._id) {
                setError('Please select a course');
                return;
            }
            if (!formData.score) {
                setError('Please enter a score');
                return;
            }

            // Validate score input
            const score = parseFloat(formData.score);
            if (isNaN(score) || score < 0 || score > 100) {
                setError('Please enter a valid score between 0 and 100');
                return;
            }

            // Check if score already exists for this student and course
            const existingScore = await api.get(`/scores/student/${selectedStudent._id}`);
            const scoreToUpdate = existingScore.data.find(
                s => s.course._id === selectedCourse._id && s.semester === selectedCourse.semester
            );

            if (scoreToUpdate) {
                // Update existing score
                await api.put(`/scores/${scoreToUpdate._id}`, { score });
                setSuccess('Score updated successfully');
            } else {
                // Create new score
                const scoreData = {
                    studentId: selectedStudent._id,
                    courseId: selectedCourse._id,
                    score: score,
                    semester: selectedCourse.semester,
                    educatorId: user._id,
                    courseName: selectedCourse.name,
                    courseCode: selectedCourse.code
                };
                await api.post('/scores', scoreData);
                setSuccess('Score added successfully');
            }

            handleCloseDialog();
            fetchStudents();
            fetchCourses();
            if (selectedStudent) {
                fetchStudentScores(selectedStudent._id);
            }
        } catch (error) {
            console.error('Error saving score:', error);
            let errorMessage = 'Failed to save score. Please try again later.';
            
            if (error.response) {
                console.error('Error response:', error.response.data);
                if (error.response.status === 401) {
                    errorMessage = 'Session expired. Please log in again.';
                } else if (error.response.status === 403) {
                    errorMessage = 'You do not have permission to add scores.';
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data.message || 'Invalid data. Please check your input.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                console.error('Error setting up request:', error.message);
            }
            
            setError(errorMessage);
        }
    };

    const fetchStudentScores = async (studentId) => {
        try {
            const response = await api.get(`/scores/student/${studentId}`);
            setStudentScores(response.data);
        } catch (error) {
            console.error('Error fetching student scores:', error);
            setError('Failed to fetch student scores');
        }
    };

    const handleOpenEditDialog = (score) => {
        setSelectedScore(score);
        setEditFormData({
            score: score.score.toString()
        });
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedScore(null);
        setEditFormData({
            score: ''
        });
    };

    const handleEditScore = async (e) => {
        e.preventDefault();
        try {
            if (!selectedScore) return;

            const score = parseFloat(editFormData.score);
            if (isNaN(score) || score < 0 || score > 100) {
                setError('Please enter a valid score between 0 and 100');
                return;
            }

            await api.put(`/scores/${selectedScore._id}`, { score });
            setSuccess('Score updated successfully');
            handleCloseEditDialog();
            if (selectedStudent) {
                fetchStudentScores(selectedStudent._id);
            }
        } catch (error) {
            console.error('Error updating score:', error);
            setError('Failed to update score');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Score Management
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

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            name="branch"
                            value={filters.branch}
                            onChange={handleFilterChange}
                            label="Branch"
                            disabled={loading}
                        >
                            {branches.map((branch) => (
                                <MenuItem key={branch.value} value={branch.value}>
                                    {branch.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Batch Year</InputLabel>
                        <Select
                            name="batchYear"
                            value={filters.batchYear}
                            onChange={handleFilterChange}
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
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Course</InputLabel>
                        <Select
                            name="courseId"
                            value={filters.courseId}
                            onChange={handleFilterChange}
                            label="Course"
                            disabled={loading || !filters.branch || !filters.batchYear}
                        >
                            {courses.map((course) => (
                                <MenuItem key={course._id} value={course._id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Search by Roll No. or Name"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : filters.branch && filters.batchYear ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Roll No.</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.collegeId}</TableCell>
                                    <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Add/Update Score">
                                            <IconButton onClick={() => handleOpenDialog(student)}>
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                        Please select both Branch and Batch Year to view students
                    </Typography>
                </Paper>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Add/Update Score for {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Course</InputLabel>
                            <Select
                                value={selectedCourse?._id || ''}
                                onChange={(e) => handleCourseSelect(e.target.value)}
                                label="Course"
                            >
                                {courses.map((course) => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.name} (Semester {course.semester})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Score"
                            name="score"
                            type="number"
                            value={formData.score}
                            onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                            required
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            sx={{ mb: 2 }}
                        />
                        {selectedCourse && (
                            <Typography variant="body2" color="textSecondary">
                                Selected Course: {selectedCourse.name} (Semester {selectedCourse.semester})
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Save Score
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Edit Score for {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleEditScore} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Score"
                            name="score"
                            type="number"
                            value={editFormData.score}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, score: e.target.value }))}
                            required
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            sx={{ mb: 2 }}
                        />
                        {selectedScore && (
                            <Typography variant="body2" color="textSecondary">
                                Course: {selectedScore.subject} (Semester {selectedScore.semester})
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={handleEditScore} variant="contained" color="primary">
                        Update Score
                    </Button>
                </DialogActions>
            </Dialog>

            {selectedStudent && studentScores.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Existing Scores for {selectedStudent.firstName} {selectedStudent.lastName}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Course</TableCell>
                                    <TableCell>Semester</TableCell>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentScores.map((score) => (
                                    <TableRow key={score._id}>
                                        <TableCell>{score.subject}</TableCell>
                                        <TableCell>{score.semester}</TableCell>
                                        <TableCell>{score.score}</TableCell>
                                        <TableCell>{new Date(score.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit Score">
                                                <IconButton onClick={() => handleOpenEditDialog(score)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};

export default ScoreManagement; 