import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/axiosConfig';
import { selectTheme } from '../redux/reducers/themeReducer';
import themeColors from '../utils/themeColors';
import ProfileCard from '../components/ProfileCard';
import { FaSearch, FaUsers } from 'react-icons/fa';
import { getFollowStatus } from '../redux/features/userSlice';

const Peoples = () => {
  const { darkMode } = useSelector(selectTheme);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        console.log('Fetched users:', response.data);

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          setUsers([]);
          setError('No users found');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  // Filter users when search term or users list changes
  useEffect(() => {
    if (!users.length) {
      setFilteredUsers([]);
      return;
    }
    
    // First filter out the current user
    let result = users;
    
    if (currentUser) {
      const currentUserIdentifiers = [
        currentUser.id,
        currentUser._id,
        currentUser.email?.toLowerCase()
      ].filter(Boolean);
      
      result = users.filter(user => {
        const userIdentifiers = [
          user.id,
          user._id, 
          user.email?.toLowerCase()
        ].filter(Boolean);
        
        const isCurrentUser = currentUserIdentifiers.some(currentId => 
          userIdentifiers.includes(currentId)
        );
        
        return !isCurrentUser;
      });
    }
    
    // Then apply search filter if search term exists
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.fullName?.toLowerCase().includes(term) || 
        user.email?.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [users, currentUser, searchTerm]);

  // After fetching users, check follow status for each
  useEffect(() => {
    if (filteredUsers.length > 0) {
      filteredUsers.forEach(user => {
        const userId = user._id || user.id;
        if (userId) {
          dispatch(getFollowStatus(userId));
        }
      });
    }
  }, [filteredUsers, dispatch]);

  const colors = darkMode ? themeColors.dark : themeColors.light;
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p style={{ color: colors.textPrimary }}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 rounded-lg my-8 mx-auto max-w-md">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 opacity-0 transform translate-y-4 motion-safe:transition-all duration-500 motion-safe:animate-[fadeIn_0.5s_ease-out_forwards]" style={{ color: colors.textPrimary }}>
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <FaUsers className="text-3xl mr-2" style={{ color: colors.accentPrimary }} />
          <h1 className="text-3xl font-bold">Community Members</h1>
        </div>
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Connect with other members of our community
        </p>
      </div>
      
      <div className="mb-6 max-w-md mx-auto">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3" style={{ color: colors.textSecondary }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all duration-300"
            style={{ 
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.borderPrimary,
              color: colors.textPrimary
            }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-xl" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'No users match your search.' : 'No users found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.map(user => (
            <ProfileCard 
              key={user.id || user._id} 
              user={{
                ...user,
                // Ensure followers array exists to prevent undefined errors
                followers: user.followers || []
              }}
              colors={colors}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Peoples;
