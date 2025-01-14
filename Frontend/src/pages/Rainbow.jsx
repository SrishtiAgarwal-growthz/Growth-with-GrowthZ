import { useState, useEffect, useCallback } from "react";
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
import GoogleDisplayAds from "../components/PhoneMockup/GoogleMockup/GoogleDisplayads";

import FacebookIcon from "../assets/PhoneMockup/FB.png";
import GoogleIcon from "../assets/PhoneMockup/Google.png";

const BASE_URL = "https://growth-with-growthz.onrender.com";

// Utility function for caption shortening
function shortCaption(phrase) {
  if (!phrase || typeof phrase !== "string") return "";
  const cleaned = phrase.replace(/^\d+\.\s*/, "").trim();
  const words = cleaned.split(/\s+/);
  const firstFive = words.slice(0, 5).join(" ");
  return firstFive + " ... See More";
}

export default function Rainbow() {
  // Core state management
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // UI state management
  const [activeApp, setActiveApp] = useState("facebook");
  const [activeMockup, setActiveMockup] = useState("storyAds");

  // Available apps configuration
  const apps = [
    { id: 'facebook', alt: 'Facebook', icon: FacebookIcon },
    { id: 'google', alt: 'Google', icon: GoogleIcon }
  ];

  // Centralized navigation handlers
  const handleNext = useCallback(() => {
    if (ads.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    console.log('Moving to next ad, new index:', (currentIndex + 1) % ads.length);
  }, [ads.length, currentIndex]);

  const handlePrev = useCallback(() => {
    if (ads.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
    console.log('Moving to previous ad');
  }, [ads.length]);

  // Accept handler with API integration
  // In Rainbow.jsx
const handleAccept = useCallback(async (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Use a local loading state instead of global state
  
  try {
    const currentAd = ads[currentIndex];
    const adUrl = currentAd?.creativeUrl?.adUrl;
    
    if (!adUrl) {
      throw new Error("No ad URL found for the current creative");
    }

    const response = await fetch(`${BASE_URL}/api/creativesStatus/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creativeId: adUrl,
        status: "approved",
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to approve creative");
    }

    // Only update state once after successful API call
    handleNext();
    
  } catch (err) {
    console.error("Error approving creative:", err.message);
    setError(err.message);
  } 
}, [ads, currentIndex, handleNext]);
  // Reject handler (can be expanded with API integration if needed)
  const handleReject = useCallback(() => {
    console.log('Creative Rejected');
    handleNext(); // Optionally move to next after rejection
  }, [handleNext]);

  // Effect to handle initial loading state
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Effect to handle app switching
  useEffect(() => {
    if (activeApp === "google") {
      setActiveMockup("display");
    } else if (activeApp === "facebook") {
      setActiveMockup("storyAds");
    }
  }, [activeApp]);

  // Effect to initialize ads (replace with your actual data fetching logic)
  useEffect(() => {
    setAds([{ id: 1, name: "Ad #1" }, { id: 2, name: "Ad #2" }]);
  }, []);

  // Loading state handler
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render all mockups function
  const renderAllMockups = () => {
    return (
      <div className="relative w-full h-full">
        {/* Facebook Mockups */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeApp === "facebook" && activeMockup === "feedCarousel" ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <FbFeedCarousel
            ads={ads}
            setAds={setAds}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            shortCaption={shortCaption}
          />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeApp === "facebook" && activeMockup === "storyAds" ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <FbStoryAds
            ads={ads}
            setAds={setAds}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </div>

        {/* Google Mockups */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeApp === "google" && activeMockup === "maps" ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <GoogleAnimatedAds
            ads={ads}
            setAds={setAds}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeApp === "google" && activeMockup === "display" ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <GoogleDisplayAds
            ads={ads}
            setAds={setAds}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen w-full relative overflow-x-hidden">
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-[#0F0F0F] flex flex-col items-center justify-center gap-8 z-10">
        {apps.map((app) => (
          <div key={app.id} className="relative flex items-center">
            {activeApp === app.id && (
              <div className="absolute -right-2 h-6 w-1 bg-blue-500 rounded-full" />
            )}
            <button
              onClick={() => setActiveApp(app.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center
                ${activeApp === app.id ? 'text-blue-800' : 'text-gray-500 hover:text-gray-300'}
                transition-colors duration-300`}
            >
              <div className="w-[3rem] h-[3rem] flex items-center justify-center">
                <img src={app.icon} alt={app.alt} className="w-full h-full object-contain" />
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="ml-16 w-[calc(100%-4rem)] p-4 md:p-6">
        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8 w-full">
          {activeApp === "facebook" ? (
            <>
              <button
                onClick={() => setActiveMockup("storyAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "storyAds" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Story Ads
              </button>
              <button
                onClick={() => setActiveMockup("feedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "feedCarousel" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Feed Carousel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveMockup("display")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "display" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Display Ads
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
            <PhoneMockup
              handleNext={handleNext}
              handlePrev={handlePrev}
              onAccept={handleAccept}
              onReject={handleReject}
            >
              {renderAllMockups()}
            </PhoneMockup>
          </div>
        </div>
      </div>

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
}