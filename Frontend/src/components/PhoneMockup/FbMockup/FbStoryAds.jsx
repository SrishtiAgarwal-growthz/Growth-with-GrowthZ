import { useEffect, useState } from "react";
import { X, Share, ArrowLeft, ArrowRight, } from "lucide-react";

async function getGeneratedAds(appId) {
  const BASE_URL = "http://localhost:8000";
  const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch generated ads");
  }
  return await response.json();
}

export default function FacebookStory() {
  const [error, setError] = useState("");
  const [appName, setAppName] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const storedAppId = localStorage.getItem("appId") || "";

  useEffect(() => {
    if (!storedAppId) return;
    async function fetchAdsForApp() {
      try {
        setLoadingAds(true);
        setError("");

        const data = await getGeneratedAds(storedAppId);
        if (data.appName) setAppName(data.appName);
        const ad_1440x2560 = data.ads.filter(
          (item) => item.creativeUrl?.size === "1440x2560"
        );
        if (ad_1440x2560.length > 0) {
          setAds(ad_1440x2560);
          setCurrentIndex(0);
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

  const handleNextAd = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
  };

  const handlePrevAd = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
  };

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
        {/* Left Arrow */}
        <button
          onClick={handlePrevAd}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 p-2 rounded-full"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-grow flex items-center justify-center mt-[38px] mb-20">
          <img src={mainAdUrl} alt="Story" className="w-full h-full object-contain" />
        </div>
        {/* Right Arrow */}
        <button
          onClick={handleNextAd}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 p-2 rounded-full"
        >
          <ArrowRight size={20} className="text-white" />
        </button>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <button
            className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-semibold"
          >
            <Share size={12} className="mr-2" />
            Share
          </button>
        </div>
      </div>
    </>
  );
}
