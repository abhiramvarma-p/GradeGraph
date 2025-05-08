// Grade point system
const GRADE_POINTS = [
    { letter: 'A+', points: 10, minPercentage: 90 },
    { letter: 'A', points: 9, minPercentage: 80 },
    { letter: 'B+', points: 8, minPercentage: 70 },
    { letter: 'B', points: 7, minPercentage: 60 },
    { letter: 'C+', points: 6, minPercentage: 55 },
    { letter: 'C', points: 5, minPercentage: 50 },
    { letter: 'D', points: 4, minPercentage: 45 },
    { letter: 'F', points: 3, minPercentage: 0 }
];

// Grade colors for visualization
export const GRADE_COLORS = {
    'A+ (10)': '#A35C7A',    // Dark Pink
    'A (9)': '#C890A7',      // Light Pink
    'B+ (8)': '#E6B8B7',     // Soft Rose
    'B (7)': '#FBF5E5',      // Cream
    'C+ (6)': '#D4A5A5',     // Light Rose
    'C (5)': '#B76E79',      // Medium Rose
    'D (4)': '#212121',      // Dark
    'F (≤3)': '#000000'      // Black
};

/**
 * Get grade and points based on percentage
 * @param {number} percentage - Score percentage
 * @returns {{ letter: string, points: number }} Grade object with letter grade and points
 */
export const getGrade = (percentage) => {
    for (const grade of GRADE_POINTS) {
        if (percentage >= grade.minPercentage) {
            return { letter: grade.letter, points: grade.points };
        }
    }
    return { letter: 'F', points: 3 }; // Default case
};

/**
 * Get grade label with points for display
 * @param {string} letter - Letter grade
 * @param {number} points - Grade points
 * @returns {string} Formatted grade label
 */
export const getGradeLabel = (letter, points) => {
    return `${letter} (${points})`;
};

/**
 * Initialize empty grade distribution array
 * @returns {Array} Array of grade distribution objects
 */
export const initializeGradeDistribution = () => {
    return GRADE_POINTS.map(grade => ({
        name: `${grade.letter} (${grade.points})`,
        value: 0
    }));
};

/**
 * Map backend distribution array to grade distribution
 * @param {Array} distribution - Backend distribution array [0-60, 61-70, 71-80, 81-90, 91-100]
 * @returns {Array} Mapped grade distribution array
 */
export const mapBackendDistribution = (distribution) => {
    const gradeDistribution = initializeGradeDistribution();
    const totalStudents = distribution.reduce((a, b) => a + b, 0);

    if (totalStudents > 0) {
        const gradeRanges = [
            { range: distribution[0], grades: ['F (3)'] },
            { range: distribution[1], grades: ['D (4)', 'C (5)'] },
            { range: distribution[2], grades: ['C+ (6)', 'B (7)'] },
            { range: distribution[3], grades: ['B+ (8)', 'A (9)'] },
            { range: distribution[4], grades: ['A+ (10)'] }
        ];

        gradeRanges.forEach(({ range, grades }) => {
            const studentsInRange = range;
            const studentsPerGrade = Math.round(studentsInRange / grades.length);
            grades.forEach(grade => {
                const gradeIndex = gradeDistribution.findIndex(g => g.name === grade);
                if (gradeIndex !== -1) {
                    gradeDistribution[gradeIndex].value += studentsPerGrade;
                }
            });
        });
    }

    return gradeDistribution;
};

export default {
    GRADE_POINTS,
    GRADE_COLORS,
    getGrade,
    getGradeLabel,
    initializeGradeDistribution,
    mapBackendDistribution
}; 