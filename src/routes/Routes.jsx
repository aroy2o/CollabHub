import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Home';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import PrivateRoute from './PrivateRoute'; // Ensure PrivateRoute is correctly implemented
import Peoples from '../pages/Peoples';
// Import other page components

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/peoples" element={<Peoples />} />
      
      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
