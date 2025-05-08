import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StudentScores from './StudentScores';
import UserManagement from './UserManagement';
import CurriculumManagement from './CurriculumManagement';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [addEducatorDialogOpen, setAddEducatorDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    collegeId: '',
    branch: '',
    graduationYear: new Date().getFullYear() + 4,
    role: 'student'
  });
  const [newEducator, setNewEducator] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    designation: '',
    role: 'educator'
  });
  const [batchGroups, setBatchGroups] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoresDialogOpen, setScoresDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchUsers();
    fetchBranches();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Filter students and educators from users
    if (users.length > 0) {
      setStudents(users.filter(user => user.role === 'student'));
      setEducators(users.filter(user => user.role === 'educator'));
    }
  }, [users]);

  useEffect(() => {
    // Group students by batch and branch
    if (students.length > 0) {
      const groups = students.reduce((acc, student) => {
        const key = `${student.branch}-${student.graduationYear}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(student);
        return acc;
      }, {});
      setBatchGroups(groups);
    }
  }, [students]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to fetch users. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setError('');
      const response = await api.get('/auth/branches');
      setBranches(response.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to fetch branches. Please try again later.');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewEducatorChange = (e) => {
    const { name, value } = e.target;
    setNewEducator(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError('');
      await api.delete(`/users/${selectedUser._id}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Error deleting user. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleAddStudent = async () => {
    try {
      setError('');
      // Generate a random password for the student
      const randomPassword = Math.random().toString(36).slice(-8);
      
      // Add the password to the student data
      const studentData = {
        ...newStudent,
        password: randomPassword
      };
      
      await api.post('/auth/register', studentData);
      setSuccess('Student added successfully');
      fetchUsers();
      setAddStudentDialogOpen(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        collegeId: '',
        branch: '',
        graduationYear: new Date().getFullYear() + 4,
        role: 'student'
      });
    } catch (err) {
      console.error('Error adding student:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Error adding student. Please try again.');
      }
    }
  };

  const handleAddEducator = async () => {
    try {
      setError('');
      // Generate a random password for the educator
      const randomPassword = Math.random().toString(36).slice(-8);
      
      // Add the password to the educator data
      const educatorData = {
        ...newEducator,
        password: randomPassword
      };
      
      await api.post('/auth/register', educatorData);
      setSuccess('Educator added successfully');
      fetchUsers();
      setAddEducatorDialogOpen(false);
      setNewEducator({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        designation: '',
        role: 'educator'
      });
    } catch (err) {
      console.error('Error adding educator:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Error adding educator. Please try again.');
      }
    }
  };

  const handleViewScores = (student) => {
    setSelectedStudent(student);
    setScoresDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<PeopleIcon />}
            label="User Management"
            iconPosition="start"
          />
          <Tab
            icon={<SchoolIcon />}
            label="Curriculum Management"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <UserManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <CurriculumManagement />
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog
        open={addStudentDialogOpen}
        onClose={() => setAddStudentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={newStudent.firstName}
                onChange={handleNewStudentChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={newStudent.lastName}
                onChange={handleNewStudentChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newStudent.email}
                onChange={handleNewStudentChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="College ID"
                name="collegeId"
                value={newStudent.collegeId}
                onChange={handleNewStudentChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  name="branch"
                  value={newStudent.branch}
                  onChange={handleNewStudentChange}
                  label="Branch"
                  required
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Expected Graduation Year</InputLabel>
                <Select
                  name="graduationYear"
                  value={newStudent.graduationYear}
                  onChange={handleNewStudentChange}
                  label="Expected Graduation Year"
                  required
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} color="primary">
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Educator Dialog */}
      <Dialog
        open={addEducatorDialogOpen}
        onClose={() => setAddEducatorDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Educator</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={newEducator.firstName}
                onChange={handleNewEducatorChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={newEducator.lastName}
                onChange={handleNewEducatorChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newEducator.email}
                onChange={handleNewEducatorChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={newEducator.department}
                onChange={handleNewEducatorChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={newEducator.designation}
                onChange={handleNewEducatorChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEducatorDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEducator} color="primary">
            Add Educator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Scores Dialog */}
      <Dialog
        open={scoresDialogOpen}
        onClose={() => setScoresDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Manage Scores for {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && <StudentScores student={selectedStudent} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoresDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 