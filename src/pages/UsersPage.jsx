import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaUsers } from 'react-icons/fa';
import api from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import UserProfileCard from '../components/UserProfileCard';
import { selectTheme } from '../redux/reducers/themeReducer';
import themeColors from '../utils/themeColors';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { darkMode } = useSelector(selectTheme);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const auth = useSelector(state => state.auth);
  const currentUserFollowing = useSelector(state => state.user.following || []);
  
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const currentUserId = auth?.user?._id || auth?.user?.id;
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users');
        
        if (response.data && Array.isArray(response.data.data)) {
          // Process users - map isFollowing status
          const mappedUsers = response.data.data.map(user => ({
            ...user,
            isFollowing: isAuthenticated && 
              (currentUserFollowing.includes(user._id || user.id) || 
              (user.followers && user.followers.includes(currentUserId)))
          }));
          
          // Filter out current user
          const filteredResults = mappedUsers.filter(user => {
            const userId = user._id || user.id;
            return userId !== currentUserId;
          });
          
          setUsers(filteredResults);
        } else {
          setUsers([]);
          toast.error('No users found');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isAuthenticated, currentUserId, currentUserFollowing]);
  
  // Filter users based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = users.filter(user => 
      user.fullName?.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term) ||
      user.bio?.toLowerCase().includes(term)
    );
    
    setFilteredUsers(results);
  }, [users, searchTerm]);
  
  return (
    <div className="container mx-auto p-4" style={{ color: colors.textPrimary }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <FaUsers className="mr-2" style={{ color: colors.accentPrimary }} />
          Community Members
        </h1>
        <p className="text-lg mt-2" style={{ color: colors.textSecondary }}>
          Find and connect with other members
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textSecondary }} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none"
            style={{ 
              backgroundColor: colors.surfaceSecondary,
              color: colors.textPrimary,
              borderColor: colors.borderPrimary
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" 
            style={{ borderColor: colors.accentPrimary }}></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map(user => (
            <UserProfileCard 
              key={user._id || user.id} 
              user={user} 
              colors={colors} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-xl" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'No users match your search.' : 'No users found.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
