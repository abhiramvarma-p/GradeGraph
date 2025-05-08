import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Avatar,
    Badge,
    Tooltip,
    useTheme,
    useMediaQuery,
    Button,
    Typography,
    Stack
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    AccountCircle,
    FileDownload as ExportIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import ExportDialog from './common/ExportDialog';
import { exportStudentGrades, exportCourseGrades, exportBatchCGPA } from '../utils/exportUtils';

const Navbar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/login');
    };

    const handleProfile = () => {
        handleClose();
        if (user) {
            navigate(`/profile/${user.role}`);
        }
    };

    const handleDashboard = () => {
        if (user) {
            navigate('/student/dashboard');
        }
    };

    const handleExport = async (branch, year, courseId) => {
        try {
            if (user.role === 'student') {
                await exportStudentGrades(user._id);
            } else if (user.role === 'educator') {
                await exportCourseGrades(branch, year, courseId);
            } else if (user.role === 'admin') {
                await exportBatchCGPA(branch, year);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
                <IconButton 
                    onClick={handleHome} 
                    sx={{ 
                        p: 0,
                        width: 'fit-content',
                        height: 'fit-content'
                    }}
                >
                    <Logo size="medium" />
                </IconButton>

                {isAuthenticated && (
                    <Stack direction="row" spacing={4} sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        <Typography
                            variant="h6"
                            onClick={handleDashboard}
                            sx={{
                                fontFamily: 'Futura Book',
                                color: 'white',
                                cursor: 'pointer',
                                letterSpacing: '0.1em',
                                fontSize: '1.25rem',
                                '&:hover': {
                                    color: 'rgba(255, 255, 255, 0.8)'
                                }
                            }}
                        >
                            DASHBOARD
                        </Typography>
                        <Typography
                            variant="h6"
                            onClick={() => setExportDialogOpen(true)}
                            sx={{
                                fontFamily: 'Futura Book',
                                color: 'white',
                                cursor: 'pointer',
                                letterSpacing: '0.1em',
                                fontSize: '1.25rem',
                                '&:hover': {
                                    color: 'rgba(255, 255, 255, 0.8)'
                                }
                            }}
                        >
                            EXPORT REPORTS
                        </Typography>
                    </Stack>
                )}

                <Box sx={{ flexGrow: 1 }} />

                {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Profile">
                            <IconButton onClick={handleMenu}>
                                <Avatar 
                                    sx={{ 
                                        width: 32, 
                                        height: 32,
                                        bgcolor: theme.palette.primary.main,
                                        fontSize: '0.875rem',
                                        fontFamily: 'Futura Book'
                                    }}
                                >
                                    {user.firstName[0]}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="outlined"
                            sx={{
                                color: 'white',
                                borderColor: 'white',
                                fontFamily: 'Futura Book',
                                '&:hover': {
                                    borderColor: 'rgba(255, 255, 255, 0.8)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                }
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="contained"
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                fontFamily: 'Futura Book',
                                '&:hover': {
                                    bgcolor: theme.palette.primary.dark
                                }
                            }}
                        >
                            Register
                        </Button>
                    </Box>
                )}

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            minWidth: 180,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem 
                        onClick={handleProfile}
                        sx={{ fontFamily: 'Futura Book' }}
                    >
                        Profile
                    </MenuItem>
                    <MenuItem 
                        onClick={handleLogout}
                        sx={{ fontFamily: 'Futura Book' }}
                    >
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
            <ExportDialog
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
                userType={user?.role}
                onExport={handleExport}
            />
        </AppBar>
    );
};

export default Navbar; 