import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Set up axios instance with auth token handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  // ...existing auth functions...

  // Get current user profile - trying multiple endpoints
  getCurrentUser: async () => {
    try {
      // Try the first endpoint
      try {
        const response = await api.get('/api/auth/me');
        return response.data;
      } catch (firstError) {
        // If first endpoint fails, try the second endpoint
        const response = await api.get('/api/users/profile/me');
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user profile' };
    }
  },

  // Update user profile - trying multiple endpoints
  updateProfile: async (userData) => {
    try {
      // Try the first endpoint
      try {
        const response = await api.put('/api/auth/me', userData);
        return response.data;
      } catch (firstError) {
        // If first endpoint fails, try the second endpoint
        const response = await api.put('/api/users/profile/me', userData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user profile' };
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const response = await api.post('/api/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload profile picture' };
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/api/users/profile/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete account' };
    }
  },

  // Get user followers count
  getFollowersCount: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/followers/count`);
      return response.data;
    } catch (error) {
      // Return 0 on error to avoid breaking the UI
      console.error('Failed to fetch followers count:', error);
      return { count: 0 };
    }
  },

  // Get user following count
  getFollowingCount: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/following/count`);
      return response.data;
    } catch (error) {
      // Return 0 on error to avoid breaking the UI
      console.error('Failed to fetch following count:', error);
      return { count: 0 };
    }
  },

  // Get user projects count (assuming there's an endpoint for this)
  getProjectsCount: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/projects/count`);
      return response.data;
    } catch (error) {
      // Return 0 on error to avoid breaking the UI
      console.error('Failed to fetch projects count:', error);
      return { count: 0 };
    }
  },

  // Change user password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/api/users/profile/me', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  }
};

export default authService;
