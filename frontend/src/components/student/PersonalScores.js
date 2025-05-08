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
    TableRow,
    Chip
} from '@mui/material';
import { apiService } from '../../utils/api';

const PersonalScores = () => {
    const { user } = useAuth();
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [semesters, setSemesters] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);

    useEffect(() => {
        fetchScores();
    }, []);

    useEffect(() => {
        if (scores.length > 0) {
            filterScores();
        }
    }, [scores, selectedSemester]);

    const fetchScores = async () => {
        try {
            setLoading(true);
            
            const response = await apiService.getStudentScores(user._id);
            const scoresData = response.data;
            
            // Extract unique semesters
            const uniqueSemesters = [...new Set(scoresData.map(score => score.semester))];
            
            setSemesters(uniqueSemesters);
            setScores(scoresData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching scores:', err);
            setError('Failed to load scores. Please try again later.');
            setLoading(false);
        }
    };

    const handleSemesterChange = (event) => {
        setSelectedSemester(event.target.value);
    };

    const filterScores = () => {
        let filtered = [...scores];
        
        if (selectedSemester !== 'all') {
            filtered = filtered.filter(score => score.semester === selectedSemester);
        }
        
        // Sort by semester and subject
        filtered.sort((a, b) => {
            if (a.semester !== b.semester) {
                return a.semester - b.semester;
            }
            return a.subject.localeCompare(b.subject);
        });
        
        setFilteredScores(filtered);
    };

    const getGradeColor = (score) => {
        if (score >= 90) return 'success';
        if (score >= 80) return 'info';
        if (score >= 70) return 'warning';
        if (score >= 60) return 'error';
        return 'default';
    };

    const getGrade = (score) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Personal Scores
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <FormControl sx={{ minWidth: 200, mb: 2 }}>
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

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredScores.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Semester</TableCell>
                                            <TableCell>Subject</TableCell>
                                            <TableCell align="right">Score</TableCell>
                                            <TableCell align="right">Grade</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredScores.map((score) => (
                                            <TableRow key={`${score.semester}-${score.subject}`}>
                                                <TableCell>Semester {score.semester}</TableCell>
                                                <TableCell>{score.subject}</TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={score.score}
                                                        color={getGradeColor(score.score)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={getGrade(score.score)}
                                                        color={getGradeColor(score.score)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No scores available.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PersonalScores; 