import Score from '../models/Score';
import Student from '../models/Student';
import Course from '../models/Course';
import { getGrade } from '../utils/gradeUtils';

/**
 * Export course grades for a specific course
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCourseGrades = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { branch, year } = req.query;

        // Get all scores for the course
        const scores = await Score.find({
            course: courseId,
            'student.branch': branch,
            'student.graduationYear': year
        }).populate('student', 'collegeId firstName lastName');

        // Format data for CSV
        const csvData = [
            ['Roll Number', 'Name', 'Score', 'Max Score', 'Percentage', 'Grade'],
            ...scores.map(score => {
                const percentage = (score.score / score.maxScore) * 100;
                const grade = getGrade(percentage);
                return [
                    score.student.collegeId,
                    `${score.student.firstName} ${score.student.lastName}`,
                    score.score,
                    score.maxScore,
                    percentage.toFixed(2),
                    grade.letter
                ];
            })
        ];

        // Convert to CSV string
        const csv = csvData.map(row => row.join(',')).join('\n');

        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=course_grades_${branch}_${year}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting course grades:', error);
        res.status(500).json({ message: 'Error exporting course grades' });
    }
};

/**
 * Export batch CGPA data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportBatchCGPA = async (req, res) => {
    try {
        const { branch, year } = req.query;

        // Get all students in the batch
        const students = await Student.find({
            branch,
            graduationYear: year
        });

        // Get all scores for these students
        const scores = await Score.find({
            'student': { $in: students.map(s => s._id) }
        }).populate('course', 'credits');

        // Calculate CGPA for each student
        const studentCGPA = students.map(student => {
            const studentScores = scores.filter(s => s.student.toString() === student._id.toString());
            let totalCredits = 0;
            let totalWeightedPoints = 0;

            studentScores.forEach(score => {
                const percentage = (score.score / score.maxScore) * 100;
                const grade = getGrade(percentage);
                const credits = score.course.credits || 1;
                totalCredits += credits;
                totalWeightedPoints += credits * grade.points;
            });

            const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';

            return {
                rollNumber: student.collegeId,
                name: `${student.firstName} ${student.lastName}`,
                cgpa
            };
        });

        // Format data for CSV
        const csvData = [
            ['Roll Number', 'Name', 'CGPA'],
            ...studentCGPA.map(student => [
                student.rollNumber,
                student.name,
                student.cgpa
            ])
        ];

        // Convert to CSV string
        const csv = csvData.map(row => row.join(',')).join('\n');

        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=batch_cgpa_${branch}_${year}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting batch CGPA:', error);
        res.status(500).json({ message: 'Error exporting batch CGPA' });
    }
};

/**
 * Export student's personal grades
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportStudentGrades = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Get all scores for the student
        const scores = await Score.find({ student: studentId })
            .populate('course', 'name credits')
            .sort('semester');

        // Format data for CSV
        const csvData = [
            ['Course', 'Semester', 'Score', 'Max Score', 'Percentage', 'Grade', 'Grade Points'],
            ...scores.map(score => {
                const percentage = (score.score / score.maxScore) * 100;
                const grade = getGrade(percentage);
                return [
                    score.course.name,
                    score.semester,
                    score.score,
                    score.maxScore,
                    percentage.toFixed(2),
                    grade.letter,
                    grade.points
                ];
            })
        ];

        // Convert to CSV string
        const csv = csvData.map(row => row.join(',')).join('\n');

        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=my_grades.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting student grades:', error);
        res.status(500).json({ message: 'Error exporting student grades' });
    }
}; 