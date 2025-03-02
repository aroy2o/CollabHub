import { createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import {
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAILURE,
  GET_PROFILE_STATS_REQUEST,
  GET_PROFILE_STATS_SUCCESS,
  GET_PROFILE_STATS_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE
} from '../constants/authConstants';

const initialState = {
  user: null,
  email: '',
  password: '',
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.email = '';
      state.password = '';
    },
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { setEmail, setPassword, login, logout, authStart, authFail } = authSlice.actions;

export const selectAuth = (state) => state.auth;

// Get current user profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    dispatch({ type: GET_PROFILE_REQUEST });
    
    const data = await authService.getCurrentUser();
    
    dispatch({ 
      type: GET_PROFILE_SUCCESS,
      payload: data
    });

    // After loading the profile, get the user stats
    dispatch(getProfileStats(data._id || data.id));

    return data;
  } catch (error) {
    dispatch({
      type: GET_PROFILE_FAILURE,
      payload: error.message || "Failed to load profile"
    });
    return null;
  }
};

// Update user profile
export const updateUserProfile = (userData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    
    const data = await authService.updateProfile(userData);
    
    dispatch({ 
      type: UPDATE_PROFILE_SUCCESS,
      payload: data
    });
    
    return Promise.resolve(data);
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.message || "Failed to update profile"
    });
    
    return Promise.reject(error);
  }
};

// Upload profile picture
export const uploadProfilePicture = (formData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    
    const data = await authService.uploadProfilePicture(formData);
    
    dispatch({ 
      type: UPDATE_PROFILE_SUCCESS,
      payload: data
    });
    
    return Promise.resolve(data);
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.message || "Failed to upload profile picture"
    });
    
    return Promise.reject(error);
  }
};

// Delete user account
export const deleteUserAccount = () => async (dispatch) => {
  try {
    dispatch({ type: DELETE_ACCOUNT_REQUEST });
    
    await authService.deleteAccount();
    
    dispatch({ type: DELETE_ACCOUNT_SUCCESS });
    localStorage.removeItem('token');
    
    return Promise.resolve();
  } catch (error) {
    dispatch({
      type: DELETE_ACCOUNT_FAILURE,
      payload: error.message || "Failed to delete account"
    });
    
    return Promise.reject(error);
  }
};

// Get user profile statistics (followers, following, projects)
export const getProfileStats = (userId) => async (dispatch) => {
  try {
    dispatch({ type: GET_PROFILE_STATS_REQUEST });
    
    const [followers, following, projects] = await Promise.all([
      authService.getFollowersCount(userId),
      authService.getFollowingCount(userId),
      authService.getProjectsCount(userId)
    ]);
    
    const stats = {
      followersCount: followers.count || 0,
      followingCount: following.count || 0,
      projectsCount: projects.count || 0
    };
    
    dispatch({ 
      type: GET_PROFILE_STATS_SUCCESS,
      payload: stats
    });
    
    return stats;
  } catch (error) {
    dispatch({
      type: GET_PROFILE_STATS_FAILURE,
      payload: error.message || "Failed to load profile statistics"
    });
    
    // Return default values to avoid UI breaking
    return {
      followersCount: 0,
      followingCount: 0,
      projectsCount: 0
    };
  }
};

// Change user password
export const changePassword = (passwordData) => async (dispatch) => {
  try {
    dispatch({ type: CHANGE_PASSWORD_REQUEST });
    
    const data = await authService.changePassword(passwordData);
    
    dispatch({ 
      type: CHANGE_PASSWORD_SUCCESS,
      payload: data
    });
    
    return Promise.resolve(data);
  } catch (error) {
    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: error.message || "Failed to change password"
    });
    
    return Promise.reject(error);
  }
};

export default authSlice.reducer;
