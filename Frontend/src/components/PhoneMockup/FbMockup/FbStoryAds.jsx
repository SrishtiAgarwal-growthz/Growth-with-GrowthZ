import { useEffect, useState, useCallback } from "react";
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

export default function FacebookStory({ setNextHandler, setPrevHandler }) {
  const [error, setError] = useState("");
  const [appName, setAppName] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const storedAppId = localStorage.getItem("appId") || "";

  // Handle next ad
  const nextAd = useCallback(() => {
    if (ads.length === 0) return;
    console.log('Next ad called, current index:', currentIndex);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
  }, [ads.length, currentIndex]);

  // Handle previous ad
  const prevAd = useCallback(() => {
    if (ads.length === 0) return;
    console.log('Previous ad called, current index:', currentIndex);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
  }, [ads.length, currentIndex]);

  // Set up navigation handlers
  useEffect(() => {
    setNextHandler(() => nextAd);
    setPrevHandler(() => prevAd);
  }, [nextAd, prevAd, setNextHandler, setPrevHandler]);

  // Fetch ads
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
        
        const ad_1440x2560 = data.ads.filter(
          (item) => item.creativeUrl?.size === "1440x2560"
        );
        
        console.log('Filtered 1440x2560 ads:', ad_1440x2560);
        
        if (ad_1440x2560.length > 0) {
          setAds(ad_1440x2560);
          setCurrentIndex(0);
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
  }, [storedAppId]);

  // Log current ad changes
  useEffect(() => {
    console.log('Current index changed to:', currentIndex);
    console.log('Current ad:', ads[currentIndex]);
  }, [currentIndex, ads]);

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd.creativeUrl?.adUrl;

  return (
    <>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loadingAds && <p className="text-gray-700 text-center mb-4">Loading ads...</p>}
      <div className="relative w-full h-full bg-black flex flex-col">
        <div className="absolute top-8 left-4 right-4 h-0.5 bg-gray-700 rounded-full">
          <div className="h-0.5 bg-white rounded-full" style={{ width: "70%" }}></div>
        </div>
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
        <div className="flex-grow flex items-center justify-center mt-[38px] mb-20">
          <img src={mainAdUrl} alt="Story" className="w-full h-full object-contain" />
        </div>
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

FacebookStory.propTypes = {
  setNextHandler: PropTypes.func.isRequired,
  setPrevHandler: PropTypes.func.isRequired
};