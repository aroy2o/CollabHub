import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, AlertCircle } from 'lucide-react';
import { changePassword } from '../redux/actions/authActions';
import { selectTheme } from '../redux/reducers/themeReducer';
import themeColors from '../utils/themeColors';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(selectTheme);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      await dispatch(changePassword({ currentPassword, newPassword }));
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-lg p-6 shadow-xl transition-colors duration-300"
        style={{ backgroundColor: colors.background, color: colors.textPrimary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Change Password</h3>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Current Password*
              </label>
              <input
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
              />
            </div>
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                New Password*
              </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
              />
            </div>
            
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Confirm Password*
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
              />
            </div>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {/* Success message */}
            {successMessage && (
              <div className="text-green-500 text-sm mt-2">
                {successMessage}
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md transition-colors hover:bg-blue-600"
              >
                Change Password
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
