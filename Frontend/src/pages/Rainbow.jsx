import { useState } from "react";
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
import GoogleTextAds from "../components/PhoneMockup/GoogleMockup/GoogleTextads";

const HomePage = () => {
  const [activeApp, setActiveApp] = useState("facebook");
  const [activeMockup, setActiveMockup] = useState("feedCarousel");

  const apps = [
    { id: 'facebook', alt: 'Facebook' },
    { id: 'google', alt: 'Google' },
    { id: 'linkedin', alt: 'LinkedIn' },
    { id: 'twitter', alt: 'Twitter' },
    { id: 'presentation', alt: 'Presentation' }
  ];

  const renderMockup = () => {
    if (activeApp === "facebook") {
      return activeMockup === "feedCarousel" ? (
        <FbFeedCarousel />
      ) : (
        <FbStoryAds />
      );
    } else if (activeApp === "google") {
      return activeMockup === "search" ? (
        <GoogleAnimatedAds />
      ) : (
        <GoogleTextAds />
      );
    }
    return null;
  };

  return (
    <div className="bg-black min-h-screen w-full relative overflow-x-hidden">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-[#0F0F0F] flex flex-col items-center justify-center gap-8 z-10">
        {apps.map((app) => (
          <div key={app.id} className="relative flex items-center">
            {/* Active indicator line */}
            {activeApp === app.id && (
              <div className="absolute -right-2 h-5 w-0.5 bg-blue-500 rounded-full" />
            )}
            
            {/* Button container with hover effect */}
            <button
              onClick={() => setActiveApp(app.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center
                ${activeApp === app.id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}
                transition-colors duration-300`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {/* Placeholder for icon - replace with actual icons later */}
                <span className="text-sm">{app.alt[0]}</span>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="ml-16 w-[calc(100%-4rem)] p-4 md:p-6">
        {/* Centered Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8 w-full">
          {activeApp === "facebook" ? (
            <>
              <button
                onClick={() => setActiveMockup("feedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "feedCarousel" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Feed Carousel
              </button>
              <button
                onClick={() => setActiveMockup("storyAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "storyAds" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Story Ads
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveMockup("search")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "search" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Text Ads
              </button>
              <button
                onClick={() => setActiveMockup("maps")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "maps" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Animated Ads
              </button>
            </>
          )}
        </div>

        {/* Phone Mockup Container */}
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-md mx-auto">
            <PhoneMockup>{renderMockup()}</PhoneMockup>
          </div>
        </div>
      </div>

      {/* Styles for gradients */}
      <style>
        {`
          .selected-gradient {
            background: linear-gradient(180deg, #0163F8 0%, #013A92 100%);
          }
          
          .unselected-gradient {
            background: linear-gradient(180deg, #1C252F66 0%, #59759566 100%);
          }
          
          .selected-gradient:hover {
            opacity: 0.9;
          }
          
          .unselected-gradient:hover {
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;