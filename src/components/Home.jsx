import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const navigate = useNavigate();
  
  // Get all colors directly from Redux store
  const bgColor = useSelector((state) => state.backgroundColor);
  const textColor = useSelector((state) => state.textColor);
  const darkMode = useSelector((state) => state.darkMode);
  
  // Define contrasting colors for sections that need to stand out
  const contrastBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const accentBg = darkMode ? 'bg-blue-900' : 'bg-blue-600';
  const accentText = 'text-white';
  
  const buttonPrimary = darkMode 
    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
    : 'bg-blue-600 hover:bg-blue-700 text-white';
  
  const buttonSecondary = darkMode 
    ? 'bg-gray-700 border-blue-400 text-blue-400 hover:bg-gray-600' 
    : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className={`text-5xl font-extrabold mb-6 ${textColor}`}>
            Welcome to CollabHub
          </h1>
          <p className={`text-xl ${textColor} mb-8`}>
            The ultimate platform for developers to connect, collaborate, and create amazing projects together
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/explore")}
              className={`${buttonPrimary} py-3 px-8 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl`}
            >
              Explore Projects
            </button>
            <button
              onClick={() => navigate("/about")}
              className={`${buttonSecondary} border py-3 px-8 rounded-lg font-medium transition-all`}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section - slightly different background for contrast */}
      <div className={`${contrastBg} py-16`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${textColor}`}>Why Choose CollabHub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Find Teammates" 
              description="Connect with developers who share your interests and complement your skills"
              icon="👥"
              cardBg={cardBg}
              textColor={textColor}
              darkMode={darkMode}
            />
            <FeatureCard 
              title="Showcase Projects" 
              description="Display your work to the community and get valuable feedback"
              icon="🚀"
              cardBg={cardBg}
              textColor={textColor}
              darkMode={darkMode}
            />
            <FeatureCard 
              title="Grow Together" 
              description="Learn, build, and improve your skills through real collaboration"
              icon="📈"
              cardBg={cardBg}
              textColor={textColor}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* Call to Action - accent color for emphasis */}
      <div className={`${accentBg} ${accentText} py-16`}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to start your collaborative journey?</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Join thousands of developers already building amazing projects on our platform</p>
          <button
            onClick={() => navigate("/signup")}
            className={`${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-100'} py-3 px-8 rounded-lg font-medium transition-all`}
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon, cardBg, textColor, darkMode }) => {
  const cardTextColor = darkMode ? 'text-gray-300' : 'text-gray-700';
  
  return (
    <div className={`${cardBg} p-6 rounded-xl shadow-md hover:shadow-lg transition-all`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : textColor}`}>{title}</h3>
      <p className={cardTextColor}>{description}</p>
    </div>
  );
};

export default Home;
