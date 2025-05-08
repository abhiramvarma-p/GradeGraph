import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const GenerateReport = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState({
    attendance: false,
    assignments: false,
    quizzes: false,
    exams: false,
    participation: false,
  });
  const [format, setFormat] = useState('pdf');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleMetricChange = (event) => {
    setSelectedMetrics({
      ...selectedMetrics,
      [event.target.name]: event.target.checked,
    });
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/educator/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          startDate,
          endDate,
          metrics: selectedMetrics,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-report-${new Date().toISOString()}.${format}`;
      a.click();
      setSuccess(true);
      setError('');
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Generate Custom Report
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="individual">Individual Student Report</MenuItem>
                <MenuItem value="class">Class Performance Report</MenuItem>
                <MenuItem value="comparative">Comparative Analysis Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Metrics
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetrics.attendance}
                    onChange={handleMetricChange}
                    name="attendance"
                  />
                }
                label="Attendance"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetrics.assignments}
                    onChange={handleMetricChange}
                    name="assignments"
                  />
                }
                label="Assignments"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetrics.quizzes}
                    onChange={handleMetricChange}
                    name="quizzes"
                  />
                }
                label="Quizzes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetrics.exams}
                    onChange={handleMetricChange}
                    name="exams"
                  />
                }
                label="Exams"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetrics.participation}
                    onChange={handleMetricChange}
                    name="participation"
                  />
                }
                label="Class Participation"
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={format}
                label="Export Format"
                onChange={(e) => setFormat(e.target.value)}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Report generated successfully!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleGenerateReport}
              fullWidth
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default GenerateReport; 