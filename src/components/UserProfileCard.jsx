import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import FollowButton from './FollowButton';

const UserProfileCard = ({ user, colors }) => {
  return (
    <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
      style={{ 
        backgroundColor: colors.surfacePrimary,
        border: `1px solid ${colors.borderPrimary}`
      }}
    >
      <div className="flex items-center mb-4">
        <img 
          src={user.profilePicture || '/default-profile.png'} 
          alt={`${user.fullName}'s profile`} 
          className="w-16 h-16 rounded-full object-cover mr-4 border-2"
          style={{ borderColor: colors.accentPrimary }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/80?text=User';
          }}
        />
        
        <div>
          <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            {user.fullName}
          </h3>
          <div className="flex items-center text-sm" style={{ color: colors.textSecondary }}>
            <FaEnvelope className="mr-1" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>
      
      {user.bio && (
        <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.textSecondary }}>
          {user.bio}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-4">
        <Link 
          to={`/user/${user._id || user.id}`}
          className="px-4 py-2 rounded-lg text-center transition-all duration-300"
          style={{ 
            backgroundColor: colors.accentPrimary,
            color: '#fff'
          }}
        >
          <FaUser className="inline mr-2" />
          Profile
        </Link>
        
        <FollowButton 
          userId={user._id || user.id}
          initialIsFollowing={user.isFollowing || false}
          username={user.fullName}
        />
      </div>
      
      <div className="flex justify-between mt-4 text-sm" style={{ color: colors.textSecondary }}>
        <div>
          <span className="font-bold">{user.followers?.length || 0}</span> followers
        </div>
        <div>
          <span className="font-bold">{user.following?.length || 0}</span> following
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
