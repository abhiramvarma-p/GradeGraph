import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Box
} from '@mui/material';
import {
    AccountCircle,
    ExitToApp as LogoutIcon,
    FileDownload as ExportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ExportDialog from '../common/ExportDialog';
import { exportStudentGrades, exportCourseGrades, exportBatchCGPA } from '../../utils/exportUtils';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
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
        navigate('/login');
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

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    GradeGraph
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        color="inherit"
                        startIcon={<ExportIcon />}
                        onClick={() => setExportDialogOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        Export
                    </Button>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
            <ExportDialog
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
                userType={user.role}
                onExport={handleExport}
            />
        </AppBar>
    );
};

export default Navbar; 