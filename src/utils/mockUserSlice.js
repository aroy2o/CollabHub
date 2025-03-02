import { createSlice } from '@reduxjs/toolkit';

/**
 * Mock user slice for development when the real userSlice isn't available or functional
 */
const mockUserSlice = createSlice({
  name: 'user',
  initialState: {
    status: 'idle',
    error: null,
    users: [],
    userProfiles: {}
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  }
});

// Create mock actions that return functions rather than async thunks
export const followUser = (userId) => (dispatch) => {
  console.log('Mock followUser called with userId:', userId);
  return Promise.resolve({ success: true, message: 'Mock follow success' });
};

export const unfollowUser = (userId) => (dispatch) => {
  console.log('Mock unfollowUser called with userId:', userId);
  return Promise.resolve({ success: true, message: 'Mock unfollow success' });
};

export const { clearUserError } = mockUserSlice.actions;
export default mockUserSlice.reducer;
