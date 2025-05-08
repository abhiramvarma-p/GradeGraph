import express from 'express';
import { auth } from '../middleware/auth';
import { exportCourseGrades, exportBatchCGPA, exportStudentGrades } from '../controllers/exportController';

const router = express.Router();

// Export course grades (educator)
router.get('/course/:courseId', auth, exportCourseGrades);

// Export batch CGPA (admin)
router.get('/batch-cgpa', auth, exportBatchCGPA);

// Export student grades (student)
router.get('/student/:studentId', auth, exportStudentGrades);

export default router; 