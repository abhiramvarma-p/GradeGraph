import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Typography,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { api } from '../../utils/api';
import { GRADE_COLORS, getGrade, getGradeLabel, mapBackendDistribution } from '../../utils/gradeUtils';

const GradeDistribution = () => {
    const { user } = useAuth();
    const [personalScores, setPersonalScores] = useState([]);
    const [batchScores, setBatchScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [studentPosition, setStudentPosition] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (personalScores.length > 0 && batchScores.length > 0) {
            generateDistributionData();
        }
    }, [personalScores, batchScores, selectedSubject, selectedSemester]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch personal scores
            const personalResponse = await api.get(`/scores/student/${user._id}`);
            const personalScoresData = personalResponse.data;
            console.log('Personal Scores:', personalScoresData);
            
            // Fetch batch performance data
            const encodedBranch = encodeURIComponent(user.branch);
            const encodedYear = encodeURIComponent(user.graduationYear);
            const batchResponse = await api.get(`/scores/batch-performance/${encodedBranch}/${encodedYear}`);
            const batchPerformanceData = batchResponse.data;
            console.log('Batch Performance Data:', batchPerformanceData);
            
            // Extract unique subjects and semesters
            const uniqueSubjects = [...new Set(personalScoresData.map(score => score.subject))];
            const uniqueSemesters = [...new Set(personalScoresData.map(score => score.semester))];
            
            setSubjects(uniqueSubjects);
            setSemesters(uniqueSemesters);
            setPersonalScores(personalScoresData);
            setBatchScores(batchPerformanceData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load grade distribution data. Please try again later.');
            setLoading(false);
        }
    };

    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
    };

    const handleSemesterChange = (event) => {
        setSelectedSemester(event.target.value);
    };

    const generateDistributionData = () => {
        console.log('Generating distribution data...');
        console.log('Personal Scores:', personalScores);
        console.log('Batch Scores:', batchScores);
        
        // Filter scores based on selected subject and semester
        let filteredPersonalScores = [...personalScores];
        let filteredBatchScores = { ...batchScores };
        
        if (selectedSubject !== 'all') {
            filteredPersonalScores = filteredPersonalScores.filter(score => score.subject === selectedSubject);
            // Filter batch scores by subject
            Object.keys(filteredBatchScores).forEach(courseId => {
                if (filteredBatchScores[courseId].courseName !== selectedSubject) {
                    delete filteredBatchScores[courseId];
                }
            });
        }
        
        if (selectedSemester !== 'all') {
            filteredPersonalScores = filteredPersonalScores.filter(score => score.semester === selectedSemester);
            // Filter batch scores by semester
            Object.keys(filteredBatchScores).forEach(courseId => {
                if (filteredBatchScores[courseId].semester !== selectedSemester) {
                    delete filteredBatchScores[courseId];
                }
            });
        }
        
        console.log('Filtered Personal Scores:', filteredPersonalScores);
        console.log('Filtered Batch Scores:', filteredBatchScores);

        // Calculate grade distribution from batch scores
        let gradeDistribution = [];
        Object.values(filteredBatchScores).forEach(courseData => {
            if (courseData.distribution) {
                const courseDistribution = mapBackendDistribution(courseData.distribution);
                if (gradeDistribution.length === 0) {
                    gradeDistribution = courseDistribution;
                } else {
                    // Combine distributions
                    courseDistribution.forEach((grade, index) => {
                        gradeDistribution[index].value += grade.value;
                    });
                }
            }
        });

        console.log('Grade Distribution:', gradeDistribution);
        const filteredDistribution = gradeDistribution.filter(item => item.value > 0);
        console.log('Filtered Distribution:', filteredDistribution);
        setDistributionData(filteredDistribution);
        
        // Calculate student's position
        if (filteredPersonalScores.length > 0) {
            const studentScore = (filteredPersonalScores[0].score / filteredPersonalScores[0].maxScore) * 100;
            const studentGrade = getGrade(studentScore);
            const gradeLabel = getGradeLabel(studentGrade.letter, studentGrade.points);
            
            // Calculate percentile
            const totalStudents = Object.values(filteredBatchScores).reduce((sum, course) => 
                sum + (course.distribution ? course.distribution.reduce((a, b) => a + b, 0) : 0), 0);
            const scoresBelow = Object.values(filteredBatchScores).reduce((sum, course) => {
                if (!course.distribution) return sum;
                const courseStudents = course.distribution.reduce((a, b) => a + b, 0);
                const courseAverage = course.average || 0;
                return sum + (courseAverage < studentScore ? courseStudents : 0);
            }, 0);
            const percentile = totalStudents > 0 ? Math.round((scoresBelow / totalStudents) * 100) : 0;
            
            setStudentPosition({
                score: studentScore,
                grade: gradeLabel,
                percentile: percentile
            });
        } else {
            setStudentPosition(null);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Grade Distribution
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="subject-select-label">Subject</InputLabel>
                            <Select
                                labelId="subject-select-label"
                                value={selectedSubject}
                                label="Subject"
                                onChange={handleSubjectChange}
                            >
                                <MenuItem value="all">All Subjects</MenuItem>
                                {subjects.map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel id="semester-select-label">Semester</InputLabel>
                            <Select
                                labelId="semester-select-label"
                                value={selectedSemester}
                                label="Semester"
                                onChange={handleSemesterChange}
                            >
                                <MenuItem value="all">All Semesters</MenuItem>
                                {semesters.map((semester) => (
                                    <MenuItem key={semester} value={semester}>
                                        Semester {semester}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {studentPosition && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Your Performance
                                </Typography>
                                <Typography variant="body1">
                                    Grade: {studentPosition.grade}
                                </Typography>
                                <Typography variant="body1">
                                    Score: {studentPosition.score.toFixed(1)}%
                                </Typography>
                                <Typography variant="body1">
                                    Percentile: {studentPosition.percentile}%
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                <CircularProgress />
                            </Box>
                        ) : distributionData.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
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
                                            {distributionData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={GRADE_COLORS[entry.name]}
                                                    stroke="#212121"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#FBF5E5',
                                                border: '1px solid #A35C7A',
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
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No distribution data available.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GradeDistribution; 