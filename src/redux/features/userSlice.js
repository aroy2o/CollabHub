import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axiosConfig';

// Add a new thunk to get following status
export const getFollowStatus = createAsyncThunk(
  'user/getFollowStatus',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const response = await api.get(`/api/users/follow/${userId}/status`);
      return {
        userId,
        isFollowing: response.data.isFollowing || false
      };
    } catch (error) {
      // If the specific endpoint is not available, don't treat it as an error
      // Just return a default status
      if (error.response?.status === 404) {
        // Try to determine status from user data
        const { auth } = getState();
        const currentUserId = auth?.user?._id || auth?.user?.id;
        const { users } = getState().user;
        
        // Find the target user
        const targetUser = users.find(u => u._id === userId || u.id === userId);
        const isFollowing = targetUser?.followers?.includes(currentUserId) || false;
        
        return {
          userId,
          isFollowing
        };
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to get follow status');
    }
  }
);

// Modify the follow action to handle "already following" case
export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, { rejectWithValue, getState, dispatch }) => {
    try {
      // First check if already following to prevent unnecessary API calls
      const { user, auth } = getState();
      const currentUserId = auth?.user?._id || auth?.user?.id;
      const targetUser = user.users.find(u => u._id === userId || u.id === userId);
      
      // If already following, just return success without making API call
      if (targetUser?.followers?.includes(currentUserId)) {
        return {
          success: true,
          message: 'Already following this user',
          alreadyFollowing: true,
          user: targetUser
        };
      }
      
      const response = await api.post(`/api/users/follow/${userId}`);
      return response.data;
    } catch (error) {
      // Special handling for "already following" error
      if (error.response?.data?.message?.toLowerCase().includes('already following')) {
        // Update local state to reflect correct follow status
        dispatch(getFollowStatus(userId));
        return {
          success: true,
          message: 'Already following this user',
          alreadyFollowing: true
        };
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to follow user'
      );
    }
  }
);

// Unfollow user action - already exported with 'export const'
export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/users/unfollow/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to unfollow user'
      );
    }
  }
);

// User slice with optimized follow/unfollow handling
const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    following: [], // IDs of users the current user is following
    followers: [], // IDs of users following the current user
    status: 'idle',
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
      state.status = 'idle';
    },
    // Used for optimistic updates
    toggleFollowingStatus: (state, action) => {
      const { userId, isFollowing } = action.payload;
      
      if (isFollowing) {
        // Remove user ID if unfollowing
        state.following = state.following.filter(id => id !== userId);
      } else {
        // Add user ID if following
        if (!state.following.includes(userId)) {
          state.following.push(userId);
        }
      }
      
      // Update the user object in the users array
      const userIndex = state.users.findIndex(u => u.id === userId || u._id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        const followers = [...(user.followers || [])];
        
        const currentUserId = action.payload.currentUserId;
        if (!isFollowing && !followers.includes(currentUserId)) {
          followers.push(currentUserId);
        } else if (isFollowing) {
          const idx = followers.indexOf(currentUserId);
          if (idx !== -1) followers.splice(idx, 1);
        }
        
        state.users[userIndex] = {
          ...user,
          followers,
          isFollowing: !isFollowing
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Follow user cases
      .addCase(followUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // If this was an "already following" case, just update the UI
        if (action.payload?.alreadyFollowing) {
          return;
        }
        
        // Update state if the API returns user data
        if (action.payload?.user) {
          const userId = action.payload.user.id || action.payload.user._id;
          
          // Ensure the user is in the following list
          if (!state.following.includes(userId)) {
            state.following.push(userId);
          }
          
          // Update the user in users array if it exists
          const userIndex = state.users.findIndex(u => 
            u.id === userId || u._id === userId
          );
          
          if (userIndex !== -1) {
            state.users[userIndex] = {
              ...state.users[userIndex],
              ...action.payload.user,
              isFollowing: true
            };
          }
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to follow user';
      })
      
      // Unfollow user cases
      .addCase(unfollowUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Update state if the API returns user data
        if (action.payload?.user) {
          const userId = action.payload.user.id || action.payload.user._id;
          
          // Remove the user from the following list
          state.following = state.following.filter(id => id !== userId);
          
          // Update the user in users array if it exists
          const userIndex = state.users.findIndex(u => 
            u.id === userId || u._id === userId
          );
          
          if (userIndex !== -1) {
            state.users[userIndex] = {
              ...state.users[userIndex],
              ...action.payload.user,
              isFollowing: false
            };
          }
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to unfollow user';
      })
      
      // Add case for getFollowStatus
      .addCase(getFollowStatus.fulfilled, (state, action) => {
        const { userId, isFollowing } = action.payload;
        
        // Update following list
        if (isFollowing && !state.following.includes(userId)) {
          state.following.push(userId);
        } else if (!isFollowing && state.following.includes(userId)) {
          state.following = state.following.filter(id => id !== userId);
        }
        
        // Update user in users array
        const userIndex = state.users.findIndex(u => 
          u.id === userId || u._id === userId
        );
        
        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            isFollowing
          };
        }
      });
  },
});

export const { clearUserError, toggleFollowingStatus } = userSlice.actions;
export default userSlice.reducer;
