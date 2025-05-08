import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const AddStudentDialog = ({ open, onClose, batchId, onStudentAdded }) => {
  const [studentData, setStudentData] = useState({
    studentId: '',
    name: '',
    email: '',
    courses: [],
  });

  const [availableCourses, setAvailableCourses] = useState([]);

  const gradeOptions = [
    { grade: "A+", points: 10 },
    { grade: "A", points: 9 },
    { grade: "B+", points: 8 },
    { grade: "B", points: 7 },
    { grade: "C+", points: 6 },
    { grade: "C", points: 5 },
    { grade: "D", points: 4 },
    { grade: "F", points: 3 },
    { grade: "F", points: 2 },
    { grade: "F", points: 1 }
  ];

  useEffect(() => {
    if (open) {
      fetchAvailableCourses();
    }
  }, [open, batchId]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch(`/api/admin/batches/${batchId}/courses`);
      const data = await response.json();
      setAvailableCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCourse = () => {
    setStudentData((prev) => ({
      ...prev,
      courses: [
        ...prev.courses,
        {
          courseId: '',
          grade: '',
          gradePoints: 0,
          score: '',
        },
      ],
    }));
  };

  const handleRemoveCourse = (index) => {
    setStudentData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }));
  };

  const handleCourseChange = (index, field, value) => {
    if (field === 'grade') {
      const selectedGrade = gradeOptions.find(option => option.grade === value);
      setStudentData((prev) => ({
        ...prev,
        courses: prev.courses.map((course, i) =>
          i === index ? { ...course, [field]: value, gradePoints: selectedGrade ? selectedGrade.points : 0 } : course
        ),
      }));
    } else {
      setStudentData((prev) => ({
        ...prev,
        courses: prev.courses.map((course, i) =>
          i === index ? { ...course, [field]: value } : course
        ),
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentData,
          batchId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add student');
      }

      onStudentAdded();
      onClose();
      setStudentData({
        studentId: '',
        name: '',
        email: '',
        courses: [],
      });
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Student</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Student ID"
                name="studentId"
                value={studentData.studentId}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={studentData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={studentData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Courses and Grades</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddCourse}
                  variant="outlined"
                >
                  Add Course
                </Button>
              </Box>

              {studentData.courses.map((course, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Course</InputLabel>
                        <Select
                          value={course.courseId}
                          onChange={(e) => handleCourseChange(index, 'courseId', e.target.value)}
                          label="Course"
                          required
                        >
                          {availableCourses.map((availableCourse) => (
                            <MenuItem key={availableCourse.id} value={availableCourse.id}>
                              {availableCourse.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Score"
                        type="number"
                        value={course.score}
                        onChange={(e) => handleCourseChange(index, 'score', e.target.value)}
                        required
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Grade</InputLabel>
                        <Select
                          value={course.grade}
                          onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                          label="Grade"
                          required
                        >
                          {gradeOptions.map((option) => (
                            <MenuItem key={`${option.grade}-${option.points}`} value={option.grade}>
                              {option.grade} ({option.points} points)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveCourse(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Student
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddStudentDialog; 