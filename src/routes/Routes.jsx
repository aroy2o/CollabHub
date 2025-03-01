import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from '../components/Signup';
import Login from '../components/Login';
import ProtectedRoute from './ProtectedRoute';
import ProtectedComponent from '../components/ProtectedComponent';
import Home from '../components/Home'; // Import the new Home component

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/protected" element={<ProtectedRoute component={ProtectedComponent} />} />
      {/* Update the default route */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
