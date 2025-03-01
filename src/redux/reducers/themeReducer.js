import { createSlice } from '@reduxjs/toolkit';
import themeColors from '../../utils/themeColors';

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  theme: localStorage.getItem('darkMode') === 'true' ? themeColors.dark : themeColors.light
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      state.theme = state.darkMode ? themeColors.dark : themeColors.light;
    },
    applyThemeFromStorage: (state) => {
      const storedDarkMode = localStorage.getItem('darkMode') === 'true';
      state.darkMode = storedDarkMode;
      state.theme = storedDarkMode ? themeColors.dark : themeColors.light;
    }
  }
});

export const { toggleDarkMode, applyThemeFromStorage } = themeSlice.actions;

export const selectTheme = (state) => state.theme;

export default themeSlice.reducer;
