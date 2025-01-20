import { useState, useEffect, useCallback } from "react";
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
import GoogleDisplayAds from "../components/PhoneMockup/GoogleMockup/GoogleDisplayads";
import { getGeneratedAds } from "../logic/rainbow/rainbowApi";

import FacebookIcon from "../assets/PhoneMockup/FB.png";
import GoogleIcon from "../assets/PhoneMockup/Google.png";

export default function Rainbow() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState("");
  const [appLogo, setAppLogo] = useState("");

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

  const [adStatuses, setAdStatuses] = useState({
    approved: new Set(),
    rejected: new Set()
  });

  const [activeApp, setActiveApp] = useState("facebook");
  const [activeMockup, setActiveMockup] = useState("storyAds");

  const apps = [
    { id: "facebook", alt: "Facebook", icon: FacebookIcon },
    { id: "google", alt: "Google", icon: GoogleIcon }
  ];

  useEffect(() => {
    const storedAppId = localStorage.getItem("appId");
    if (!storedAppId) {
      setError("No App ID found in local storage.");
      setLoading(false);
      return;
    }
  
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError("");
  
        const data = await getGeneratedAds(storedAppId);
  
        console.log("API Response Data:", data); // Log the entire API response
  
        // Set app info
        setAppName(data.appName || "");
        setAppLogo(data.logo || "");
  
        // Log the raw ads arrays from the API
        console.log("Raw Static Ads from API:", data.ads);
        console.log("Raw Animation Ads from API:", data.animations);
  
        // Provide default empty arrays if data.ads or data.animations are undefined
        const rawStaticAds = data.ads || [];
        const rawAnimationAds = data.animations || [];
  
        // Organize static ads by their types
        const storyAds = rawStaticAds
          .filter((ad) => ad.creativeUrl?.size === "1440x2560" && ad.creativeUrl?.adUrl)
          .map((ad) => ({
            ...ad,
            creativeUrl: {
              ...ad.creativeUrl,
              type: "storyAd"
            }
          }));
  
        const displayAds = rawStaticAds
          .filter((ad) => ad.creativeUrl?.size === "300x250" && ad.creativeUrl?.adUrl)
          .map((ad) => ({
            ...ad,
            creativeUrl: {
              ...ad.creativeUrl,
              type: "displayAd"
            }
          }));
  
        // Organize animation ads by their types
        const feedCarousel = rawAnimationAds
          .filter((ad) => ad.creativeUrl?.size === "1080x1080" && ad.creativeUrl?.animationUrl)
          .map((ad) => ({
            ...ad,
            creativeUrl: {
              ...ad.creativeUrl,
              type: "feedCarousel"
            }
          }));
  
        const animatedAds = rawAnimationAds
          .filter((ad) => ad.creativeUrl?.size === "300x250" && ad.creativeUrl?.animationUrl)
          .map((ad) => ({
            ...ad,
            creativeUrl: {
              ...ad.creativeUrl,
              type: "animatedAd"
            }
          }));
  
        // Log the filtered ads
        console.log("Story Ads:", storyAds);
        console.log("Feed Carousel Ads:", feedCarousel);
        console.log("Display Ads:", displayAds);
        console.log("Animated Ads:", animatedAds);
  
        setAds({
          storyAds,
          feedCarousel,
          displayAds,
          animatedAds
        });
      } catch (err) {
        console.error("[Rainbow] Error fetching ads:", err);
        setError(err.message || "Failed to load ads");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAds();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLE APP SWITCHING (FACEBOOK -> storyAds/feedCarousel, GOOGLE -> display/animated)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeApp === "google") {
      setActiveMockup("displayAds");
    } else if (activeApp === "facebook") {
      setActiveMockup("storyAds");
    }
  }, [activeApp]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS (NAVIGATION, APPROVE/REJECT)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    const currentAds = ads[activeMockup];
    if (!currentAds?.length) return;

    setCurrentIndex((prev) => ({
      ...prev,
      [activeMockup]: (prev[activeMockup] + 1) % currentAds.length
    }));
  }, [ads, activeMockup]);

  const handlePrev = useCallback(() => {
    const currentAds = ads[activeMockup];
    if (!currentAds?.length) return;

    setCurrentIndex((prev) => ({
      ...prev,
      [activeMockup]:
        prev[activeMockup] === 0
          ? currentAds.length - 1
          : prev[activeMockup] - 1
    }));
  }, [ads, activeMockup]);

  // Decide which URL property to use based on the mockup type
  // Updated getAdUrl function
  const getAdUrl = (mockupType, currentAd) => {
    console.log("getAdUrl - mockupType:", mockupType);
    console.log("getAdUrl - currentAd:", currentAd);
  
    if (!currentAd?.creativeUrl) {
      return null;
    }
  
    // For animated ads (feedCarousel and animatedAds)
    if (mockupType === "feedCarousel" || mockupType === "animatedAds") {
      // Return the raw animation URL without any encoding
      return currentAd.creativeUrl.animationUrl || null;
    }
  
    // For static ads (storyAds and displayAds)
    if (mockupType === "storyAds" || mockupType === "displayAds") {
      return currentAd.creativeUrl.adUrl || null;
    }
  
    return null;
  };
  const getAdIdentifier = useCallback((mockupType, currentAd) => {
    const url = getAdUrl(mockupType, currentAd);
    return `${mockupType}:${currentAd?.id || url}`;
  }, []);

  const handleAccept = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    try {
      const currentAd = ads[activeMockup][currentIndex[activeMockup]];
      console.log("handleAccept - Full currentAd object:", JSON.stringify(currentAd, null, 2));
  
      const creativeUrl = getAdUrl(activeMockup, currentAd);
      console.log("handleAccept - creativeUrl:", creativeUrl);
  
      if (!creativeUrl) {
        throw new Error("No URL found for the current creative");
      }
  
      const payload = {
        creativeId: creativeUrl,
        status: "approved"
      };
  
      console.log("API Request Payload:", JSON.stringify(payload, null, 2));
  
      const response = await fetch("http://localhost:8000/api/creativesStatus/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.error("handleAccept - API Error:", data);
        throw new Error(data.message || "Failed to approve creative");
      }
  
      // Get unique identifier for the current ad
      const adIdentifier = getAdIdentifier(activeMockup, currentAd);
  
      // Update statuses - add to approved and remove from rejected if present
      setAdStatuses(prev => {
        const newApproved = new Set(prev.approved);
        const newRejected = new Set(prev.rejected);
        
        newApproved.add(adIdentifier);
        newRejected.delete(adIdentifier);
        
        return {
          approved: newApproved,
          rejected: newRejected
        };
      });
  
      handleNext();
    } catch (err) {
      console.error("Error approving creative:", err.message);
      setError(err.message);
    }
  }, [ads, currentIndex, activeMockup, handleNext, getAdIdentifier]);
  
  const handleReject = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    try {
      const currentAd = ads[activeMockup][currentIndex[activeMockup]];
      const creativeUrl = getAdUrl(activeMockup, currentAd);
      
      if (!creativeUrl) {
        throw new Error("No URL found for the current creative");
      }
  
      const response = await fetch("http://localhost:8000/api/creativesStatus/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creativeId: creativeUrl,
          status: "rejected"
        })
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reject creative");
      }

      // Get unique identifier for the current ad
      const adIdentifier = getAdIdentifier(activeMockup, currentAd);
  
      // Update statuses - add to rejected and remove from approved if present
      setAdStatuses(prev => {
        const newApproved = new Set(prev.approved);
        const newRejected = new Set(prev.rejected);
        
        newRejected.add(adIdentifier);
        newApproved.delete(adIdentifier);
        
        return {
          approved: newApproved,
          rejected: newRejected
        };
      });
  
      handleNext();
    } catch (err) {
      console.error("Error rejecting creative:", err.message);
      setError(err.message);
    }
  }, [ads, currentIndex, activeMockup, handleNext, getAdIdentifier]);

  // Update the function to check current ad status
  const getCurrentAdStatus = () => {
    const currentAd = ads[activeMockup]?.[currentIndex[activeMockup]];
    if (!currentAd) return null;
    
    const adIdentifier = getAdIdentifier(activeMockup, currentAd);
    
    if (adStatuses.approved.has(adIdentifier)) {
      return 'approved';
    }
    if (adStatuses.rejected.has(adIdentifier)) {
      return 'rejected';
    }
    return null;
  };


  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER CHILD MOCKUPS
  // ─────────────────────────────────────────────────────────────────────────────
  const renderAllMockups = () => {
    const mockupProps = {
      currentIndex: currentIndex[activeMockup],
      // If you need the child to set its own index for any reason, keep this:
      setCurrentIndex: (newIndex) =>
        setCurrentIndex((prev) => ({ ...prev, [activeMockup]: newIndex })),
      ads: ads[activeMockup],
      // If your child modifies its array in some way (though it typically shouldn't):
      setAds: (newAds) =>
        setAds((prev) => ({ ...prev, [activeMockup]: newAds })),

      // For display in the child (if needed):
      appName,
      appLogo
    };

    switch (activeMockup) {
      case "storyAds":
        return <FbStoryAds {...mockupProps} />;
      case "feedCarousel":
        return <FbFeedCarousel {...mockupProps} />;
      case "displayAds":
        return <GoogleDisplayAds {...mockupProps} />;
      case "animatedAds":
        return <GoogleAnimatedAds {...mockupProps} />;
      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // UI RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return <p>Loading...</p>;
  }

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
                ${
                  activeApp === app.id
                    ? "text-blue-800"
                    : "text-gray-500 hover:text-gray-300"
                }
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
                  ${
                    activeMockup === "storyAds"
                      ? "selected-gradient"
                      : "unselected-gradient"
                  }`}
              >
                Story Ads
              </button>
              <button
                onClick={() => setActiveMockup("feedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${
                    activeMockup === "feedCarousel"
                      ? "selected-gradient"
                      : "unselected-gradient"
                  }`}
              >
                Feed Carousel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveMockup("displayAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${
                    activeMockup === "displayAds"
                      ? "selected-gradient"
                      : "unselected-gradient"
                  }`}
              >
                Display Ads
              </button>
              <button
                onClick={() => setActiveMockup("animatedAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${
                    activeMockup === "animatedAds"
                      ? "selected-gradient"
                      : "unselected-gradient"
                  }`}
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
              adStatus={getCurrentAdStatus()}
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
