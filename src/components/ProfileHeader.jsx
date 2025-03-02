import React from 'react';
import { useSelector } from 'react-redux';
import { Edit, ShieldCheck, Award, User, MapPin } from 'lucide-react';
import { selectTheme } from '../redux/reducers/themeReducer';
import themeColors from '../utils/themeColors';
import { selectAuth } from '../redux/reducers/authReducer';

const ProfileHeader = ({ onEditProfile }) => {
  const { darkMode } = useSelector(selectTheme);
  const { user, profileStats, statsLoading } = useSelector(selectAuth);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  
  if (!user) return null;

  // Map user data from the database schema
  const { 
    username,
    fullName, 
    profilePicture, 
    userRole, 
    accountStatus, 
    biography, 
    userLocation,
    skillSet = []
  } = user;
  
  const getStatusColor = () => {
    switch (accountStatus) {
      case 'active':
        return 'bg-green-500 text-green-500';
      case 'inactive':
        return 'bg-gray-500 text-gray-500';
      case 'suspended':
        return 'bg-red-500 text-red-500';
      default:
        return 'bg-blue-500 text-blue-500';
    }
  };
  
  const getRoleIcon = () => {
    if (userRole?.toLowerCase().includes('admin')) {
      return <ShieldCheck size={18} className="text-blue-500" />;
    } else if (userRole?.toLowerCase().includes('moderator')) {
      return <Award size={18} className="text-yellow-500" />;
    } else {
      return <User size={18} className="text-gray-500" />;
    }
  };

  const [statusBg, statusText] = getStatusColor().split(' ');

  return (
    <div 
      className="rounded-xl shadow-lg transition-colors duration-300 mb-8 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Banner area */}
      <div 
        className="h-40 w-full relative"
        style={{ 
          background: `linear-gradient(45deg, ${darkMode ? '#1a237e' : '#3f51b5'}, ${darkMode ? '#0d47a1' : '#2196f3'})`
        }}
      ></div>
      
      <div className="px-8 py-6 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-8 rounded-full p-1.5" style={{ backgroundColor: colors.background }}>
          <div className="relative">
            <img 
              src={profilePicture || 'https://via.placeholder.com/150?text=Profile'}
              alt={fullName}
              className="w-28 h-28 rounded-full object-cover border-4"
              style={{ borderColor: colors.surfacePrimary }}
            />
            <span 
              className={`absolute bottom-2 right-2 w-5 h-5 border-2 rounded-full ${statusBg}`} 
              style={{ borderColor: colors.background }}
            ></span>
          </div>
        </div>
        
        {/* Action Button */}
        {onEditProfile && (
          <div className="flex justify-end mb-10 md:mb-0">
            <button
              onClick={onEditProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white font-medium text-sm"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        )}
        
        {/* User Info */}
        <div className="mt-14">
          <div className="flex flex-wrap items-center gap-2">
            <h2 
              className="text-xl font-semibold transition-colors duration-300"
              style={{ color: colors.textSecondary }}
            >
              @{username}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: colors.textPrimary }}
            >
              {fullName}
            </h1>
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1 bg-opacity-20 ${statusText}`}>
              {accountStatus}
            </div>
          </div>
          
          <div 
            className="flex items-center gap-1.5 mt-1.5 transition-colors duration-300"
            style={{ color: colors.textSecondary }}
          >
            {getRoleIcon()}
            <span className="text-sm font-medium">{userRole}</span>
          </div>
          
          <div className="mt-2">
            {biography && (
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {biography}
              </p>
            )}
            {userLocation && (
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Location: {userLocation}
              </p>
            )}
          </div>
          
          <div 
            className="mt-4 flex flex-wrap gap-4 items-center pt-4 transition-colors duration-300" 
            style={{ borderTop: `1px solid ${colors.surfaceSecondary}` }}
          >
            <div className="flex flex-col items-center">
              <span className="font-semibold" style={{ color: colors.textPrimary }}>{profileStats.projectsCount}</span>
              <span className="text-xs" style={{ color: colors.textSecondary }}>Projects</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold" style={{ color: colors.textPrimary }}>{profileStats.followersCount}</span>
              <span className="text-xs" style={{ color: colors.textSecondary }}>Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold" style={{ color: colors.textPrimary }}>{profileStats.followingCount}</span>
              <span className="text-xs" style={{ color: colors.textSecondary }}>Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
