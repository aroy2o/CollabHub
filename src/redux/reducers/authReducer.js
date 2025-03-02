import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axiosConfig';
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
  GET_PROFILE_STATS_FAILURE
} from '../constants/authConstants';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  username:"",
  email: '',
  password: '',
  fullName: '',
  loading: false,
  error: null,
  profileLoading: false,
  profileError: null,
  profileUpdateSuccess: false,
  deleteAccountLoading: false,
  deleteAccountError: null,
  profileStats: {
    followersCount: 0,
    followingCount: 0,
    projectsCount: 0
  },
  statsLoading: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
      // if (state.user) {
      //   state.user.username = action.payload;
      // }
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setFullName: (state, action) => {
      state.fullName = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      // Store token in localStorage for persistence
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      // Clear from localStorage
      localStorage.removeItem('token');
    },
    getProfileRequest: (state) => {
      state.profileLoading = true;
      state.profileError = null;
    },
    getProfileSuccess: (state, action) => {
      state.user = action.payload;
      state.profileLoading = false;
      state.profileError = null;
    },
    getProfileFailure: (state, action) => {
      state.profileLoading = false;
      state.profileError = action.payload;
    },
    updateProfileRequest: (state) => {
      state.profileLoading = true;
      state.profileError = null;
      state.profileUpdateSuccess = false;
    },
    updateProfileSuccess: (state, action) => {
      state.user = action.payload;
      state.profileLoading = false;
      state.profileError = null;
      state.profileUpdateSuccess = true;
    },
    updateProfileFailure: (state, action) => {
      state.profileLoading = false;
      state.profileError = action.payload;
      state.profileUpdateSuccess = false;
    },
    deleteAccountRequest: (state) => {
      state.deleteAccountLoading = true;
      state.deleteAccountError = null;
    },
    deleteAccountSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.deleteAccountLoading = false;
      state.token = null;
    },
    deleteAccountFailure: (state, action) => {
      state.deleteAccountLoading = false;
      state.deleteAccountError = action.payload;
    },
    getProfileStatsRequest: (state) => {
      state.statsLoading = true;
    },
    getProfileStatsSuccess: (state, action) => {
      state.profileStats = action.payload;
      state.statsLoading = false;
    },
    getProfileStatsFailure: (state) => {
      state.statsLoading = false;
    }
  },
});

export const { 
  setUsername,
  setEmail, 
  setPassword, 
  setFullName, 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logoutSuccess,
  getProfileRequest,
  getProfileSuccess,
  getProfileFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountFailure,
  getProfileStatsRequest,
  getProfileStatsSuccess,
  getProfileStatsFailure
} = authSlice.actions;

// Thunk action to handle login
export const login = (userData) => async (dispatch) => {
  try {
    dispatch(loginSuccess({
      user: userData,
      token: userData.token
    }));
  } catch (error) {
    dispatch(loginFailure(error.message));
  }
};

// Thunk action to handle logout
export const logout = () => (dispatch) => {
  dispatch(logoutSuccess());
};

// Thunk action to load user data from token
export const loadUser = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    dispatch(loginStart());
    
    // Check if the token is a demo token
    if (token === 'demo-token-123456789') {
      // Create a demo user
      const demoUser = {
        id: '1',
        name: 'Demo User',
        fullName: 'Demo User',
        email: 'demo@example.com',
      };
      
      dispatch(loginSuccess({
        user: demoUser,
        token: token
      }));
      return;
    }
    
    // Use the api instance that already has the baseURL configured
    const response = await api.get('/api/auth/me');
    
    dispatch(loginSuccess({
      user: response.data.user,
      token: token
    }));
  } catch (error) {
    console.error('Error loading user:', error);
    // If token is invalid or there's a server error, remove the token
    localStorage.removeItem('token');
    dispatch(loginFailure(error.message));
  }
};

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
