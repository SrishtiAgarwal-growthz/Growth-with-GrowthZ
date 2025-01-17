import { useEffect, useState } from "react";
import { Plus, Search, MessageCircle, MoreHorizontal, Home, PlaySquare, Users, X } from 'lucide-react';
import PropTypes from "prop-types";
import { getGeneratedAds } from "../../../logic/rainbow/rainbowApi.js";

function shortCaption(phrase) {
  if (!phrase || typeof phrase !== "string") return null;
  const cleaned = phrase.replace(/^\d+\.\s*/, "").trim();
  const words = cleaned.split(/\s+/);
  const firstThree = words.slice(0, 5).join(" ");
  return (
    <>
      {firstThree}{" "}
      <span style={{ color: "#0096FF" }}> ... See More</span>
    </>
  );
}

export default function FacebookFeedCarousel({ currentIndex, setCurrentIndex, ads, setAds }) {
  const [error, setError] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  const [appName, setAppName] = useState("");
  const [appLogo, setAppLogo] = useState("");
  const [ setDataFetched] = useState(false);

  const storedAppId = localStorage.getItem("appId") || "";

  useEffect(() => {
    let mounted = true;
    if (!storedAppId) return;

    async function fetchAdsForApp() {
      if (ads.length > 0) return;

      try {
        setLoadingAds(true);
        setError("");

        const data = await getGeneratedAds(storedAppId);

        if (!mounted) return;

        if (data.appName) setAppName(data.appName);

        if (data.logo) setAppLogo(data.logo);

        const carouselAds = data.animations?.filter(
          (item) => item.creativeUrl?.size === "1080x1080"
        );
        console.log('Filtered story ads:', carouselAds);
        if (carouselAds?.length > 0) {
          setAds(carouselAds);
          if (setCurrentIndex && currentIndex === 0) {
            setCurrentIndex(0);
          }
        } else {
          setError("No carousel ads (1080x1080) found.");
        }

        setDataFetched(true);
      } catch (err) {
        if (!mounted) return;
        console.error("[getGeneratedAds] Error:", err.message);
        setError(err.message || "Error fetching carousel ads");
      } finally {
        if (mounted) {
          setLoadingAds(false);
        }
      }
    }

    fetchAdsForApp();

    return () => {
      mounted = false;
    };
  }, [storedAppId, ads, currentIndex, setAds, setCurrentIndex, setDataFetched]);

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd.creativeUrl?.animationUrl;
  const rawPhrase = currentAd.creativeUrl?.phrase || "";
  const adCaption = shortCaption(rawPhrase);

  return (
    <>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loadingAds && <p className="text-gray-700 text-center mb-4"></p>}

      {/* Facebook Header */}
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
                <img src={appLogo} alt={appName} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-[10px] font-semibold">{appName || "MyApp"}</p>
                </div>
                <p className="text-[8px] text-gray-400">Sponsored · </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MoreHorizontal size={16} className="text-gray-400" />
              <X size={16} className="text-gray-400" />
            </div>
          </div>

          <p className="text-xs mb-2">{adCaption}</p>

          {/* Post Image */}
          <div className="rounded-lg overflow-hidden bg-[#242526]">
            <img
              src={mainAdUrl}
              alt="Carousel Ad"
              className="w-full h-[225px] object-contain"
            />
          </div>

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
        </div>
      </div>
    </>
  );
}

FacebookFeedCarousel.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func,
  ads: PropTypes.array.isRequired,
  setAds: PropTypes.func.isRequired
};