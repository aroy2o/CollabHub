import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Upload, Trash2, AlertCircle } from 'lucide-react';
import { updateUserProfile, uploadProfilePicture } from '../redux/actions/authActions';
import { selectAuth } from '../redux/reducers/authReducer';
import { selectTheme } from '../redux/reducers/themeReducer';
import themeColors from '../utils/themeColors';

const ProfileEditModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user, profileLoading, profileError } = useSelector(selectAuth);
  const { darkMode } = useSelector(selectTheme);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    biography: '',
    userLocation: '',
    skillSet: [],
    profilePicture: null
  });

  const [skillInput, setSkillInput] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [usernameChangeAllowed, setUsernameChangeAllowed] = useState(true);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        biography: user.biography || '',
        userLocation: user.userLocation || '',
        skillSet: user.skillSet || [],
        profilePicture: null
      });
      
      if (user.profilePicture) {
        setPreviewImage(user.profilePicture);
      }

      // Check if username change is allowed
      const lastUsernameChange = new Date(user.lastUsernameChange);
      const now = new Date();
      const daysSinceLastChange = Math.floor((now - lastUsernameChange) / (1000 * 60 * 60 * 24));
      setUsernameChangeAllowed(daysSinceLastChange >= 14);
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      profilePicture: file
    }));

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null
    }));
    setPreviewImage(user?.profilePicture || '');
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (formData.skillSet.includes(skillInput.trim())) {
      setError('This skill has already been added');
      return;
    }
    if (formData.skillSet.length >= 10) {
      setError('Maximum 10 skills allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      skillSet: [...prev.skillSet, skillInput.trim()]
    }));
    setSkillInput('');
    setError('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillSet: prev.skillSet.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!formData.fullName.trim()) {
      setError('Name is required');
      return;
    }
    
    try {
      // Create FormData for multipart/form-data submission (for image)
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('fullName', formData.fullName);
      submitData.append('biography', formData.biography);
      submitData.append('userLocation', formData.userLocation);
      formData.skillSet.forEach(skill => {
        submitData.append('skillSet', skill);
      });
      
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
        await dispatch(uploadProfilePicture(submitData));
      } else {
        await dispatch(updateUserProfile(submitData));
      }
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-lg p-6 shadow-xl transition-colors duration-300"
        style={{ backgroundColor: colors.background, color: colors.textPrimary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden border-4 mb-2"
                  style={{ borderColor: colors.surfaceSecondary }}
                >
                  {previewImage ? (
                    <img 
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.surfacePrimary }}
                    >
                      <Upload size={24} />
                    </div>
                  )}
                </div>
                {previewImage && (
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 p-1 rounded-full bg-red-500 text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <label className="cursor-pointer mt-2">
                <span 
                  className="px-3 py-1.5 text-sm rounded-md transition-colors"
                  style={{ 
                    backgroundColor: colors.surfacePrimary,
                    color: colors.textPrimary
                  }}
                >
                  Change Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Max size: 5MB
              </p>
            </div>
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Username*
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
                disabled={!usernameChangeAllowed}
              />
              {!usernameChangeAllowed && (
                <p className="text-xs mt-1 text-red-500">
                  Username can only be changed once every 14 days.
                </p>
              )}
            </div>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Full Name*
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
              />
            </div>
            
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Biography
                <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                  ({formData.biography.length}/250)
                </span>
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                rows="3"
                maxLength={250}
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Location
              </label>
              <input
                type="text"
                name="userLocation"
                value={formData.userLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.surfaceSecondary,
                  color: colors.textPrimary
                }}
                placeholder="City, Country"
              />
            </div>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                Skills
                <span className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                  ({formData.skillSet.length}/10)
                </span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: colors.surfacePrimary,
                    borderColor: colors.surfaceSecondary,
                    color: colors.textPrimary
                  }}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-lg transition-colors hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              
              {/* Skills List */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skillSet.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{ 
                      backgroundColor: colors.surfacePrimary,
                      color: colors.textPrimary,
                      borderColor: colors.surfaceSecondary
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {/* Server error message */}
            {profileError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                {profileError}
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
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md transition-colors"
                style={{ borderColor: colors.surfaceSecondary }}
                disabled={profileLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md transition-colors hover:bg-blue-600 flex items-center justify-center min-w-[80px]"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
