import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axiosConfig';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  email: '',
  password: '',
  fullName: '',
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
  },
});

export const { 
  setEmail, 
  setPassword, 
  setFullName, 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logoutSuccess 
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

export default authSlice.reducer;
