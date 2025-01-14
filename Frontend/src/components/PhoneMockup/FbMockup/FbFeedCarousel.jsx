import { useEffect, useState } from "react";
import { Plus, Search, MessageCircle, MoreHorizontal, Home, PlaySquare, Users, X, ArrowLeft,
  ArrowRight, } from 'lucide-react';

/** 
 * Example fetch function returning { appId, appName, ads: [...] } 
 * from your backend route `/api/creatives/get-ads?appId=...`.
 */
async function getGeneratedAds(appId) {
  const BASE_URL = "http://localhost:8000";
  const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch generated ads");
  }
  return await response.json();
}

/**
 * shortCaption(phrase):
 * - Removes leading numbering like "12. " 
 * - Takes the first 3 words
 * - Returns a JSX fragment with "...read more" in blue.
 */
function shortCaption(phrase) {
  if (!phrase || typeof phrase !== "string") return null;

  // Remove leading digits like "4. "
  const cleaned = phrase.replace(/^\d+\.\s*/, "").trim();

  // Split by whitespace
  const words = cleaned.split(/\s+/);

  // Take the first 3 words
  const firstThree = words.slice(0, 5).join(" ");

  // Return a JSX element
  return (
    <>
      {firstThree}{" "}
      <span style={{ color: "#0096FF" }}> ... See More</span>
    </>
  );
}

export default function FacebookMockup() {
  const [error, setError] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  const [ads, setAds] = useState([]);
  const [appName, setAppName] = useState("");
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
        if (data.animations && data.animations.length > 0) {
          // Filter out only 1080x1080 ads if you want
          const only1080 = data.animations.filter(
            (item) => item.creativeUrl?.size === "1080x1080"
          );
          if (only1080.length > 0) {
            setAds(only1080);
            setCurrentIndex(0);
          } else {
            setError("No 1080x1080 animations found.");
          }
        } else {
          setError("No animations found in response.");
        }
      } catch (err) {
        console.error("[getGeneratedAnimations] Error:", err.message);
        setError(err.message || "Error fetching animations");
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
  const mainAdUrl = currentAd.creativeUrl?.animationUrl;
  const rawPhrase = currentAd.creativeUrl?.phrase || "";
  const adCaption = shortCaption(rawPhrase);

  return (
    <>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loadingAds && <p className="text-gray-700 text-center mb-4">Loading ads...</p>}

      {/* Facebook Header - pushed down to account for notch */}
      <div className="bg-[#3a3b3c] text-white px-3 pt-7 pb-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-[#0866ff]">Fb</span>
          <div className="flex items-center space-x-2">
            <button className="bg-[#3a3b3c] p-1.5 rounded-full">
              <Plus size={14} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-1.5 rounded-full">
              <Search size={14} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-1.5 rounded-full relative">
              <MessageCircle size={14} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] w-3 h-3 flex items-center justify-center rounded-full">4</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-black"></div>
      {/* Post Content */}
      <div className="bg-[#3a3b3c] text-white px-3">
        <div className="py-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#3a3b3c] rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2">
                <span>{appName ? appName[0] : "A"}</span>
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-[12px] font-semibold">{appName || "MyApp"}</p>
                </div>
                <p className="text-[10px] text-gray-400">Sponsored · </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MoreHorizontal size={16} className="text-gray-400" />
              <X size={16} className="text-gray-400" />
            </div>
          </div>

          <p className="text-xs mb-2">{adCaption}</p>

          {/* Left Arrow */}
          <button
            onClick={handlePrevAd}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 p-2 rounded-full"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          {/* Post Image */}
          <div className="rounded-lg overflow-hidden bg-[#242526]">
            <img
              src={mainAdUrl}
              className="w-full h-[225px] object-contain"
            />
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNextAd}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 p-2 rounded-full"
          >
            <ArrowRight size={20} className="text-white" />
          </button>

          {/* Action Buttons */}
          <div className="mt-2 flex justify-between border-t border-[#3a3b3c] pt-2">
            <button className="flex items-center space-x-1 text-gray-400">
              <span>👍</span>
              <span className="text-xs">Like</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-400">
              <span>💬</span>
              <span className="text-xs">Comment</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-400">
              <span>↗</span>
              <span className="text-xs">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-black"></div>
      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-[#242526] border-t border-[#3a3b3c] mb-[10px]">
        <div className="flex justify-between px-6 py-1">
          <button className="flex flex-col items-center text-[#0866ff]">
            <Home size={12} />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <PlaySquare size={12} />
            <span className="text-[10px] mt-0.5">Video</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Users size={12} />
            <span className="text-[10px] mt-0.5">Friends</span>
          </button>
          {/* <button className="flex flex-col items-center text-gray-400">
            <img
              src="/api/placeholder/20/20"
              alt="Marketplace"
              className="w-5 h-5"
            />
            <span className="text-[10px] mt-0.5">Market</span>
          </button> */}
        </div>
      </div>
    </>
  );
};
