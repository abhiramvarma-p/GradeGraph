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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { apiService } from '../../utils/api';

const PerformanceTrends = () => {
    const { user } = useAuth();
    const [scores, setScores] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            setLoading(true);
            const response = await apiService.getStudentScores(user._id);
            const scoresData = response.data;
            
            // Extract unique subjects
            const uniqueSubjects = [...new Set(scoresData.map(score => score.subject))];
            setSubjects(uniqueSubjects);
            
            // Sort scores by date
            const sortedScores = scoresData.sort((a, b) => new Date(a.date) - new Date(b.date));
            setScores(sortedScores);
            setFilteredScores(sortedScores);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching scores:', err);
            setError('Failed to load performance data. Please try again later.');
            setLoading(false);
        }
    };

    const handleSubjectChange = (event) => {
        const subject = event.target.value;
        setSelectedSubject(subject);
        
        if (subject === 'all') {
            setFilteredScores(scores);
        } else {
            const filtered = scores.filter(score => score.subject === subject);
            setFilteredScores(filtered);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Calculate performance trend (improving, declining, or stable)
    const calculateTrend = () => {
        if (filteredScores.length < 2) return { status: 'insufficient data', color: 'text.secondary' };
        
        const firstScore = filteredScores[0].score;
        const lastScore = filteredScores[filteredScores.length - 1].score;
        const difference = lastScore - firstScore;
        
        if (difference > 5) return { status: 'improving', color: 'success.main' };
        if (difference < -5) return { status: 'declining', color: 'error.main' };
        return { status: 'stable', color: 'info.main' };
    };

    const trend = calculateTrend();

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Performance Trends
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <FormControl fullWidth>
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
                        
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Performance Status:
                            </Typography>
                            <Typography variant="body1" color={trend.color}>
                                {trend.status.charAt(0).toUpperCase() + trend.status.slice(1)}
                            </Typography>
                        </Box>
                        
                        {filteredScores.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Score Range:
                                </Typography>
                                <Typography variant="body1">
                                    Lowest: {Math.min(...filteredScores.map(s => s.score))}
                                </Typography>
                                <Typography variant="body1">
                                    Highest: {Math.max(...filteredScores.map(s => s.score))}
                                </Typography>
                                <Typography variant="body1">
                                    Average: {(filteredScores.reduce((sum, s) => sum + s.score, 0) / filteredScores.length).toFixed(2)}
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
                        ) : filteredScores.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={filteredScores.map(score => ({
                                            ...score,
                                            date: formatDate(score.date)
                                        }))}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            name="Score"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No performance data available.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PerformanceTrends; 