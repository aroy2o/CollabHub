import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X, User, LogOut, Search, Bell } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode, selectTheme, applyThemeFromStorage } from '../redux/reducers/themeReducer';
import { logout, selectUser, selectIsAuthenticated } from '../redux/reducers/authReducer';
import logoImage2 from '../images/collabHub.png';
import logoImage1 from '../images/collabhub1.png';
import themeColors from '../utils/themeColors';

const Navbar = () => {
  const { darkMode, theme } = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    dispatch(applyThemeFromStorage());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
    localStorage.setItem('darkMode', !darkMode);
  };
  
  // New function to handle profile menu link clicks
  const handleProfileLinkClick = (path) => {
    setProfileMenuOpen(false);
    navigate(path);
  };
  
  // Modified logout handler to close menu
  const handleLogout = () => {
    setProfileMenuOpen(false);
    dispatch(logout());
  };

  const colors = darkMode ? themeColors.dark : themeColors.light;
  const logoImage = darkMode ? logoImage1 : logoImage2;

  return (
    <nav 
      style={{ backgroundColor: colors.background, color: colors.textPrimary }} 
      className="shadow-md px-6 py-4 fixed w-full z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
          <img src={logoImage} alt="CollabHub Logo" className="h-10 w-auto" />
        </Link>
        
        {/* Search Bar - Hidden on Small Screens */}
        <div className="hidden md:flex items-center px-3 py-1 rounded-lg" style={{ backgroundColor: colors.surfacePrimary }}>
          <Search className="w-5 h-5" style={{ color: colors.textPrimary }} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none px-2"
            style={{ color: colors.textPrimary }}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="nav-link" style={{ color: colors.textPrimary }}>Home</Link>
          <Link to="/peoples" className="nav-link" style={{ color: colors.textPrimary }}>Peoples</Link>
          <Link to="/community" className="nav-link" style={{ color: colors.textPrimary }}>Community</Link>
          <Link to="/resources" className="nav-link" style={{ color: colors.textPrimary }}>Resources</Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg transition-colors duration-300"
            style={{ backgroundColor: colors.surfacePrimary }}
          >
            {darkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-gray-800" />}
          </button>
 
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)} 
              className="p-2 rounded-lg" 
              style={{ backgroundColor: colors.surfacePrimary }}
            >
              <Bell className="w-6 h-6" style={{ color: colors.textPrimary }} />
            </button>
            {notificationsOpen && (
              <div 
                className="absolute right-0 mt-3 w-64 shadow-lg rounded-lg overflow-hidden" 
                style={{ backgroundColor: colors.background, color: colors.textPrimary }}
              >
                <div className="p-4">No new notifications</div>
              </div>
            )}
          </div>

          {/* User Profile or Login Button */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                className="p-2 rounded-lg" 
                style={{ backgroundColor: colors.surfacePrimary }}
              >
                <User className="w-6 h-6" style={{ color: colors.textPrimary }} />
              </button>
              
              {profileMenuOpen && (
                <div 
                  className="absolute right-0 mt-3 w-48 shadow-lg rounded-lg overflow-hidden z-50" 
                  style={{ backgroundColor: colors.background, color: colors.textPrimary }}
                >
                  <div className="p-3 border-b" style={{ borderColor: colors.surfaceSecondary }}>
                    <p className="font-semibold">{user.fullName || "User"}</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{user.email || ""}</p>
                  </div>
                  <button 
                    onClick={() => handleProfileLinkClick('/profile')}
                    className="flex items-center space-x-2 p-3 hover:bg-opacity-20 w-full text-left" 
                    style={{ color: colors.textPrimary }}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-2 p-3 w-full text-left text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-4 flex items-center space-x-4">
              <Link to="/login" className="px-3 py-2 rounded-md transition-colors" style={{ color: colors.accent }}>Login</Link>
              <Link to="/signup" className="px-3 py-2 rounded-md text-white transition-colors" style={{ backgroundColor: colors.accent }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
