import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    applyTheme: (state) => {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      state.darkMode = darkMode;
    },
  },
});

export const { toggleTheme, applyTheme } = themeSlice.actions;

export default themeSlice.reducer;
