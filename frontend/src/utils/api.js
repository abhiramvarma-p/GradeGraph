import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration and renewal
api.interceptors.response.use(
    (response) => {
        // Check if server sent a new token
        const newToken = response.headers['x-new-token'];
        if (newToken) {
            localStorage.setItem('token', newToken);
        }
        return response;
    },
    async (error) => {
        if (error.response) {
            const originalRequest = error.config;

            // Handle token expiration
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                // Check if the error is due to token expiration
                if (error.response.data?.code === 'TOKEN_EXPIRED') {
                    // Clear auth data and redirect to login with expired flag
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login?expired=true';
                    return Promise.reject(error);
                }

                // For other 401 errors, only reject the promise without clearing auth
                return Promise.reject(error);
            }

            // Handle other error statuses
            if (error.response.status === 403) {
                // Forbidden - user doesn't have required permissions
                return Promise.reject(new Error(error.response.data?.message || 'You do not have permission to perform this action'));
            }
        }

        return Promise.reject(error);
    }
);

// Mock data for development/testing
const mockData = {
    students: [
        { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', branch: 'Computer Science', graduationYear: 2025 },
        { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', branch: 'Electrical Engineering', graduationYear: 2025 },
    ],
    branches: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
    scores: [
        { _id: '1', studentId: '1', course: 'Data Structures', semester: '1-1', score: 85, maxScore: 100 },
        { _id: '2', studentId: '1', course: 'Algorithms', semester: '1-1', score: 90, maxScore: 100 },
        { _id: '3', studentId: '2', course: 'Circuit Theory', semester: '1-1', score: 88, maxScore: 100 },
    ],
    courses: {
        'Computer Science': {
            '1-1': ['Data Structures', 'Algorithms', 'Computer Networks'],
            '1-2': ['Operating Systems', 'Database Systems', 'Software Engineering'],
        },
        'Electrical Engineering': {
            '1-1': ['Circuit Theory', 'Electronics', 'Digital Logic'],
            '1-2': ['Control Systems', 'Power Systems', 'Communication Systems'],
        },
    },
    batchPerformance: {
        'Computer Science': {
            '2025': {
                '1-1': {
                    'Data Structures': { average: 82, highest: 95, lowest: 65 },
                    'Algorithms': { average: 78, highest: 92, lowest: 60 },
                },
                '1-2': {
                    'Operating Systems': { average: 75, highest: 88, lowest: 55 },
                },
            },
        },
        'Electrical Engineering': {
            '2025': {
                '1-1': {
                    'Circuit Theory': { average: 80, highest: 94, lowest: 62 },
                },
            },
        },
    },
};

// Check if user is authenticated
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Add all API functions directly to the api instance
api.login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

api.register = async (userData) => {
        try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// API service functions
const apiFunctions = {
    // User endpoints
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Student endpoints
    getStudentAcademicData: async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/academic-data`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Branch endpoints
    getBranches: async () => {
        try {
            const response = await api.get('/auth/branches');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // User profile
    getUserProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Student scores
    getStudentScores: async (studentId) => {
        try {
            // For development, use mock data
            if (process.env.NODE_ENV === 'development') {
                const studentScores = mockData.scores.filter(score => score.studentId === studentId);
                return studentScores;
            }
            
            const response = await api.get(`/students/${studentId}/scores`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Admin endpoints
    getAllUsers: async () => {
        try {
            if (!isAuthenticated()) {
                throw new Error('User is not authenticated');
            }
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    deleteUser: async (userId) => {
        try {
            if (!isAuthenticated()) {
                throw new Error('User is not authenticated');
            }
            const response = await api.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Score management
    addScore: async (scoreData) => {
        try {
            if (!isAuthenticated()) {
                throw new Error('User is not authenticated');
            }
            
            // For development, use mock data
            if (process.env.NODE_ENV === 'development') {
                const newScore = {
                    _id: String(mockData.scores.length + 1),
                    ...scoreData,
                    createdAt: new Date().toISOString()
                };
                mockData.scores.push(newScore);
                return newScore;
            }
            
            const response = await api.post('/scores', scoreData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    updateScore: async (scoreId, scoreData) => {
        try {
            if (!isAuthenticated()) {
                throw new Error('User is not authenticated');
            }
            
            // For development, use mock data
            if (process.env.NODE_ENV === 'development') {
                const scoreIndex = mockData.scores.findIndex(score => score._id === scoreId);
                if (scoreIndex !== -1) {
                    mockData.scores[scoreIndex] = { ...mockData.scores[scoreIndex], ...scoreData };
                    return mockData.scores[scoreIndex];
                }
                throw new Error('Score not found');
            }
            
            const response = await api.put(`/scores/${scoreId}`, scoreData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    deleteScore: async (scoreId) => {
        try {
            if (!isAuthenticated()) {
                throw new Error('User is not authenticated');
            }
            
            // For development, use mock data
            if (process.env.NODE_ENV === 'development') {
                const scoreIndex = mockData.scores.findIndex(score => score._id === scoreId);
                if (scoreIndex !== -1) {
                    const deletedScore = mockData.scores.splice(scoreIndex, 1)[0];
                    return deletedScore;
                }
                throw new Error('Score not found');
            }
            
            const response = await api.delete(`/scores/${scoreId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Course management
    getCourses: async (filters = {}) => {
        try {
            // For development, use mock data
            if (process.env.NODE_ENV === 'development') {
                if (filters.branch && filters.graduationYear) {
                    const semester = filters.semester || '1-1';
                    const courses = mockData.courses[filters.branch]?.[semester] || [];
                    return courses;
                }
                return [];
            }
            
            const response = await api.get('/courses', { params: filters });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Batch performance
    getBatchPerformance: async (filters = {}) => {
        try {
            // For development, use mock data
            if (process.env.NODE_ENV === 'development') {
                if (filters.branch && filters.graduationYear) {
                    const semester = filters.semester || '1-1';
                    const performance = mockData.batchPerformance[filters.branch]?.[filters.graduationYear]?.[semester] || {};
                    return performance;
                }
                return {};
            }
            
            const response = await api.get('/students/batch-performance', { params: filters });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

// Add getAcademicData function to api
api.getAcademicData = async (studentId) => {
    try {
        // For development, return mock data
        if (process.env.NODE_ENV === 'development') {
            return Promise.resolve(mockData.academicData);
        }
        
        // In production, make the actual API call
        const response = await api.get(`/students/${studentId}/academic-data`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add getStudentScores function to api
api.getStudentScores = async (studentId) => {
    try {
        // For development, return mock data
        if (process.env.NODE_ENV === 'development') {
            return Promise.resolve(mockData.scores.filter(score => score.studentId === studentId));
        }
        
        // In production, make the actual API call
        const response = await api.get(`/students/${studentId}/scores`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add getBatchAverages function to api
api.getBatchAverages = async (branch) => {
    try {
        // For development, return mock data
        if (process.env.NODE_ENV === 'development') {
            // Generate mock batch averages
            const mockBatchAverages = [
                { subject: 'Machine Learning', average: 82 },
                { subject: 'Data Structures', average: 78 },
                { subject: 'Computer Networks', average: 85 },
                { subject: 'Operating Systems', average: 80 },
                { subject: 'Database Management', average: 83 },
                { subject: 'Software Engineering', average: 79 }
            ];
            return Promise.resolve(mockBatchAverages);
        }
        
        // In production, make the actual API call
        const response = await api.get(`/branches/${branch}/averages`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add exportReport function to api
api.exportReport = async (reportData) => {
    try {
        // For development, return mock data
        if (process.env.NODE_ENV === 'development') {
            return Promise.resolve({ success: true, message: 'Report exported successfully' });
        }
        
        // In production, make the actual API call
        const response = await api.post('/reports/export', reportData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Export the api instance
export { api }; 