import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  email: '',
  password: '',
  fullName: '', // Add fullName field
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
    setFullName: (state, action) => { // Add setFullName action
      state.fullName = action.payload;
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
      state.fullName = '';
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

export const { 
  setEmail, 
  setPassword, 
  setFullName, // Export the new action
  login, 
  logout, 
  authStart, 
  authFail 
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
