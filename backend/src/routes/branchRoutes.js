import express from 'express';
import { getBranches, getBranchCourses } from '../controllers/branchController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all branches
router.get('/', auth, getBranches);

// Get courses for a specific branch and year
router.get('/courses', auth, getBranchCourses);

export default router; 