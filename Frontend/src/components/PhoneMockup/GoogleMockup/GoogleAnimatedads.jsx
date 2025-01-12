import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Share, ArrowLeft, ArrowRight } from "lucide-react";

// Fetch function to get ads
async function getGeneratedAds(appId) {
  const BASE_URL = "http://localhost:8000";
  const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch generated ads");
  }
  return await response.json();
}

const GoogleAnimatedAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const storedAppId = localStorage.getItem("appId") || "";

  // Fetch and filter ads
  useEffect(() => {
    if (!storedAppId) return;

    const fetchAds = async () => {
      try {
        setLoading(true);
        const data = await getGeneratedAds(storedAppId);
        const filteredAds = data.animations.filter(
          (ad) => ad.creativeUrl?.size === "300x250" // Adjust filter criteria for Google ads if needed
        );
        setAds(filteredAds);
      } catch (err) {
        setError(err.message || "Error fetching ads");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [storedAppId]);

  // Navigation Handlers
  const handleNextAd = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
  };

  const handlePrevAd = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
  };

  // Get current ad
  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd.creativeUrl?.animationUrl || "";

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Add padding-top to account for the notch */}
      <div className="pt-8">
        {/* Google Search Bar */}
        <div className="p-4 bg-neutral-800">
          <div className="flex items-center">
            <div className="text-white text-sm">google.com</div>
            <div className="ml-auto">
              <Share className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 space-y-2">
              <div className="h-4 bg-neutral-800 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
            </div>
          )}
          {error && (
            <div className="p-4 text-red-500 text-center">
              Failed to load ads: {error}
            </div>
          )}
          {!loading && ads.length === 0 && (
            <div className="p-4 text-gray-400 text-center">
              No ads available for size 300x250.
            </div>
          )}
          {!loading && ads.length > 0 && (
            <div className="p-4">
              <div className="relative">
                {/* Ad Content */}
                <video
                  src={mainAdUrl}
                  className="w-full rounded-lg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ maxHeight: "300px" }}
                />

                {/* Navigation Buttons */}
                {ads.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevAd}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-30 p-2 rounded-full"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleNextAd}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-30 p-2 rounded-full"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

GoogleAnimatedAds.propTypes = {
  children: PropTypes.node,
};

export default GoogleAnimatedAds;
