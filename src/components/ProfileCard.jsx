import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaUserShield, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Import actions directly instead of using try-catch
import { followUser, unfollowUser, clearUserError, toggleFollowingStatus } from '../redux/features/userSlice';
import FollowButton from './FollowButton';

const ProfileCard = ({ user, colors }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const dispatch = useDispatch();
  
  // Get state from Redux with safe access
  const auth = useSelector(state => state?.auth) || {};
  const userState = useSelector(state => state?.user) || { status: 'idle', error: null };
  
  // Determine if user is authenticated
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const loggedInUserId = auth?.user?._id || auth?.user?.id;
  
  // Monitor follow/unfollow status with safe access
  const isLoading = (userState?.status === 'loading') || localLoading;
  const followError = userState?.error || localError;
  
  // Update following status when user or auth changes
  useEffect(() => {
    if (loggedInUserId && user?.followers) {
      setIsFollowing(user.followers.includes(loggedInUserId));
    } else {
      setIsFollowing(false);
    }
  }, [user?.followers, loggedInUserId]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      if (typeof dispatch === 'function') {
        dispatch(clearUserError());
      }
      setLocalError(null);
    };
  }, [dispatch]);
  
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setLocalError("You must be logged in to follow users");
      return;
    }
    
    if (isLoading) return;
    
    const targetUserId = user._id || user.id;
    if (!targetUserId) {
      setLocalError("Invalid user profile");
      return;
    }
    
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      // Use optimistic UI update
      const wasFollowing = isFollowing;
      setIsFollowing(!wasFollowing);
      
      // Update Redux store for consistent UI
      dispatch(toggleFollowingStatus({
        userId: targetUserId,
        isFollowing: wasFollowing,
        currentUserId: loggedInUserId
      }));
      
      // Make API call
      if (wasFollowing) {
        await dispatch(unfollowUser(targetUserId)).unwrap();
      } else {
        await dispatch(followUser(targetUserId)).unwrap();
      }
    } catch (error) {
      // Revert state on error
      setIsFollowing(isFollowing);
      
      // Revert Redux store update
      dispatch(toggleFollowingStatus({
        userId: targetUserId,
        isFollowing: !isFollowing,
        currentUserId: loggedInUserId
      }));
      
      setLocalError(typeof error === 'string' ? error : `Failed to ${isFollowing ? 'unfollow' : 'follow'} user.`);
      console.error("Follow action error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden relative border"
      style={{ backgroundColor: colors.surfacePrimary, borderColor: colors.borderPrimary }}>
      {/* Top Banner */}
      <div className="h-16 w-full" style={{ backgroundColor: colors.accentPrimary }}></div>

      <div className="flex flex-col items-center p-6 relative">
        {/* Profile Image */}
        <div className="relative -mt-12">
          <img 
            src={user.profilePicture || '/default-profile.png'} 
            alt={`${user.fullName}'s profile`} 
            className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
            style={{ borderColor: colors.surfacePrimary }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150?text=User';
            }}
          />
        </div>

        {/* Role Badge */}
        {user.userRole && (
          <div 
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm"
            style={{ 
              backgroundColor: user.userRole === 'admin' ? '#ffd700' : colors.accentSecondary,
              color: user.userRole === 'admin' ? '#000' : '#fff'
            }}
          >
            <FaUserShield className="mr-1" />
            {user.userRole.charAt(0).toUpperCase() + user.userRole.slice(1)}
          </div>
        )}

        {/* User Info */}
        <h2 className="text-2xl font-bold mt-3" style={{ color: colors.textPrimary }}>
          {user.fullName}
        </h2>

        <div className="flex items-center mt-1 text-sm" style={{ color: colors.textSecondary }}>
          <FaEnvelope className="mr-2" />
          <p className="truncate max-w-[200px]">{user.email}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-center mt-2 px-4 line-clamp-2" style={{ color: colors.textSecondary }}>
            {user.bio}
          </p>
        )}

        {/* Login Status */}
        <div className="text-xs text-gray-500 mt-1 text-center">
          {isAuthenticated ? 'Logged in' : 'Not logged in'}
        </div>

        {/* Error Message */}
        {followError && (
          <div className="mt-2 text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {followError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex w-full mt-4 space-x-3">
          <Link 
            to={`/user/${user._id || user.id}`}
            className="w-full py-2 text-center rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
            style={{ backgroundColor: colors.accentPrimary, color: '#fff' }}
          >
            <FaUser className="mr-2" />
            View Profile
          </Link>

          <FollowButton 
            userId={user._id || user.id}
            initialIsFollowing={isFollowing}
            username={user.fullName}
            buttonStyle={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
