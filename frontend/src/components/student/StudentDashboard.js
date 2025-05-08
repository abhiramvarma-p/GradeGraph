import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Container,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    TextField
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    CompareArrows as CompareArrowsIcon
} from '@mui/icons-material';
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
import { GRADE_COLORS, getGrade, getGradeLabel } from '../../utils/gradeUtils';

// Define color constants
const colors = {
    primary: '#A35C7A',
    secondary: '#C890A7',
    tertiary: '#FBF5E5',
    text: '#333333',
    background: '#FFFFFF',
    grid: '#E0E0E0'
};

// TabPanel component for tab content
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const StudentDashboard = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [scores, setScores] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState('All Semesters');
    const [batchPerformance, setBatchPerformance] = useState(null);
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    // Fetch student scores
                    const scoresResponse = await api.get(`/scores/student/${user._id}`);
                    const scoresData = scoresResponse.data.map(score => ({
                        ...score,
                        course: score.course,
                        score: score.score,
                        maxScore: 100,
                        percentage: (score.score / 100) * 100
                    }));
                    setScores(scoresData);

                    // Fetch courses for the student's branch and batch
                    const encodedBranch = encodeURIComponent(user.branch);
                    const encodedYear = encodeURIComponent(user.graduationYear);
                    const coursesResponse = await api.get(`/courses/branch/${encodedBranch}/batch/${encodedYear}`);
                    const coursesData = coursesResponse.data;
                    setCourses(coursesData);

                    // Generate semesters
                    const uniqueSemesters = [...new Set(scoresData.map(score => score.semester))];
                    const semestersList = ['All Semesters', ...uniqueSemesters.sort((a, b) => a - b)];
                    setSemesters(semestersList);

                    // Set the first course as selected if available
                    if (coursesData.length > 0 && !selectedCourse) {
                        setSelectedCourse(coursesData[0]._id);
                    }

                    // Fetch batch performance
                    const batchResponse = await api.get(`/scores/batch-performance/${encodedBranch}/${encodedYear}`);
                    setBatchPerformance(batchResponse.data);

                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching data:', err);
                    setError('Failed to load data. Please try again later.');
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [user, selectedCourse]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderPerformanceChart = () => {
        if (!scores.length) return null;

        // Filter scores based on selected semester
        const filteredScores = selectedSemester === 'All Semesters' 
            ? scores 
            : scores.filter(score => score.semester === selectedSemester);

        // Group scores by semester
        const groupedScores = {};
        filteredScores.forEach(score => {
            if (!groupedScores[score.semester]) {
                groupedScores[score.semester] = [];
            }
            groupedScores[score.semester].push(score);
        });

        return (
            <Box>
                {Object.entries(groupedScores).map(([semester, semesterScores]) => (
                    <Box key={semester} sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Semester {semester}
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={semesterScores.map(score => {
                                        const courseId = typeof score.course === 'object' ? score.course._id : score.course;
                                        const courseName = typeof score.course === 'object' ? score.course.name : score.course;
                                        const batchData = batchPerformance?.[courseId];
                                        const grade = getGrade(score.percentage);
                                        return {
                                            name: courseName,
                                            studentScore: score.percentage,
                                            batchAverage: batchData ? batchData.average : 0,
                                            grade: getGradeLabel(grade.letter, grade.points),
                                            cgpa: grade.points
                                        };
                                    })}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    barSize={50}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip 
                                        formatter={(value, name, props) => {
                                            if (name === 'studentScore' || name === 'batchAverage') {
                                                return [`${value.toFixed(2)}%`, value === 0 ? 'No Data' : null];
                                            }
                                            return [value, name];
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="studentScore" name="Your Score" fill={colors.primary} />
                                    <Bar dataKey="batchAverage" name="Batch Average" fill={colors.secondary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    };

    const renderBatchComparison = () => {
        if (!batchPerformance || !selectedCourse || !batchPerformance[selectedCourse]) {
            console.log('Early return: missing batchPerformance or selectedCourse');
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                        No batch performance data available.
                    </Typography>
                </Box>
            );
        }
        
        // Find the semester for the selected course
        const courseScore = scores.find(score => {
            const courseId = typeof score.course === 'object' ? score.course._id : score.course;
            return courseId === selectedCourse;
        });
        
        console.log('Found courseScore:', courseScore);
        
        if (!courseScore) {
            console.log('Early return: no courseScore found');
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                        No score data available for this course.
                    </Typography>
                </Box>
            );
        }
        
        const semester = courseScore.semester;
        const coursePerformance = batchPerformance[selectedCourse];
        
        console.log('Raw coursePerformance data:', coursePerformance);
        console.log('Course performance keys:', Object.keys(coursePerformance));
        
        if (!coursePerformance) {
            console.log('Early return: no coursePerformance found');
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                        No performance distribution data available for this course.
                    </Typography>
                </Box>
            );
        }

        // Calculate student's score and grade
        const studentScore = (courseScore.score / courseScore.maxScore) * 100;
        const studentGrade = getGrade(studentScore);

        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                    Your Grade
                                </Typography>
                                <Typography variant="h3" sx={{ color: colors.primary }}>
                                    {studentGrade.letter}
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.text }}>
                                    Score: {studentScore.toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.text }}>
                                    Grade Points: {studentGrade.points}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                    Class Average
                                </Typography>
                                <Typography variant="h3" sx={{ color: colors.primary }}>
                                    {coursePerformance.average ? coursePerformance.average.toFixed(1) : 0}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                    Grade Range
                                </Typography>
                                <Typography variant="h3" sx={{ color: colors.primary }}>
                                    {coursePerformance.lowest ? coursePerformance.lowest.toFixed(1) : 0}% - {coursePerformance.highest ? coursePerformance.highest.toFixed(1) : 0}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.text }}>
                                    Min - Max
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderSemesterProgress = () => {
        if (!scores.length) return null;
        
        // Group scores by semester
        const semesterScores = {};
        scores.forEach(score => {
            if (!semesterScores[score.semester]) {
                semesterScores[score.semester] = [];
            }
            semesterScores[score.semester].push(score);
        });
        
        // Calculate SGPA for each semester
        const semesterData = Object.entries(semesterScores).map(([semester, semesterScoreList]) => {
            // Calculate total credits and weighted grade points
            let totalCredits = 0;
            let totalWeightedPoints = 0;
            
            semesterScoreList.forEach(score => {
                const course = courses.find(c => {
                    const courseId = typeof score.course === 'object' ? score.course._id : score.course;
                    return c._id === courseId;
                });

                if (course) {
                    const credits = course.credits || 1; // Default to 1 credit if not specified
                    const percentage = (score.score / score.maxScore) * 100;
                    const grade = getGrade(percentage);
                    totalCredits += credits;
                    totalWeightedPoints += credits * grade.points;
                }
            });
            
            const sgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
            console.log(`Semester ${semester} - Credits: ${totalCredits}, Points: ${totalWeightedPoints}, SGPA: ${sgpa}`);
            
            return {
                semester: `Semester ${semester}`,
                sgpa: parseFloat(sgpa.toFixed(2))
            };
        });
        
        // Sort semesters chronologically
        semesterData.sort((a, b) => {
            const semA = parseInt(a.semester.split(' ')[1]);
            const semB = parseInt(b.semester.split(' ')[1]);
            return semA - semB;
        });

        console.log('Semester Data:', semesterData);
        
        return (
            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={semesterData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                        <XAxis dataKey="semester" />
                        <YAxis 
                            domain={[0, 10]} 
                            ticks={[0, 2, 4, 6, 8, 10]} 
                            label={{ 
                                value: 'SGPA', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <Tooltip 
                            formatter={(value) => [value.toFixed(2), "SGPA"]}
                            contentStyle={{
                                backgroundColor: colors.tertiary,
                                border: `1px solid ${colors.primary}`
                            }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="sgpa" 
                            name="SGPA" 
                            stroke={colors.primary} 
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const calculateCGPA = () => {
        let totalCredits = 0;
        let totalWeightedPoints = 0;

        scores.forEach(score => {
            const course = courses.find(c => {
                const courseId = typeof score.course === 'object' ? score.course._id : score.course;
                return c._id === courseId;
            });

            if (course) {
                const credits = course.credits || 1;
                const percentage = (score.score / score.maxScore) * 100;
                const grade = getGrade(percentage);
                totalCredits += credits;
                totalWeightedPoints += credits * grade.points;
            }
        });

        return totalCredits > 0 ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: colors.text }}>
                Student Dashboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Paper sx={{ width: '100%', mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Performance Overview" />
                    <Tab label="Semester-wise Performance" />
                    <Tab label="Course Statistics" />
                    <Tab label="Semester Progress" />
                </Tabs>
                
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ height: '100%', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                        CGPA
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: colors.primary }}>
                                        {calculateCGPA()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.text }}>
                                        Overall Performance
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ height: '100%', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                        Total Courses
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: colors.primary }}>
                                        {courses.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ height: '100%', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                        Branch
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: colors.primary }}>
                                        {user.branch}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card sx={{ height: '100%', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                                        Graduation Year
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: colors.primary }}>
                                        {user.graduationYear}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress sx={{ color: colors.primary }} />
                        </Box>
                    ) : scores.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Course</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: colors.text }}>Semester</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.text }}>Score</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.text }}>Max Score</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.text }}>Percentage</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.text }}>Grade</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.text }}>Grade Points</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scores.map((score) => {
                                        const percentage = (score.score / score.maxScore) * 100;
                                        const grade = getGrade(percentage);
                                        return (
                                            <TableRow key={score._id}>
                                                <TableCell>{typeof score.course === 'object' ? score.course.name : score.course}</TableCell>
                                                <TableCell>{score.semester}</TableCell>
                                                <TableCell align="right">{score.score}</TableCell>
                                                <TableCell align="right">{score.maxScore}</TableCell>
                                                <TableCell align="right">{percentage.toFixed(2)}%</TableCell>
                                                <TableCell align="right">{grade.letter}</TableCell>
                                                <TableCell align="right">{grade.points.toFixed(2)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body1" sx={{ mt: 3, textAlign: 'center', color: colors.text }}>
                            No scores available yet.
                        </Typography>
                    )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Semester</InputLabel>
                            <Select
                                value={selectedSemester}
                                label="Select Semester"
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                {semesters.map((semester) => (
                                    <MenuItem key={semester} value={semester}>
                                        {semester}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress sx={{ color: colors.primary }} />
                        </Box>
                    ) : (
                        renderPerformanceChart()
                    )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Course</InputLabel>
                            <Select
                                value={selectedCourse}
                                label="Select Course"
                                onChange={(e) => {
                                    console.log('Course selected:', e.target.value);
                                    console.log('Available courses:', courses);
                                    setSelectedCourse(e.target.value);
                                }}
                            >
                                {courses.map((course) => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress sx={{ color: colors.primary }} />
                        </Box>
                    ) : (
                        renderBatchComparison()
                    )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={3}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress sx={{ color: colors.primary }} />
                        </Box>
                    ) : (
                        renderSemesterProgress()
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default StudentDashboard; 