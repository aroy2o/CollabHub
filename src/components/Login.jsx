import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { setEmail, setPassword, loginStart, loginSuccess, loginFailure, selectAuth } from '../redux/reducers/authReducer';
import api from '../utils/axiosConfig';
import logoImage2 from '../images/collabHub.png';
import logoImage1 from '../images/collabhub1.png';

const Login = () => {
  const { email, password, loading } = useSelector(selectAuth);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [useDemo, setUseDemo] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }
    
    dispatch(loginStart());
    
    try {
      // Use api instance with correct baseURL
      const response = await api.post('api/auth/login', { email, password });
      
      // Store user data and token in Redux
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      
      // If API call fails, suggest demo mode
      toast.error(error.response?.data?.message || 'API unavailable. Using demo mode instead.');
      handleDemoLogin();
    }
  };

  // For demo purposes, if there's no backend
  const handleDemoLogin = () => {
    // Create demo user with mock token
    const demoUser = {
      id: '1',
      name: 'Demo User',
      email: email || 'demo@example.com',
    };
    
    dispatch(loginSuccess({
      user: demoUser,
      token: 'demo-token-123456789'
    }));
    
    toast.success('Logged in as demo user');
    navigate('/');
  };

  const bgColor = darkMode ? '#16181c' : '#f5f5f5';
  const textColor = darkMode ? '#ffffff' : '#000000';
  const inputBgColor = darkMode ? '#2d2d2d' : '#e0e0e0';
  const inputTextColor = darkMode ? '#ffffff' : '#000000';
  const logoImage = darkMode ? logoImage1 : logoImage2;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 transition-all" style={{ backgroundColor: bgColor, color: textColor }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-2xl shadow-2xl w-full max-w-md bg-opacity-90 backdrop-blur-xl border border-gray-300 flex flex-col items-center glassmorphism relative"
      >
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={logoImage} alt="CollabHub Logo" className="h-12 w-auto mb-4" />
        <h2 className="text-3xl font-extrabold mb-6 text-center" style={{ color: textColor }}>
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6 w-full">
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.05 }}
              type="email"
              id="email"
              value={email}
              onChange={(e) => dispatch(setEmail(e.target.value))}
              required
              className="w-full px-4 pt-6 pb-2 border border-gray-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-md bg-transparent text-white peer"
              style={{ backgroundColor: inputBgColor, color: inputTextColor }}
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.05 }}
              type="password"
              id="password"
              value={password}
              onChange={(e) => dispatch(setPassword(e.target.value))}
              required
              className="w-full px-4 pt-6 pb-2 border border-gray-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-md bg-transparent text-white peer"
              style={{ backgroundColor: inputBgColor, color: inputTextColor }}
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Password
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <span className="absolute w-24 h-24 bg-white opacity-20 blur-xl top-0 left-0 transform -translate-x-1/2 -translate-y-1/2"></span>
            Login
          </motion.button>
        </form>

        <div className="mt-4 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            onClick={handleDemoLogin}
          >
            <span className="absolute w-24 h-24 bg-white opacity-20 blur-xl top-0 left-0 transform -translate-x-1/2 -translate-y-1/2"></span>
            Demo Login
          </motion.button>
        </div>

        <p className="text-center mt-4" style={{ color: textColor }}>
          Don't have an account?{' '}
          <motion.span
            whileHover={{ scale: 1.1, textShadow: '0px 0px 8px rgba(255,255,255,0.9)' }}
            className="text-blue-400 font-bold cursor-pointer ml-1 transition-all"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
