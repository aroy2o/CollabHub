export const toggleTheme = () => {
  return {
    type: 'TOGGLE_THEME'
  };
};

export const setDarkMode = (isDarkMode) => {
  return {
    type: 'SET_DARK_MODE',
    payload: isDarkMode
  };
};
