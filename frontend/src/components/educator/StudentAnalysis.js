import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StudentAnalysis = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({
    coursePerformance: [],
    semesterPerformance: [],
    gradeDistribution: []
  });

  useEffect(() => {
    if (user && user.role === 'educator') {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate user data
      if (!user || !user.branch || !user.graduationYear) {
        setError('User information is incomplete. Please log in again.');
        setLoading(false);
        return;
      }

      // Ensure we have a valid auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await api.get('/users/students', {
        params: {
          branch: user.branch,
          graduationYear: user.graduationYear
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        console.log('No valid student data received');
        setStudents([]);
        setError('No students found for the selected criteria');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Session expired. Please log in again.');
            break;
          case 403:
            setError('You do not have permission to view student data.');
            break;
          case 400:
            setError('Invalid request parameters. Please try again.');
            break;
          default:
            setError('Failed to fetch students. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scores/student/${selectedStudent._id}`);
      const scores = response.data;

      // Calculate course-wise performance
      const coursePerformance = scores.map(score => ({
        name: score.course.name,
        score: score.score
      }));

      // Calculate semester-wise performance
      const semesterPerformance = scores.reduce((acc, score) => {
        const semester = score.semester;
        if (!acc[semester]) {
          acc[semester] = { total: 0, count: 0 };
        }
        acc[semester].total += score.score;
        acc[semester].count += 1;
        return acc;
      }, {});

      const semesterData = Object.entries(semesterPerformance).map(([semester, data]) => ({
        semester,
        average: data.total / data.count
      })).sort((a, b) => a.semester - b.semester);

      // Calculate grade distribution
      const gradeDistribution = [
        { name: 'A+', value: scores.filter(s => s.score >= 90).length },
        { name: 'A', value: scores.filter(s => s.score >= 80 && s.score < 90).length },
        { name: 'B+', value: scores.filter(s => s.score >= 70 && s.score < 80).length },
        { name: 'B', value: scores.filter(s => s.score >= 60 && s.score < 70).length },
        { name: 'C', value: scores.filter(s => s.score >= 50 && s.score < 60).length },
        { name: 'F', value: scores.filter(s => s.score < 50).length }
      ];

      setStudentData({
        coursePerformance,
        semesterPerformance: semesterData,
        gradeDistribution
      });
    } catch (err) {
      setError('Failed to fetch student data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.collegeId.toLowerCase().includes(searchLower) ||
      student.fullName.toLowerCase().includes(searchLower)
    );
  });

  const handleExportReport = async (format) => {
    if (!selectedStudent) return;

    try {
      const response = await api.get(`/scores/student/${selectedStudent._id}/export/${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-analysis-${selectedStudent._id}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Performance Analysis
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by roll number or name"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setSelectedStudent(filteredStudents[0])}
              disabled={loading || filteredStudents.length === 0}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {selectedStudent && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Student Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Name:</strong> {selectedStudent.fullName}</Typography>
                  <Typography><strong>ID:</strong> {selectedStudent.collegeId}</Typography>
                  <Typography><strong>Class:</strong> {selectedStudent.class}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Average Score:</strong> {selectedStudent.averageScore}%</Typography>
                  <Typography><strong>Attendance:</strong> {selectedStudent.attendance}%</Typography>
                  <Typography><strong>Rank:</strong> {selectedStudent.rank}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Course-wise Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentData.coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Semester-wise Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentData.semesterPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semester" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="average" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={studentData.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {studentData.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell align="right">Assignments</TableCell>
                      <TableCell align="right">Quizzes</TableCell>
                      <TableCell align="right">Exams</TableCell>
                      <TableCell align="right">Overall</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStudent.subjects?.map((subject) => (
                      <TableRow key={subject.name}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell align="right">{subject.assignments}%</TableCell>
                        <TableCell align="right">{subject.quizzes}%</TableCell>
                        <TableCell align="right">{subject.exams}%</TableCell>
                        <TableCell align="right">{subject.overall}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => handleExportReport('pdf')}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => handleExportReport('csv')}
              >
                Export CSV
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default StudentAnalysis; 