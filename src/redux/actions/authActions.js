import { createSlice } from '@reduxjs/toolkit';

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

export default authSlice.reducer;
