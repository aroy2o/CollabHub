import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUserPlus, FaUserMinus, FaSpinner, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { followUser, unfollowUser, toggleFollowingStatus, getFollowStatus } from '../redux/features/userSlice';

const FollowButton = ({ userId, initialIsFollowing, username, buttonStyle = {} }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [localLoading, setLocalLoading] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const userState = useSelector(state => state.user);
  
  // Check if user is logged in
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const currentUserId = auth?.user?._id || auth?.user?.id;
  
  // Combined loading state
  const isLoading = userState.status === 'loading' || localLoading;
  
  // Sync with server on mount to get accurate follow status
  useEffect(() => {
    if (isAuthenticated && userId && !statusChecked) {
      dispatch(getFollowStatus(userId))
        .unwrap()
        .then(result => {
          setIsFollowing(result.isFollowing);
          setStatusChecked(true);
        })
        .catch(error => {
          console.error('Failed to get follow status:', error);
        });
    }
  }, [userId, isAuthenticated, dispatch, statusChecked]);
  
  // Update if initialIsFollowing changes
  useEffect(() => {
    if (!statusChecked) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing, statusChecked]);
  
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to follow users');
      return;
    }
    
    if (isLoading) return;
    
    // Prevent following yourself
    if (userId === currentUserId) {
      toast.error('You cannot follow yourself');
      return;
    }
    
    setLocalLoading(true);
    
    try {
      // Optimistic update
      setIsFollowing(!isFollowing);
      dispatch(toggleFollowingStatus({
        userId,
        isFollowing,
        currentUserId
      }));
      
      // Actual API call
      if (isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
        toast.success(`Unfollowed ${username}`);
      } else {
        const result = await dispatch(followUser(userId)).unwrap();
        if (result.alreadyFollowing) {
          toast.info(`You are already following ${username}`);
        } else {
          toast.success(`Now following ${username}`);
        }
      }
    } catch (error) {
      // Check if error message contains "already following"
      if (typeof error === 'string' && error.toLowerCase().includes('already following')) {
        // This is not really an error, update UI to show following
        setIsFollowing(true);
        toast.info(`You are already following ${username}`);
      } else {
        // Revert optimistic update on error
        setIsFollowing(isFollowing);
        dispatch(toggleFollowingStatus({
          userId,
          isFollowing: !isFollowing,
          currentUserId
        }));
        
        toast.error(error || `Failed to ${isFollowing ? 'unfollow' : 'follow'}`);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading || !isAuthenticated}
      className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isFollowing 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      style={buttonStyle}
    >
      {isLoading ? (
        <FaSpinner className="animate-spin mr-2" />
      ) : isFollowing ? (
        <FaUserMinus className="mr-2" />
      ) : (
        <FaUserPlus className="mr-2" />
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
