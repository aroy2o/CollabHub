// Export slice actions and async thunks from userSlice
export { 
  followUser, 
  unfollowUser,
  clearUserError,
  toggleFollowingStatus 
} from './userSlice';

// Export the reducer as default
export { default as userReducer } from './userSlice';
// Add other feature exports as needed
