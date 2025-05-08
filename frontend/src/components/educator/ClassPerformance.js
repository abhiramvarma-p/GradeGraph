import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { GRADE_COLORS, getGrade, getGradeLabel, initializeGradeDistribution } from '../../utils/gradeUtils';

// Update color constants
const COLORS = {
  primary: '#A35C7A',
  secondary: '#C890A7',
  background: '#FBF5E5',
  text: '#212121',
  lightPink: 'rgb(200, 144, 167)',
  darkPink: 'rgb(163, 92, 122)',
  cream: 'rgb(251, 245, 229)',
  dark: 'rgb(33, 33, 33)'
};

const ClassPerformance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    branch: '',
    batchYear: '',
    courseId: ''
  });
  const [branches, setBranches] = useState([]);
  const [batchYears, setBatchYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBatchYears();
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (filters.branch && filters.batchYear) {
      filterCourses();
    }
  }, [filters.branch, filters.batchYear]);

  useEffect(() => {
    if (filters.courseId) {
      fetchPerformanceData();
    }
  }, [filters.courseId]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses', {
        params: {
          educatorId: user._id
        }
      });
      const allCourses = response.data;
      setCourses(allCourses);
      
      // Extract unique branches from courses
      const uniqueBranches = [...new Set(allCourses.map(course => course.branch))];
      setBranches(uniqueBranches);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchYears = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    setBatchYears(years);
  };

  const filterCourses = () => {
    const filtered = courses.filter(course => 
      course.branch === filters.branch && 
      course.batchYear === filters.batchYear
    );
    setCourses(filtered);
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scores/course/${filters.courseId}`);
      const data = response.data;
      
      // Process student data first to calculate percentages
      const studentData = data.map(score => {
        const percentage = (score.score / 100) * 100; // Assuming max score is 100
        const grade = getGrade(percentage);
        return {
          _id: score._id,
          rollNumber: score.student.collegeId,
          name: `${score.student.firstName} ${score.student.lastName}`,
          score: score.score,
          maxScore: 100,
          percentage: percentage,
          grade: grade.letter,
          gradePoints: grade.points
        };
      });

      // Calculate statistics from processed student data
      const scores = studentData.map(student => student.score);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      // Initialize grade distribution
      const gradeDistribution = initializeGradeDistribution();

      // Calculate grade distribution from student data
      studentData.forEach(student => {
        const grade = getGrade(student.percentage);
        const gradeLabel = getGradeLabel(grade.letter, grade.points);
        const gradeIndex = gradeDistribution.findIndex(g => g.name === gradeLabel);
        if (gradeIndex !== -1) {
          gradeDistribution[gradeIndex].value++;
        }
      });

      // Calculate score distribution
      const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
        const lowerBound = i * 10;
        const upperBound = (i + 1) * 10;
        return {
          range: `${lowerBound}-${upperBound}`,
          count: studentData.filter(student => 
            student.percentage >= lowerBound && 
            student.percentage < (i === 9 ? upperBound + 1 : upperBound)
          ).length,
          fill: i % 2 === 0 ? COLORS.primary : COLORS.secondary
        };
      });

      setPerformanceData({
        statistics: {
          minScore,
          maxScore,
          avgScore: parseFloat(avgScore.toFixed(2)),
          totalStudents: scores.length
        },
        gradeDistribution,
        scoreDistribution,
        students: studentData
      });
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields
      ...(name === 'branch' && { batchYear: '', courseId: '' }),
      ...(name === 'batchYear' && { courseId: '' })
    }));
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
      <Typography variant="h5" gutterBottom>
        Class Performance Analysis
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
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
                <MenuItem key={branch} value={branch}>
                  {branch}
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
              disabled={loading || !filters.branch}
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
                  {course.name} (Semester {course.semester})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : performanceData ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Batch Statistics
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500 }}>
                    {performanceData.statistics.totalStudents}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500 }}>
                    {performanceData.statistics.avgScore}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Highest Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: 'success.main' }}>
                    {performanceData.statistics.maxScore}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Lowest Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 500, color: 'error.main' }}>
                    {performanceData.statistics.minScore}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => 
                        percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''
                      }
                    >
                      {performanceData.gradeDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={GRADE_COLORS[entry.name]}
                          stroke={COLORS.text}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: COLORS.background,
                        border: `1px solid ${COLORS.primary}`,
                        borderRadius: '4px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Score Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData.scoreDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barSize={40}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false}
                      stroke={COLORS.secondary}
                    />
                    <XAxis 
                      dataKey="range"
                      tick={{ fill: COLORS.text }}
                      axisLine={{ stroke: COLORS.text }}
                    />
                    <YAxis 
                      tick={{ fill: COLORS.text }}
                      axisLine={{ stroke: COLORS.text }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: COLORS.background,
                        border: `1px solid ${COLORS.primary}`,
                        borderRadius: '4px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Number of Students"
                    >
                      {performanceData.scoreDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.fill}
                          stroke={COLORS.text}
                          strokeWidth={1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Student Scores
                </Typography>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 300 }}
                />
              </Box>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Score</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Max Score</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.students && performanceData.students
                        .filter(student => {
                            const searchLower = searchQuery.toLowerCase();
                            return (
                                student.name.toLowerCase().includes(searchLower) ||
                                student.rollNumber.toLowerCase().includes(searchLower)
                            );
                        })
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((student) => (
                            <TableRow key={student._id}>
                                <TableCell>{student.rollNumber}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell align="right">{student.score}</TableCell>
                                <TableCell align="right">{student.maxScore}</TableCell>
                                <TableCell align="right">{student.percentage.toFixed(2)}%</TableCell>
                                <TableCell align="right">
                                    {student.grade} ({student.gradePoints})
                                </TableCell>
                            </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Please select a branch, batch year, and course to view performance data
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ClassPerformance; 