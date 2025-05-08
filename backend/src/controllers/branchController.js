import Branch from '../models/Branch.js';

// Get all branches
export const getBranches = async (req, res) => {
    try {
        const branches = await Branch.find().select('name code');
        res.json(branches);
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Error fetching branches' });
    }
};

// Get courses for a specific branch and year
export const getBranchCourses = async (req, res) => {
    try {
        const { branch, year } = req.query;
        
        if (!branch || !year) {
            return res.status(400).json({ message: 'Branch and year are required' });
        }

        const courses = await Branch.findOne({ code: branch })
            .select('courses')
            .populate({
                path: 'courses',
                match: { year: parseInt(year) },
                select: 'name code year'
            });

        if (!courses) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.json(courses.courses);
    } catch (error) {
        console.error('Error fetching branch courses:', error);
        res.status(500).json({ message: 'Error fetching branch courses' });
    }
}; 