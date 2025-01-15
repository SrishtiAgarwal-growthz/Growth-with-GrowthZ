import { useState, useEffect, useCallback } from "react";
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
import GoogleDisplayAds from "../components/PhoneMockup/GoogleMockup/GoogleDisplayads";

import FacebookIcon from "../assets/PhoneMockup/FB.png";
import GoogleIcon from "../assets/PhoneMockup/Google.png";

export default function Rainbow() {
  // Core state management
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Separate states for each mockup type
  const [ads, setAds] = useState({
    storyAds: [],
    feedCarousel: [],
    displayAds: [],
    animatedAds: []
  });
  
  const [currentIndex, setCurrentIndex] = useState({
    storyAds: 0,
    feedCarousel: 0,
    displayAds: 0,
    animatedAds: 0
  });

  // Track approvals per mockup type
  const [approvedAds, setApprovedAds] = useState(new Set());
  
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
    const currentAds = ads[activeMockup];
    if (!currentAds?.length) return;

    setCurrentIndex(prev => ({
      ...prev,
      [activeMockup]: (prev[activeMockup] + 1) % currentAds.length
    }));
    console.log('Moving to next ad in', activeMockup);
  }, [ads, activeMockup]);

  const handlePrev = useCallback(() => {
    const currentAds = ads[activeMockup];
    if (!currentAds?.length) return;

    setCurrentIndex(prev => ({
      ...prev,
      [activeMockup]: prev[activeMockup] === 0 
        ? currentAds.length - 1 
        : prev[activeMockup] - 1
    }));
    console.log('Moving to previous ad in', activeMockup);
  }, [ads, activeMockup]);

  // Accept handler with API integration
  const handleAccept = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const currentAd = ads[activeMockup][currentIndex[activeMockup]];
      const adUrl = currentAd?.creativeUrl?.adUrl;
      
      if (!adUrl) {
        throw new Error("No ad URL found for the current creative");
      }

      const response = await fetch("http://localhost:8000/api/creativesStatus/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creativeId: adUrl,
          status: "approved",
          mockupType: activeMockup
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to approve creative");
      }

      // Store approval with mockup type
      setApprovedAds(prev => new Set([...prev, `${activeMockup}:${currentAd.id}`]));
      handleNext();
      
    } catch (err) {
      console.error("Error approving creative:", err.message);
      setError(err.message);
    }
  }, [ads, currentIndex, handleNext, activeMockup]);

  // Reject handler
  const handleReject = useCallback(() => {
    console.log('Creative Rejected');
    handleNext();
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
      setActiveMockup("displayAds");
    } else if (activeApp === "facebook") {
      setActiveMockup("storyAds");
    }
  }, [activeApp]);

  // Loading state handler
  if (loading) {
    return <p>Loading...</p>;
  }

  // Calculate if current ad is approved
  const isCurrentAdApproved = (() => {
    const currentAd = ads[activeMockup]?.[currentIndex[activeMockup]];
    return currentAd ? approvedAds.has(`${activeMockup}:${currentAd.id}`) : false;
  })();

  // Render mockup function based on active type
  const renderAllMockups = () => {
    const mockupProps = {
      currentIndex: currentIndex[activeMockup],
      setCurrentIndex: (index) => setCurrentIndex(prev => ({ ...prev, [activeMockup]: index })),
    };

    switch (activeMockup) {
      case "storyAds":
        return (
          <FbStoryAds
            {...mockupProps}
            ads={ads.storyAds}
            setAds={(newAds) => setAds(prev => ({ ...prev, storyAds: newAds }))}
          />
        );
      case "feedCarousel":
        return (
          <FbFeedCarousel
            {...mockupProps}
            ads={ads.feedCarousel}
            setAds={(newAds) => setAds(prev => ({ ...prev, feedCarousel: newAds }))}
          />
        );
      case "displayAds":
        return (
          <GoogleDisplayAds
            {...mockupProps}
            ads={ads.displayAds}
            setAds={(newAds) => setAds(prev => ({ ...prev, displayAds: newAds }))}
          />
        );
      case "animatedAds":
        return (
          <GoogleAnimatedAds
            {...mockupProps}
            ads={ads.animatedAds}
            setAds={(newAds) => setAds(prev => ({ ...prev, animatedAds: newAds }))}
          />
        );
    }
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
                onClick={() => setActiveMockup("displayAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "displayAds" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Display Ads
              </button>
              <button
                onClick={() => setActiveMockup("animatedAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "animatedAds" ? "selected-gradient" : "unselected-gradient"}`}
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
              isApproved={isCurrentAdApproved}
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