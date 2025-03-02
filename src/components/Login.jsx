import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  setEmail, 
  setPassword, 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  selectAuth, 
  selectIsAuthenticated 
} from '../redux/reducers/authReducer';
import api from '../utils/axiosConfig';
import logoImage2 from '../images/collabHub.png';
import logoImage1 from '../images/collabhub1.png';

const Login = () => {
  const { password, loading } = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    console.log('Logging in with:', { email: identifier, password });

    dispatch(loginStart());

    try {
      const response = await api.post('/api/auth/login', {
        email: identifier.trim(), // Use identifier for email
        password, // Ensure this is being updated correctly
      });

      console.log('Response:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);

        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        );

        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      
      dispatch(loginFailure());
      dispatch(setPassword('')); // Clear password on error

      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
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
        <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <img src={logoImage} alt="CollabHub Logo" className="h-12 w-auto mb-4" />
        <h2 className="text-3xl font-extrabold mb-6 text-center" style={{ color: textColor }}>Login</h2>

        <form onSubmit={handleLogin} className="space-y-6 w-full">
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.05 }}
              type="email" // Change to email
              id="email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              disabled={loading}
              required
              className={`w-full px-4 pt-6 pb-2 border ${error ? 'border-red-500' : 'border-gray-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-md bg-transparent peer`}
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
              onChange={(e) => {
                dispatch(setPassword(e.target.value));
                setError('');
              }}
              disabled={loading}
              required
              className={`w-full px-4 pt-6 pb-2 border ${error ? 'border-red-500' : 'border-gray-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-md bg-transparent peer`}
              style={{ backgroundColor: inputBgColor, color: inputTextColor }}
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Password
            </label>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Logging in</span>
                <span className="animate-pulse">...</span>
              </div>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

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
