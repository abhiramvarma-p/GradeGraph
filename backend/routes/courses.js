const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Course = require('../models/Course');
const { User } = require('../models/User');

// Get all courses
router.get('/', auth, async (req, res) => {
    try {
        const { branch, semester, educatorId } = req.query;
        let query = { isActive: true };

        if (branch) {
            query.branch = branch;
        }

        if (semester) {
            query.semester = semester;
        }

        if (educatorId) {
            query.educator = educatorId;
        }

        const courses = await Course.find(query)
            .sort({ branch: 1, batchYear: 1, semester: 1, name: 1 });
        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all courses for a branch and batch
router.get('/branch/:branch/batch/:batchYear', auth, async (req, res) => {
    try {
        const courses = await Course.find({
            branch: req.params.branch,
            batchYear: parseInt(req.params.batchYear),
            isActive: true
        }).sort({ semester: 1, name: 1 });

        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get courses for a specific semester
router.get('/branch/:branch/batch/:batchYear/semester/:semester', auth, async (req, res) => {
    try {
        const courses = await Course.find({
            branch: req.params.branch,
            batchYear: parseInt(req.params.batchYear),
            semester: parseInt(req.params.semester),
            isActive: true
        }).sort({ name: 1 });

        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get courses for an educator
router.get('/educator/:educatorId', auth, async (req, res) => {
    try {
        const courses = await Course.find({ 
            educator: req.params.educatorId,
            isActive: true
        }).sort({ branch: 1, batchYear: 1, semester: 1, name: 1 });
        
        res.json(courses);
    } catch (err) {
        console.error('Error fetching educator courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new course (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        console.log('Received course data:', req.body);
        
        const { name, code, description, semester, branch, credits, courseType, maxScore, batchYear, educator } = req.body;

        // Validate required fields
        if (!name || !code || !description || !semester || !branch || !credits || !courseType || !batchYear) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missing: {
                    name: !name,
                    code: !code,
                    description: !description,
                    semester: !semester,
                    branch: !branch,
                    credits: !credits,
                    courseType: !courseType,
                    batchYear: !batchYear
                }
            });
        }

        // Check if course already exists
        const existingCourse = await Course.findOne({ 
            code, 
            branch, 
            semester, 
            batchYear 
        });

        if (existingCourse) {
            return res.status(400).json({ 
                message: 'Course already exists for this branch, semester, and batch year' 
            });
        }

        // If educator is provided, validate it exists and is an educator
        if (educator) {
            const educatorUser = await User.findById(educator);
            if (!educatorUser || educatorUser.role !== 'educator') {
                return res.status(400).json({ message: 'Invalid educator selected' });
            }
        }

        const course = new Course({
            name,
            code,
            description,
            semester,
            branch,
            credits,
            courseType,
            maxScore: maxScore || 100,
            batchYear,
            educator
        });

        await course.save();
        console.log('Course saved successfully:', course);
        res.status(201).json(course);
    } catch (err) {
        console.error('Error adding course:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(err.errors).map(e => e.message) 
            });
        }
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Update course (admin only)
router.put('/:courseId', auth, checkRole(['admin']), async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'code', 'semester', 'credits', 'maxScore', 'isActive', 'educator'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If updating educator, validate it exists and is an educator
        if (updates.includes('educator') && req.body.educator) {
            const educatorUser = await User.findById(req.body.educator);
            if (!educatorUser || educatorUser.role !== 'educator') {
                return res.status(400).json({ message: 'Invalid educator selected' });
            }
        }

        updates.forEach(update => course[update] = req.body[update]);
        await course.save();

        res.json(course);
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete course (admin only)
router.delete('/:courseId', auth, checkRole(['admin']), async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Soft delete by setting isActive to false
        course.isActive = false;
        await course.save();

        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 