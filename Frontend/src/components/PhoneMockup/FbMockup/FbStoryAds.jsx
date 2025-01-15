import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";
import PropTypes from "prop-types";

async function getGeneratedAds(appId) {
  const BASE_URL = "http://localhost:8000";
  const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch generated ads");
  }
  return await response.json();
}

export default function FacebookStory({ currentIndex, setCurrentIndex, ads, setAds }) {
  const [error, setError] = useState("");
  const [appName, setAppName] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  
  const storedAppId = localStorage.getItem("appId") || "";

  useEffect(() => {
    let mounted = true;
    if (!storedAppId) return;
    
    async function fetchAdsForApp() {
      // Only fetch if we don't already have ads
      if (ads.length > 0) return;
      
      console.log('Fetching ads for appId:', storedAppId);
      try {
        setLoadingAds(true);
        setError("");

        const data = await getGeneratedAds(storedAppId);
        
        // Check if component is still mounted
        if (!mounted) return;
        
        console.log('Received data:', data);
        
        if (data.appName) setAppName(data.appName);
        
        // Explicitly filter for story ads size
        const storyAds = data.ads.filter(
          (item) => item.creativeUrl?.size === "1440x2560"
        );
        
        console.log('Filtered story ads:', storyAds);
        
        if (storyAds.length > 0) {
          setAds(storyAds);
          // Only set index if we have control and if it's not already set
          if (setCurrentIndex && currentIndex === 0) {
            setCurrentIndex(0);
          }
        } else {
          setError("No story ads (1440x2560) found.");
        }
      } catch (err) {
        if (!mounted) return;
        console.error("[getGeneratedAds] Error:", err.message);
        setError(err.message || "Error fetching story ads");
      } finally {
        if (mounted) {
          setLoadingAds(false);
        }
      }
    }

    fetchAdsForApp();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [storedAppId, ads, currentIndex, setAds, setCurrentIndex]);

  // Get current ad data safely
  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd.creativeUrl?.adUrl;

  // Error and loading states
  if (error) {
    return <p className="text-red-500 text-center mb-4">{error}</p>;
  }
  if (loadingAds) {
    return <p className="text-gray-700 text-center mb-4">Loading story ads...</p>;
  }

  return (
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
        {mainAdUrl && (
          <img 
            src={mainAdUrl} 
            alt="Story Ad" 
            className="w-full h-full object-contain" 
          />
        )}
      </div>

      {/* Share button */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <button className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-semibold">
          <Share size={12} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}

FacebookStory.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func,
  ads: PropTypes.array.isRequired,
  setAds: PropTypes.func.isRequired
};