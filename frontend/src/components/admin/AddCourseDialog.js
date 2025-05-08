import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

const AddCourseDialog = ({ open, onClose, onCourseAdded }) => {
  const [courseData, setCourseData] = useState({
    name: '',
    code: '',
    duration: '4',
    isIntegrated: false,
    description: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      onCourseAdded();
      onClose();
      setCourseData({
        name: '',
        code: '',
        duration: '4',
        isIntegrated: false,
        description: '',
      });
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Course</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Name"
                name="name"
                value={courseData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Code"
                name="code"
                value={courseData.code}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Duration (Years)</InputLabel>
                <Select
                  name="duration"
                  value={courseData.duration}
                  onChange={handleChange}
                  label="Duration (Years)"
                >
                  <MenuItem value="4">4 Years</MenuItem>
                  <MenuItem value="5">5 Years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Course Type</InputLabel>
                <Select
                  name="isIntegrated"
                  value={courseData.isIntegrated}
                  onChange={handleChange}
                  label="Course Type"
                >
                  <MenuItem value={false}>Regular</MenuItem>
                  <MenuItem value={true}>Integrated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={courseData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Course
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCourseDialog; 