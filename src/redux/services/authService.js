import api from '../../utils/axiosConfig';
// ...existing code...
export const uploadProfilePicture = async (formData) => {
  try {
    // Updated endpoint to match backend configuration
    const response = await api.post('/api/auth/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response && error.response.data.message
      ? new Error(error.response.data.message)
      : error;
  }
};
// ...existing code...
