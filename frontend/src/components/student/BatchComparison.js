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
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
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
    ReferenceLine
} from 'recharts';
import { apiService } from '../../utils/api';

const BatchComparison = () => {
    const { user } = useAuth();
    const [personalScores, setPersonalScores] = useState([]);
    const [batchScores, setBatchScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [semesters, setSemesters] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (personalScores.length > 0 && batchScores.length > 0) {
            generateComparisonData();
        }
    }, [personalScores, batchScores, selectedSemester]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch personal scores
            const personalResponse = await apiService.getStudentScores(user._id);
            const personalScoresData = personalResponse.data;
            
            // Fetch batch scores
            const batchResponse = await apiService.getBatchAverages(user.branch);
            const batchScoresData = batchResponse.data;
            
            // Extract unique semesters
            const uniqueSemesters = [...new Set(personalScoresData.map(score => score.semester))];
            
            setSemesters(uniqueSemesters);
            setPersonalScores(personalScoresData);
            setBatchScores(batchScoresData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load comparison data. Please try again later.');
            setLoading(false);
        }
    };

    const handleSemesterChange = (event) => {
        setSelectedSemester(event.target.value);
    };

    const generateComparisonData = () => {
        // Filter scores based on selected semester
        let filteredPersonalScores = [...personalScores];
        let filteredBatchScores = [...batchScores];
        
        if (selectedSemester !== 'all') {
            filteredPersonalScores = filteredPersonalScores.filter(score => score.semester === selectedSemester);
            filteredBatchScores = filteredBatchScores.filter(score => score.semester === selectedSemester);
        }
        
        // Group scores by subject
        const subjects = [...new Set(filteredPersonalScores.map(score => score.subject))];
        
        const comparison = subjects.map(subject => {
            const personalScore = filteredPersonalScores.find(score => score.subject === subject);
            const batchScore = filteredBatchScores.find(score => score.subject === subject);
            
            return {
                subject: subject,
                personalScore: personalScore ? personalScore.score : 0,
                batchAverage: batchScore ? batchScore.average : 0,
                difference: personalScore && batchScore ? personalScore.score - batchScore.average : 0
            };
        });
        
        setComparisonData(comparison);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Batch Comparison
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
                                        {semester}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                <CircularProgress />
                            </Box>
                        ) : comparisonData.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={comparisonData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="personalScore" name="Your Score" fill="#8884d8" />
                                        <Bar dataKey="batchAverage" name="Batch Average" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No comparison data available.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
                
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell align="right">Your Score</TableCell>
                                        <TableCell align="right">Batch Average</TableCell>
                                        <TableCell align="right">Difference</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {comparisonData.map((row) => (
                                        <TableRow key={row.subject}>
                                            <TableCell component="th" scope="row">
                                                {row.subject}
                                            </TableCell>
                                            <TableCell align="right">{row.personalScore}</TableCell>
                                            <TableCell align="right">{row.batchAverage}</TableCell>
                                            <TableCell 
                                                align="right"
                                                sx={{ 
                                                    color: row.difference > 0 ? 'success.main' : 
                                                          row.difference < 0 ? 'error.main' : 'text.primary'
                                                }}
                                            >
                                                {row.difference > 0 ? '+' : ''}{row.difference}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BatchComparison; 