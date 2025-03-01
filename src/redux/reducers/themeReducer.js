import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  theme: 'default'
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    applyThemeFromStorage: (state) => {
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        state.darkMode = storedDarkMode === 'true';
      }
    }
  }
});

export const { toggleDarkMode, setTheme, applyThemeFromStorage } = themeSlice.actions;

export const selectTheme = (state) => state.theme;

export default themeSlice.reducer;
