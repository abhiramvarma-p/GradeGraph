import { api } from './api';

/**
 * Export student grades and scores for a specific course
 * @param {string} branch - Branch name
 * @param {string} year - Batch year
 * @param {string} courseId - Course ID
 * @returns {Promise<void>}
 */
export const exportCourseGrades = async (branch, year, courseId) => {
    try {
        const response = await api.get(`/scores/export/course/${courseId}`, {
            params: { branch, year },
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `course_grades_${branch}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error exporting course grades:', error);
        throw error;
    }
};

/**
 * Export CGPA data for a batch
 * @param {string} branch - Branch name
 * @param {string} year - Batch year
 * @returns {Promise<void>}
 */
export const exportBatchCGPA = async (branch, year) => {
    try {
        const response = await api.get(`/scores/export/batch-cgpa`, {
            params: { branch, year },
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `batch_cgpa_${branch}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error exporting batch CGPA:', error);
        throw error;
    }
};

/**
 * Export student's personal grades and scores
 * @param {string} studentId - Student ID
 * @returns {Promise<void>}
 */
export const exportStudentGrades = async (studentId) => {
    try {
        const response = await api.get(`/scores/export/student/${studentId}`, {
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'my_grades.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error exporting student grades:', error);
        throw error;
    }
}; 