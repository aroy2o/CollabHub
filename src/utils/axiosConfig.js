import axios from 'axios';

// Get backend URL from environment or use a fallback
let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/';

// Ensure the URL ends with a trailing slash
if (!BACKEND_URL.endsWith('/')) {
  BACKEND_URL += '/';
}

console.log('Backend URL:', BACKEND_URL); // For debugging

// Create an axios instance
const api = axios.create({
  baseURL: BACKEND_URL,
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // For debugging
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem('token');
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
