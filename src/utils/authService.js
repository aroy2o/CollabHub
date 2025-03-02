export const getFollowersCount = async (userId) => {
  if (!userId) {
    console.error('Invalid user id for getFollowersCount');
    return 0;
  }
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}/followers/count`);
    return response.data.count;
  } catch (error) {
    console.error('Failed to fetch followers count:', error);
    return 0;
  }
};

export const getFollowingCount = async (userId) => {
  if (!userId) {
    console.error('Invalid user id for getFollowingCount');
    return 0;
  }
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}/following/count`);
    return response.data.count;
  } catch (error) {
    console.error('Failed to fetch following count:', error);
    return 0;
  }
};

export const getProjectsCount = async (userId) => {
  if (!userId) {
    console.error('Invalid user id for getProjectsCount');
    return 0;
  }
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}/projects/count`);
    return response.data.count;
  } catch (error) {
    console.error('Failed to fetch projects count:', error);
    return 0;
  }
};
