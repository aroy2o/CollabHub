import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import AppRoutes from './routes/Routes';
import Footer from './components/Footer';
import { selectTheme, applyThemeFromStorage } from './redux/reducers/themeReducer';
import themeColors from './utils/themeColors';

const App = () => {
  const { darkMode } = useSelector(selectTheme);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(applyThemeFromStorage());
    
    // Apply class to body for global styling
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode, dispatch]);

  const colors = darkMode ? themeColors.dark : themeColors.light;

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      color: colors.textPrimary, 
      minHeight: '100vh',
      transition: 'background-color 0.3s, color 0.3s' 
    }}>
      <Navbar />
      <div style={{ paddingTop: '5rem' }}>
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
}

export default App;