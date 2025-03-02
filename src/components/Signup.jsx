import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  setEmail,
  setPassword,
  setFullName,
  loginStart,
  loginSuccess,
  loginFailure
} from '../redux/reducers/authReducer';
import api from '../utils/axiosConfig';
import logoImage2 from '../images/collabHub.png';
import logoImage1 from '../images/collabhub1.png';

const Signup = () => {
  const { email, password, fullName, loading } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState('');

  const validatePassword = (password) => {
    if (!password) return '';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Za-z]/.test(password)) return 'Password must contain letters';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return 'Strong';
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Field validation
    const missingFields = [];
    if (!fullName) missingFields.push('Full Name');
    if (!email) missingFields.push('Email');
    if (!password) missingFields.push('Password');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    const passwordCheck = validatePassword(password);
    if (passwordCheck !== 'Strong') {
      toast.error(passwordCheck);
      return;
    }

    dispatch(loginStart());

    try {
      const response = await api.post('api/auth/signup', { email, password, fullName });
      dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      dispatch(loginFailure());
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen px-4 transition-all ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-2xl shadow-2xl w-full max-w-md bg-opacity-90 backdrop-blur-xl border border-gray-300 flex flex-col items-center relative"
      >
        <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <img src={darkMode ? logoImage1 : logoImage2} alt="CollabHub Logo" className="h-12 w-auto mb-4" />
        <h2 className="text-3xl font-extrabold mb-6">Create Account</h2>
        <form onSubmit={handleSignup} className="space-y-6 w-full">
          {['Full Name', 'Email'].map((field, index) => (
            <div key={index} className="relative">
              <motion.input
                whileFocus={{ scale: 1.05 }}
                type={field === 'Email' ? 'email' : 'text'}
                value={field === 'Full Name' ? fullName : email}
                onChange={(e) => dispatch(field === 'Full Name' ? setFullName(e.target.value) : setEmail(e.target.value))}
                required
                className="w-full px-4 pt-6 pb-2 border border-gray-500 rounded-xl focus:ring-4 focus:ring-blue-500 shadow-md bg-transparent peer"
              />
              <label className="absolute left-4 top-3 text-gray-400 peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
                {field}
              </label>
            </div>
          ))}
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.05 }}
              type="password"
              value={password}
              onChange={(e) => {
                dispatch(setPassword(e.target.value));
                setPasswordStrength(validatePassword(e.target.value));
              }}
              required
              className="w-full px-4 pt-6 pb-2 border border-gray-500 rounded-xl focus:ring-4 focus:ring-blue-500 shadow-md bg-transparent peer"
            />
            <label className="absolute left-4 top-3 text-gray-400 peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
              Password
            </label>
            <p className={`text-sm mt-1 ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
              {passwordStrength}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
          >
            Create Account
          </motion.button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <motion.span whileHover={{ scale: 1.1 }} className="text-blue-400 font-bold cursor-pointer" onClick={() => navigate('/login')}>
            Login
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
