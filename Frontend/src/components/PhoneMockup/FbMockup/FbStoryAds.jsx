import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";
import PropTypes from "prop-types";

// Keep the existing API function
async function getGeneratedAds(appId) {
  const BASE_URL = "https://growth-with-growthz.onrender.com";
  const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch generated ads");
  }
  return await response.json();
}

// Update the component to accept currentIndex as a prop while maintaining existing functionality
export default function FacebookStory({ currentIndex, setCurrentIndex, ads, setAds }) {
  const [error, setError] = useState("");
  const [appName, setAppName] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  
  // Get stored appId from localStorage (maintaining existing functionality)
  const storedAppId = localStorage.getItem("appId") || "";

  // Fetch ads when component mounts or appId changes
  useEffect(() => {
    if (!storedAppId) return;
    
    async function fetchAdsForApp() {
      console.log('Fetching ads for appId:', storedAppId);
      try {
        setLoadingAds(true);
        setError("");

        const data = await getGeneratedAds(storedAppId);
        console.log('Received data:', data);
        
        if (data.appName) setAppName(data.appName);
        
        // Filter for 1440x2560 ads (maintaining existing filtering logic)
        const ad_1440x2560 = data.ads.filter(
          (item) => item.creativeUrl?.size === "1440x2560"
        );
        
        console.log('Filtered 1440x2560 ads:', ad_1440x2560);
        
        if (ad_1440x2560.length > 0) {
          setAds(ad_1440x2560);
          // Initialize currentIndex if it's provided as a control prop
          if (setCurrentIndex) {
            setCurrentIndex(0);
          }
          console.log('Set ads and reset index to 0');
        } else {
          setError("No 1440x2560 ads found.");
        }
      } catch (err) {
        console.error("[getGeneratedAds] Error:", err.message);
        setError(err.message || "Error fetching ads");
      } finally {
        setLoadingAds(false);
      }
    }

    fetchAdsForApp();
  }, [storedAppId, setCurrentIndex, setAds]);

  // Get the current ad data
  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd.creativeUrl?.adUrl;

  // Render component with error and loading states
  return (
    <>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loadingAds && <p className="text-gray-700 text-center mb-4">Loading ads...</p>}
      <div className="relative w-full h-full bg-black flex flex-col">
        {/* Story progress bar */}
        <div className="absolute top-8 left-4 right-4 h-0.5 bg-gray-700 rounded-full">
          <div className="h-0.5 bg-white rounded-full" style={{ width: "70%" }}></div>
        </div>

        {/* App header */}
        <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {appName.charAt(0)}
            </div>
            <span className="ml-2 text-white text-sm font-semibold">{appName}</span>
          </div>
          <button className="text-white">
            <X size={22} />
          </button>
        </div>

        {/* Main ad content */}
        <div className="flex-grow flex items-center justify-center mt-[38px] mb-20">
          <img src={mainAdUrl} alt="Story" className="w-full h-full object-contain" />
        </div>

        {/* Share button */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <button className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-semibold">
            <Share size={12} className="mr-2" />
            Share
          </button>
        </div>
      </div>
    </>
  );
}

// Update PropTypes to reflect new props structure
FacebookStory.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func,
  ads: PropTypes.array.isRequired,
  setAds: PropTypes.func.isRequired
};