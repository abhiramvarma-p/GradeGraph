import axios from 'axios';

// Configure axios to use the backend URL
axios.defaults.baseURL = 'http://localhost:5000';  // Assuming backend runs on port 5000

// Add default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add interceptor to include credentials
axios.defaults.withCredentials = true;

export default axios; 