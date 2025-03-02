import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import ProfileContent from '../components/ProfileContent';
import ProfileEditModal from '../components/ProfileEditModal';
import { selectTheme } from '../redux/reducers/themeReducer';
import { selectAuth } from '../redux/reducers/authReducer';
import { getCurrentProfile, deleteUserAccount } from '../redux/actions/authActions';
import themeColors from '../utils/themeColors';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profileLoading, profileError } = useSelector(selectAuth);
  const { darkMode } = useSelector(selectTheme);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getCurrentProfile());
  }, [dispatch]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await dispatch(deleteUserAccount());
      navigate('/');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 transition-colors duration-300" style={{ color: colors.textPrimary }}>
      {profileLoading && !user ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : profileError ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error loading profile: {profileError}
        </div>
      ) : user ? (
        <>
          <ProfileHeader onEditProfile={handleEditProfile} />
          <ProfileContent 
            onDeleteAccount={handleDeleteAccount} 
            onChangePassword={handleChangePassword} 
          />
          <ProfileEditModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
          />
        </>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
          No profile information available.
        </div>
      )}
    </div>
  );
};

export default Profile;
