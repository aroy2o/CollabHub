import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ProfileEditModal from './ProfileEditModal';
import ChangePasswordModal from './ChangePasswordModal';
import { selectTheme } from '../redux/reducers/themeReducer';
import { selectAuth } from '../redux/reducers/authReducer';
import themeColors from '../utils/themeColors';

const ProfileContent = ({ onDeleteAccount, onChangePassword }) => {
  const { user } = useSelector(selectAuth);
  const { darkMode } = useSelector(selectTheme);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div 
            className="p-6 rounded-lg shadow-md transition-colors duration-300"
            style={{ backgroundColor: colors.background }}
          >
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap">
                <span className="w-24 font-medium" style={{ color: colors.textSecondary }}>Name:</span>
                <span>{user.fullName}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="w-24 font-medium" style={{ color: colors.textSecondary }}>Email:</span>
                <span>{user.email}</span>
              </div>
              {user.bio && (
                <div className="flex flex-wrap">
                  <span className="w-24 font-medium" style={{ color: colors.textSecondary }}>Bio:</span>
                  <span className="flex-1">{user.bio}</span>
                </div>
              )}
              {user.location && (
                <div className="flex flex-wrap">
                  <span className="w-24 font-medium" style={{ color: colors.textSecondary }}>Location:</span>
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex flex-wrap">
                  <span className="w-24 font-medium" style={{ color: colors.textSecondary }}>Website:</span>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div 
            className="p-6 rounded-lg shadow-md transition-colors duration-300"
            style={{ backgroundColor: colors.background }}
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>No recent activity to display.</p>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div 
            className="p-6 rounded-lg shadow-md transition-colors duration-300"
            style={{ backgroundColor: colors.background }}
          >
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <button 
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
              <button 
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
              <button 
                className="w-full py-2 px-4 border rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" 
                style={{ borderColor: colors.surfaceSecondary }}
              >
                Notification Settings
              </button>
              <button 
                className="w-full py-2 px-4 border rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ borderColor: colors.surfaceSecondary }}
              >
                Privacy Settings
              </button>
              <button 
                className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                onClick={onDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
          
          {/* Social Connections */}
          <div 
            className="p-6 rounded-lg shadow-md transition-colors duration-300"
            style={{ backgroundColor: colors.background }}
          >
            <h2 className="text-xl font-semibold mb-4">Connections</h2>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>Connect with other platforms</p>
            <div className="space-y-3">
              <button 
                className="flex items-center w-full py-2 px-4 border rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ borderColor: colors.surfaceSecondary }}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {user.github ? `Connected: ${user.github}` : 'Connect GitHub'}
              </button>
              <button 
                className="flex items-center w-full py-2 px-4 border rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ borderColor: colors.surfaceSecondary }}
              >
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
                {user.facebook ? `Connected: ${user.facebook}` : 'Connect Facebook'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
    </>
  );
};

export default ProfileContent;
