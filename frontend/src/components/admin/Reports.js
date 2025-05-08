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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

const Reports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');

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
        if (selectedBranch && selectedBatch) {
            fetchReports();
        }
    }, [selectedBranch, selectedBatch]);

    const fetchReports = async () => {
        try {
            const response = await api.get(`/api/scores/batch-performance/${selectedBranch}/${selectedBatch}`);
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Performance Reports
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            label="Branch"
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
                        <InputLabel>Batch Year</InputLabel>
                        <Select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            label="Batch Year"
                        >
                            {batchYears.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {reports.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Course</TableCell>
                                <TableCell>Average Score</TableCell>
                                <TableCell>Highest Score</TableCell>
                                <TableCell>Lowest Score</TableCell>
                                <TableCell>Total Students</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((report, index) => (
                                <TableRow key={index}>
                                    <TableCell>{report.course}</TableCell>
                                    <TableCell>{report.average.toFixed(2)}</TableCell>
                                    <TableCell>{report.highest}</TableCell>
                                    <TableCell>{report.lowest}</TableCell>
                                    <TableCell>{report.totalStudents}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Select a branch and batch year to view reports
                </Typography>
            )}
        </Box>
    );
};

export default Reports; 