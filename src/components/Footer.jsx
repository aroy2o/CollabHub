import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Github, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import logoImage2 from '../images/collabHub.png';
import logoImage1 from '../images/collabhub1.png';
import { selectTheme } from '../redux/reducers/themeReducer';
import themeColors from '../utils/themeColors';

const Footer = () => {
  const { darkMode } = useSelector(selectTheme);
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const logoImage = darkMode ? logoImage1 : logoImage2;

  return (
    <footer style={{ backgroundColor: colors.background, color: colors.textPrimary }} className="pt-12 pb-8 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="inline-block mb-4">
              <img src={logoImage} alt="CollabHub Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm opacity-75">
              A community platform for developers to collaborate, share ideas, and build projects together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm opacity-75 hover:opacity-100 transition">Home</Link></li>
              <li><Link to="/projects" className="text-sm opacity-75 hover:opacity-100 transition">Projects</Link></li>
              <li><Link to="/community" className="text-sm opacity-75 hover:opacity-100 transition">Community</Link></li>
              <li><Link to="/resources" className="text-sm opacity-75 hover:opacity-100 transition">Resources</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300"
                style={{ backgroundColor: colors.surfacePrimary }}>
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300"
                style={{ backgroundColor: colors.surfacePrimary }}>
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300"
                style={{ backgroundColor: colors.surfacePrimary }}>
                <Linkedin size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300"
                style={{ backgroundColor: colors.surfacePrimary }}>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <form className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 rounded-l-lg outline-none flex-1"
                  style={{ backgroundColor: colors.surfacePrimary, color: colors.textPrimary }}
                />
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-2 rounded-r-lg flex items-center"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-xs opacity-75">
                Subscribe to our newsletter for updates and new features.
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-8" style={{ borderColor: colors.surfaceSecondary }}></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-75 mb-4 md:mb-0">
            © {new Date().getFullYear()} CollabHub. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm opacity-75 hover:opacity-100 transition">Privacy Policy</Link>
            <Link to="/terms" className="text-sm opacity-75 hover:opacity-100 transition">Terms of Service</Link>
            <Link to="/contact" className="text-sm opacity-75 hover:opacity-100 transition">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
