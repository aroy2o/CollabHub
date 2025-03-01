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

  const handleCloseMenus = () => {
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
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
          <Link to="/" className="nav-link" style={{ color: colors.textPrimary }} onClick={handleCloseMenus}>Home</Link>
          <Link to="/projects" className="nav-link" style={{ color: colors.textPrimary }} onClick={handleCloseMenus}>Projects</Link>
          <Link to="/community" className="nav-link" style={{ color: colors.textPrimary }} onClick={handleCloseMenus}>Community</Link>
          <Link to="/resources" className="nav-link" style={{ color: colors.textPrimary }} onClick={handleCloseMenus}>Resources</Link>
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
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 p-3 hover:bg-opacity-20" 
                    style={{ color: colors.textPrimary }}
                    onClick={handleCloseMenus}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={() => { dispatch(logout()); handleCloseMenus(); }} 
                    className="flex items-center space-x-2 p-3 w-full text-left text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
