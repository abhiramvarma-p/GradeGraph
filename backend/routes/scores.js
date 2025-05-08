const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { User } = require('../models/User');
const Score = require('../models/Score');
const Course = require('../models/Course');

// Get student scores
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        // Check if the requesting user is the student or an educator
        if (req.user.role !== 'educator' && req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const scores = await Score.find({ student: req.params.studentId })
            .populate('educator', 'firstName lastName')
            .populate('course')
            .sort({ semester: 1 });

        res.json(scores);
    } catch (err) {
        console.error('Error fetching student scores:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get batch averages
router.get('/batch-averages/:branch', auth, async (req, res) => {
    try {
        // Get all scores for the branch
        const scores = await Score.find()
            .populate({
                path: 'student',
                match: { branch: req.params.branch }
            })
            .populate('educator', 'firstName lastName');

        // Filter out scores from students not in the branch
        const branchScores = scores.filter(score => score.student !== null);

        // Calculate averages by subject and semester
        const averages = {};
        branchScores.forEach(score => {
            const key = `${score.semester}-${score.subject}`;
            if (!averages[key]) {
                averages[key] = {
                    semester: score.semester,
                    subject: score.subject,
                    total: 0,
                    count: 0
                };
            }
            averages[key].total += score.score;
            averages[key].count += 1;
        });

        // Convert to array and calculate final averages
        const result = Object.values(averages).map(item => ({
            semester: item.semester,
            subject: item.subject,
            average: parseFloat((item.total / item.count).toFixed(2))
        }));

        res.json(result);
    } catch (err) {
        console.error('Error fetching batch averages:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get student academic data (CGPA and SGPA)
router.get('/students/:studentId/academic-data', auth, async (req, res) => {
    try {
        // Check if the requesting user is the student or an educator
        if (req.user.role !== 'educator' && req.user._id.toString() !== req.params.studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const scores = await Score.find({ student: req.params.studentId })
            .sort({ semester: 1, subject: 1 });

        // Calculate SGPA for each semester
        const semesterScores = {};
        scores.forEach(score => {
            if (!semesterScores[score.semester]) {
                semesterScores[score.semester] = [];
            }
            semesterScores[score.semester].push(score);
        });

        const sgpaData = Object.keys(semesterScores).map(semester => {
            const semesterScore = semesterScores[semester];
            const totalScore = semesterScore.reduce((sum, score) => sum + score.score, 0);
            const sgpa = totalScore / semesterScore.length;
            return {
                semester,
                sgpa: parseFloat(sgpa.toFixed(2))
            };
        });

        // Calculate CGPA (average of all SGPAs)
        const totalSgpa = sgpaData.reduce((sum, item) => sum + item.sgpa, 0);
        const cgpa = sgpaData.length > 0 ? parseFloat((totalSgpa / sgpaData.length).toFixed(2)) : null;

        res.json({
            cgpa,
            sgpaData
        });
    } catch (err) {
        console.error('Error fetching academic data:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get batch performance
router.get('/batch-performance/:branch/:batchYear', auth, async (req, res) => {
    try {
        const { branch, batchYear } = req.params;
        
        // Get all students in the batch
        const students = await User.find({
            role: 'student',
            branch,
            graduationYear: parseInt(batchYear)
        });

        // Get all courses for the batch
        const courses = await Course.find({
            branch,
            batchYear: parseInt(batchYear),
            isActive: true
        });

        const batchPerformance = {};

        // Calculate performance for each course
        for (const course of courses) {
            const scores = await Score.find({
                course: course._id,
                batchYear: parseInt(batchYear)
            });

            if (scores.length > 0) {
                const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
                const average = totalScore / scores.length;
                const highest = Math.max(...scores.map(s => s.score));
                const lowest = Math.min(...scores.map(s => s.score));

                // Calculate distribution
                const distribution = [0, 0, 0, 0, 0]; // 0-60, 61-70, 71-80, 81-90, 91-100
                scores.forEach(score => {
                    if (score.score <= 60) distribution[0]++;
                    else if (score.score <= 70) distribution[1]++;
                    else if (score.score <= 80) distribution[2]++;
                    else if (score.score <= 90) distribution[3]++;
                    else distribution[4]++;
                });

                batchPerformance[course._id] = {
                    courseName: course.name,
                    average,
                    highest,
                    lowest,
                    distribution: distribution.map(d => (d / scores.length) * 100)
                };
            }
        }

        res.json(batchPerformance);
    } catch (err) {
        console.error('Error fetching batch performance:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new score (educator or admin only)
router.post('/', auth, checkRole(['educator', 'admin']), async (req, res) => {
    try {
        const { studentId, courseId, score, semester } = req.body;

        // Validate course exists in curriculum
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found in curriculum' });
        }

        // Validate student exists
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Validate course is in student's branch and batch
        if (course.branch !== student.branch || course.batchYear !== student.graduationYear) {
            return res.status(400).json({ message: 'Course not in student\'s curriculum' });
        }

        // Check if score already exists
        const existingScore = await Score.findOne({
            student: studentId,
            course: courseId,
            semester
        });

        if (existingScore) {
            return res.status(400).json({ message: 'Score already exists for this course and semester' });
        }

        const newScore = new Score({
            student: studentId,
            course: courseId,
            educator: req.user._id,
            score,
            semester,
            subject: course.name,
            batchYear: student.graduationYear
        });

        await newScore.save();

        // Populate the response with course and educator details
        const populatedScore = await Score.findById(newScore._id)
            .populate('course')
            .populate('educator', 'firstName lastName');

        res.status(201).json(populatedScore);
    } catch (error) {
        console.error('Error adding score:', error);
        res.status(500).json({ message: 'Error adding score', error: error.message });
    }
});

// Update score (educator or admin only)
router.put('/:scoreId', auth, checkRole(['educator', 'admin']), async (req, res) => {
    try {
        const { score } = req.body;
        const updatedScore = await Score.findByIdAndUpdate(
            req.params.scoreId,
            { score },
            { new: true }
        ).populate('course').populate('educator', 'firstName lastName');

        if (!updatedScore) {
            return res.status(404).json({ message: 'Score not found' });
        }

        res.json(updatedScore);
    } catch (error) {
        res.status(500).json({ message: 'Error updating score', error: error.message });
    }
});

// Delete score (educator or admin only)
router.delete('/:scoreId', auth, checkRole(['educator', 'admin']), async (req, res) => {
    try {
        const deletedScore = await Score.findByIdAndDelete(req.params.scoreId);
        if (!deletedScore) {
            return res.status(404).json({ message: 'Score not found' });
        }
        res.json({ message: 'Score deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting score', error: error.message });
    }
});

// Get class/course performance (educator only)
router.get('/course/:courseId', auth, checkRole(['educator']), async (req, res) => {
    try {
        const scores = await Score.find({ course: req.params.courseId })
            .populate('student', 'firstName lastName collegeId')
            .sort({ score: -1 });

        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course scores', error: error.message });
    }
});

module.exports = router; 