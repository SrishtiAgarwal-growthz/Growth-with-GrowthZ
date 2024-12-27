import React, { useEffect, useState } from "react";
import {
  Battery,
  Wifi,
  Plus,
  Search,
  MessageCircle,
  MoreHorizontal,
  Home,
  PlaySquare,
  Users,
  X,
} from "lucide-react";
import placeholderImage from "../assets/creative.png";

/** 
 * Example fetch function returning { appId, appName, ads: [...] } 
 * from your backend route `/api/creatives/get-ads?appId=...`.
 */
async function getGeneratedAds(appId) {
  const BASE_URL = "https://growth-with-growthz.onrender.com";
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

export default function MainRainbow() {
  const [error, setError] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  const [ads, setAds] = useState([]);
  const [appName, setAppName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // We'll assume appId is stored in localStorage
  const storedAppId = localStorage.getItem("appId") || "";

  // On mount, fetch ads
  useEffect(() => {
    if (!storedAppId) return;

    async function fetchAdsForApp() {
      try {
        setLoadingAds(true);
        setError("");

        // Suppose your backend returns { appName, ads: [...], appId }
        const data = await getGeneratedAds(storedAppId);
        console.log("[MainRainbow] Ads data received:", data);

        if (data.appName) {
          setAppName(data.appName);
        }

        if (data.ads && data.ads.length > 0) {
          // Filter out only 1080x1080 ads if you want
          const only1080 = data.ads.filter(
            (item) => item.creativeUrl?.size === "1080x1080"
          );
          if (only1080.length > 0) {
            setAds(only1080);
            setCurrentIndex(0);
          } else {
            setError("No 1080x1080 ads found.");
          }
        } else {
          setError("No ads found in response.");
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

  // Carousel controls
  const goNext = () => {
    if (currentIndex < ads.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Current ad
  const currentAd = ads[currentIndex] || {};
  const mainAdUrl =
    currentAd.creativeUrl?.filePath ||
    currentAd.creativeUrl?.adUrl ||
    placeholderImage;

  // Use shortCaption() to get the 3-word truncated text
  const rawPhrase = currentAd.creativeUrl?.phrase || "";
  const adCaption = shortCaption(rawPhrase);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Error / Loading */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loadingAds && <p className="text-gray-700 text-center mb-4">Loading ads...</p>}

      {/* Prev / Next Buttons */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={goPrev}
          disabled={currentIndex <= 0}
          className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex >= ads.length - 1}
          className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* iPhone Mockup */}
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-[32rem] bg-black rounded-[2.5rem] border-8 border-[#1d1e20] shadow-xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-[#3a3b3c] z-50">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-[#1d1e20] rounded-b-3xl" />
            <div className="relative h-full px-3 flex justify-between items-center text-white">
              <span className="text-[10px] font-semibold">4:28</span>
              <div className="flex items-center gap-1">
                <Wifi size={10} />
                <Battery size={12} />
              </div>
            </div>
          </div>

          {/* "Facebook" Header */}
          <div className="bg-[#3a3b3c] text-white px-3 pt-7 pb-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-[#0866ff]">facebook</span>
              <div className="flex items-center space-x-2">
                <button className="bg-[#3a3b3c] p-1.5 rounded-full">
                  <Plus size={14} className="text-white" />
                </button>
                <button className="bg-[#3a3b3c] p-1.5 rounded-full">
                  <Search size={14} className="text-white" />
                </button>
                <button className="bg-[#3a3b3c] p-1.5 rounded-full relative">
                  <MessageCircle size={14} className="text-white" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] w-3 h-3 flex items-center justify-center rounded-full">
                    4
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="h-[7px] bg-black"></div>

          {/* Post Content */}
          <div className="bg-[#3a3b3c] text-white px-3">
            <div className="py-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  {/* Profile circle with first letter of appName */}
                  <div className="w-8 h-8 bg-[#3a3b3c] rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                    {appName ? appName[0] : "A"}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-semibold">{appName || "MyApp"}</p>
                    </div>
                    <p className="text-[10px] text-gray-400">Sponsored · </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MoreHorizontal size={16} className="text-gray-400" />
                  <X size={16} className="text-gray-400" />
                </div>
              </div>

              {/* Only the first 3 words + "...read more" in blue */}
              <p className="text-xs mb-2">{adCaption}</p>

              {/* The 1080x1080 Ad image */}
              <div className="rounded-lg overflow-hidden bg-[#242526]">
                <img
                  src={mainAdUrl}
                  alt="Ad in iPhone Mockup"
                  className="w-full h-[225px] object-contain"
                />
              </div>

              {/* Like/Comment/Share */}
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

          <div className="h-[4px] bg-black"></div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 w-full bg-[#242526] border-t border-[#3a3b3c] mb-[10px]">
            <div className="flex justify-between px-6 py-1">
              <button className="flex flex-col items-center text-[#0866ff]">
                <Home size={20} />
                <span className="text-[10px] mt-0.5">Home</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <PlaySquare size={20} />
                <span className="text-[10px] mt-0.5">Video</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <Users size={20} />
                <span className="text-[10px] mt-0.5">Friends</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <img
                  src="/api/placeholder/20/20"
                  alt="Marketplace"
                  className="w-5 h-5"
                />
                <span className="text-[10px] mt-0.5">Market</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Index or status */}
      {ads.length > 0 && (
        <p className="text-center mt-4">
          Ad {currentIndex + 1} of {ads.length} (1080x1080)
        </p>
      )}
    </div>
  );
}
