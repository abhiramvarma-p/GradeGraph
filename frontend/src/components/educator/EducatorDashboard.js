import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line
} from 'recharts';
import axios from 'axios';
import {
    Assessment as AssessmentIcon,
    People as PeopleIcon,
    BarChart as BarChartIcon,
} from '@mui/icons-material';
import ClassPerformance from './ClassPerformance';
import ScoreManagement from './ScoreManagement';

const EducatorDashboard = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [performanceData, setPerformanceData] = useState([]);
    const [courseData, setCourseData] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch students
            const studentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/students`);
            setStudents(studentsResponse.data);

            // Fetch performance data
            const performanceResponse = await axios.get(`${process.env.REACT_APP_API_URL}/scores/performance`);
            setPerformanceData(performanceResponse.data);

            // Fetch course data
            const courseResponse = await axios.get(`${process.env.REACT_APP_API_URL}/scores/courses`);
            setCourseData(courseResponse.data);
        } catch (err) {
            setError('Error fetching dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ScoreManagement />;
            case 1:
                return <ClassPerformance />;
            default:
                return <ScoreManagement />;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Educator Dashboard
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<BarChartIcon />}
                        label="Score Management"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<PeopleIcon />}
                        label="Class Performance"
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {renderTabContent()}
        </Container>
    );
};

export default EducatorDashboard; 