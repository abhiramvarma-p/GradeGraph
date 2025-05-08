import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    useTheme
} from '@mui/material';
import {
    Timeline as TimelineIcon,
    Assessment as AssessmentIcon,
    Compare as CompareIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';

const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const features = [
        {
            title: 'Performance Tracking',
            description: 'Track your academic progress with detailed performance metrics and visualizations',
            icon: <TimelineIcon sx={{ fontSize: 40 }} />,
        },
        {
            title: 'Grade Analysis',
            description: 'Get comprehensive analysis of your grades across semesters and subjects',
            icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
        },
        {
            title: 'Batch Comparison',
            description: 'Compare your performance with batch averages and statistics',
            icon: <CompareIcon sx={{ fontSize: 40 }} />,
        },
        {
            title: 'Report Generation',
            description: 'Generate and export detailed academic reports in multiple formats',
            icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
        },
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            pt: 8,
            pb: 6 
        }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: 'Futura Medium',
                            color: 'text.primary',
                            mb: 2
                        }}
                    >
                        Track Your Academic Journey
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'text.secondary',
                            mb: 4,
                            maxWidth: 600,
                            mx: 'auto'
                        }}
                    >
                        A comprehensive platform to monitor and analyze your academic performance
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        borderColor: 'primary.main',
                                        '& .feature-icon': {
                                            color: 'primary.main',
                                            transform: 'scale(1.1)',
                                        }
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box
                                        className="feature-icon"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 2,
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 2,
                                            fontFamily: 'Futura Medium',
                                            color: 'text.primary'
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Home; 