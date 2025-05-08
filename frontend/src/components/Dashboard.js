import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardHeader
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

// Sample data for demonstration
const sampleData = [
    { name: 'Semester 1', score: 75 },
    { name: 'Semester 2', score: 82 },
    { name: 'Semester 3', score: 78 },
    { name: 'Semester 4', score: 85 },
    { name: 'Semester 5', score: 88 },
    { name: 'Semester 6', score: 92 }
];

const Dashboard = () => {
    const { user } = useAuth();

    const renderStudentDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Welcome, {user.firstName}!
                    </Typography>
                    <Typography variant="body1">
                        College ID: {user.collegeId}
                    </Typography>
                    <Typography variant="body1">
                        Branch: {user.branch}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="Academic Performance" />
                    <CardContent>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sampleData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                        <Typography variant="body1" gutterBottom>
                            • View your grades
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • Track your progress
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • Update your profile
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderEducatorDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Welcome, {user.firstName}!
                    </Typography>
                    <Typography variant="body1">
                        Access Level: {user.accessLevel}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                        <Typography variant="body1" gutterBottom>
                            • View student records
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • Update grades
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderAdminDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Welcome, {user.firstName}!
                    </Typography>
                    <Typography variant="body1">
                        Access Level: {user.accessLevel}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="System Overview" />
                    <CardContent>
                        <Typography variant="body1" gutterBottom>
                            • Total Students: 500
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • Total Educators: 50
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • Active Courses: 25
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                        <Typography variant="body1" gutterBottom>
                            • Manage users
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • View system logs
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            • Configure settings
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {user.role === 'student' && renderStudentDashboard()}
            {user.role === 'educator' && renderEducatorDashboard()}
            {user.role === 'admin' && renderAdminDashboard()}
        </Container>
    );
};

export default Dashboard; 