import React, { useState, useEffect } from 'react';
import {
  Box,
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

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

const StudentScores = ({ student }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scores, setScores] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [addScoreDialogOpen, setAddScoreDialogOpen] = useState(false);
  const [editScoreDialogOpen, setEditScoreDialogOpen] = useState(false);
  const [deleteScoreDialogOpen, setDeleteScoreDialogOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null);
  const [newScore, setNewScore] = useState({
    studentId: '',
    course: '',
    score: '',
    semester: '',
    maxScore: 100
  });

  useEffect(() => {
    if (student) {
      fetchScores();
      fetchCourses();
      generateSemesters();
    }
  }, [student]);

  const generateSemesters = () => {
    // Generate semesters based on graduation year
    const currentYear = new Date().getFullYear();
    const graduationYear = parseInt(student.graduationYear);
    const yearsToGraduation = graduationYear - currentYear;
    
    const semestersList = [];
    for (let year = 0; year < yearsToGraduation; year++) {
      semestersList.push(`${year + 1}-1`); // First semester
      semestersList.push(`${year + 1}-2`); // Second semester
    }
    
    setSemesters(semestersList);
  };

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/students/${student._id}/scores`);
      setScores(response.data);
    } catch (err) {
      console.error('Error fetching scores:', err);
      setError('Failed to fetch scores. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/courses`, {
        params: {
          branch: student.branch,
          graduationYear: student.graduationYear
        }
      });
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again later.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNewScoreChange = (e) => {
    const { name, value } = e.target;
    setNewScore(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddScore = async () => {
    try {
      setError('');
      const scoreData = {
        ...newScore,
        studentId: student._id
      };
      
      await api.post('/scores', scoreData);
      setSuccess('Score added successfully');
      fetchScores();
      setAddScoreDialogOpen(false);
      setNewScore({
        studentId: '',
        course: '',
        score: '',
        semester: '',
        maxScore: 100
      });
    } catch (err) {
      console.error('Error adding score:', err);
      setError(err.response?.data?.message || 'Error adding score. Please try again.');
    }
  };

  const handleEditScore = async () => {
    try {
      setError('');
      await api.put(`/scores/${selectedScore._id}`, selectedScore);
      setSuccess('Score updated successfully');
      fetchScores();
      setEditScoreDialogOpen(false);
      setSelectedScore(null);
    } catch (err) {
      console.error('Error updating score:', err);
      setError(err.response?.data?.message || 'Error updating score. Please try again.');
    }
  };

  const handleDeleteClick = (score) => {
    setSelectedScore(score);
    setDeleteScoreDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError('');
      await api.delete(`/scores/${selectedScore._id}`);
      setSuccess('Score deleted successfully');
      fetchScores();
    } catch (err) {
      console.error('Error deleting score:', err);
      setError(err.response?.data?.message || 'Error deleting score. Please try again.');
    } finally {
      setDeleteScoreDialogOpen(false);
      setSelectedScore(null);
    }
  };

  const handleEditClick = (score) => {
    setSelectedScore({ ...score });
    setEditScoreDialogOpen(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Manage Scores for {student.firstName} {student.lastName}
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

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Scores" />
          <Tab label="By Semester" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddScoreDialogOpen(true)}
            >
              Add Score
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Max Score</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scores.length > 0 ? (
                    scores.map((score) => (
                      <TableRow key={score._id}>
                        <TableCell>{score.course}</TableCell>
                        <TableCell>{score.semester}</TableCell>
                        <TableCell align="right">{score.score}</TableCell>
                        <TableCell align="right">{score.maxScore}</TableCell>
                        <TableCell align="right">
                          {((score.score / score.maxScore) * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(score)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(score)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No scores available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {semesters.map((semester) => {
                const semesterScores = scores.filter(s => s.semester === semester);
                return (
                  <Grid item xs={12} key={semester}>
                    <Card>
                      <CardHeader title={`Semester ${semester}`} />
                      <CardContent>
                        {semesterScores.length > 0 ? (
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Course</TableCell>
                                  <TableCell align="right">Score</TableCell>
                                  <TableCell align="right">Max Score</TableCell>
                                  <TableCell align="right">Percentage</TableCell>
                                  <TableCell>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {semesterScores.map((score) => (
                                  <TableRow key={score._id}>
                                    <TableCell>{score.course}</TableCell>
                                    <TableCell align="right">{score.score}</TableCell>
                                    <TableCell align="right">{score.maxScore}</TableCell>
                                    <TableCell align="right">
                                      {((score.score / score.maxScore) * 100).toFixed(2)}%
                                    </TableCell>
                                    <TableCell>
                                      <IconButton
                                        color="primary"
                                        onClick={() => handleEditClick(score)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(score)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="body1" color="text.secondary">
                            No scores available for this semester
                          </Typography>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              setNewScore(prev => ({
                                ...prev,
                                studentId: student._id,
                                semester: semester
                              }));
                              setAddScoreDialogOpen(true);
                            }}
                          >
                            Add Score
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Add Score Dialog */}
      <Dialog
        open={addScoreDialogOpen}
        onClose={() => setAddScoreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Score</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  name="course"
                  value={newScore.course}
                  onChange={handleNewScoreChange}
                  label="Course"
                  required
                >
                  {courses.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={newScore.semester}
                  onChange={handleNewScoreChange}
                  label="Semester"
                  required
                >
                  {semesters.map((semester) => (
                    <MenuItem key={semester} value={semester}>
                      Semester {semester}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Score"
                name="score"
                type="number"
                value={newScore.score}
                onChange={handleNewScoreChange}
                required
                inputProps={{ min: 0, max: newScore.maxScore }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Score"
                name="maxScore"
                type="number"
                value={newScore.maxScore}
                onChange={handleNewScoreChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddScoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddScore} color="primary">
            Add Score
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Score Dialog */}
      <Dialog
        open={editScoreDialogOpen}
        onClose={() => setEditScoreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Score</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course"
                name="course"
                value={selectedScore?.course || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Semester"
                name="semester"
                value={selectedScore?.semester || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Score"
                name="score"
                type="number"
                value={selectedScore?.score || ''}
                onChange={(e) => setSelectedScore(prev => ({
                  ...prev,
                  score: e.target.value
                }))}
                required
                inputProps={{ min: 0, max: selectedScore?.maxScore }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Score"
                name="maxScore"
                type="number"
                value={selectedScore?.maxScore || ''}
                onChange={(e) => setSelectedScore(prev => ({
                  ...prev,
                  maxScore: e.target.value
                }))}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditScoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditScore} color="primary">
            Update Score
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteScoreDialogOpen}
        onClose={() => setDeleteScoreDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this score?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteScoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentScores; 