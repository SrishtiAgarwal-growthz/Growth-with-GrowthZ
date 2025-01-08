import { useState } from 'react';
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
import GoogleTextAds from "../components/PhoneMockup/GoogleMockup/GoogleTextads";

const HomePage = () => {
  const [activeApp, setActiveApp] = useState('facebook'); // Default to Facebook
  const [activeMockup, setActiveMockup] = useState('feedCarousel'); // Default to Feed Carousel

  // Render the active mockup
  const renderMockup = () => {
    if (activeApp === 'facebook') {
      return activeMockup === 'feedCarousel' ? <FbFeedCarousel /> : <FbStoryAds />;
    } else if (activeApp === 'google') {
      return activeMockup === 'search' ? <GoogleAnimatedAds /> : <GoogleTextAds />;
    }
    return null;
  };

  return (
    <div className="bg-black min-h-screen overflow-hidden">
      {/* Sidebar for App Selection */}
      <div className="fixed left-0 top-0 h-full w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
        <button onClick={() => setActiveApp('facebook')} className="text-white">
          FB
        </button>
        <button onClick={() => setActiveApp('google')} className="text-white">
          G
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-4">
        {/* Buttons for Mockup Selection */}
        <div className="flex space-x-4 mb-0">
          {activeApp === 'facebook' ? (
            <>
              <button onClick={() => setActiveMockup('feedCarousel')} className="px-4 py-2 bg-blue-500 text-white rounded">
                Feed Carousel
              </button>
              <button onClick={() => setActiveMockup('storyAds')} className="px-4 py-2 bg-blue-500 text-white rounded">
                Story Ads
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveMockup('search')} className="px-4 py-2 bg-green-500 text-white rounded">
                Text Ads
              </button>
              <button onClick={() => setActiveMockup('maps')} className="px-4 py-2 bg-green-500 text-white rounded">
                Animated Ads
              </button>
            </>
          )}
        </div>

        {/* Phone Mockup */}
        <PhoneMockup>
          {renderMockup()}
        </PhoneMockup>
      </div>
    </div>
  );
};

export default HomePage;