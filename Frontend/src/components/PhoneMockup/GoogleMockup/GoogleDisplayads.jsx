import { useEffect, useState } from "react";
import { Share } from "lucide-react";
import PropTypes from "prop-types";
import { getGeneratedAds } from "../../../logic/rainbow/rainbowApi.js"

const GoogleDisplayAds = ({ currentIndex, setCurrentIndex, ads, setAds }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedAppId = localStorage.getItem("appId") || "";

  useEffect(() => {
    let mounted = true;
    if (!storedAppId) return;

    const fetchAndSetAds = async () => {
      // Only fetch if we don't already have ads
      if (ads.length > 0) return;

      try {
        setLoading(true);
        setError("");

        const data = await getGeneratedAds(storedAppId);

        if (!mounted) return;

        const filteredAds = data.ads.filter(
          (ad) => ad.creativeUrl?.size === "300x250"
        );

        if (filteredAds.length > 0) {
          setAds(filteredAds);
          if (setCurrentIndex && currentIndex === 0) {
            setCurrentIndex(0);
          }
        } else {
          setError("No display ads (300x250) found.");
        }
      } catch (err) {
        if (!mounted) return;
        console.error("[fetchAds] Error:", err.message);
        setError(err.message || "Error fetching display ads");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAndSetAds();

    return () => {
      mounted = false;
    };
  }, [storedAppId, ads, currentIndex, setAds, setCurrentIndex]);

  const currentAd = ads[currentIndex] || null;

  const ArticleBlurSection = () => (
    <div className="p-4 space-y-2">
      <div className="h-4 bg-neutral-800 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
      <div className="h-4 bg-neutral-800 rounded w-3/4 animate-pulse"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      <div className="pt-8">
        {/* News Site Header */}
        <div className="p-2 bg-neutral-800">
          <div className="flex items-center">
            <div className="text-white text-sm">google.com</div>
            <div className="ml-auto">
              <Share className="w-4 h-4 text-white" />
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

          <ArticleBlurSection />
          {!loading && currentAd && (
            <div className="space-y-6 py-4">
              {/* Ad Creative */}
              <div className="p-2">
                <div className="relative">
                  <img
                    src={currentAd.creativeUrl.adUrl}
                    alt="Display Ad"
                    className="w-full h-auto object-contain"
                    style={{ maxWidth: "300px", maxHeight: "250px" }}
                  />
                </div>
              </div>
            </div>
          )}
          <ArticleBlurSection />
        </div>
      </div>
    </div>
  );
};

GoogleDisplayAds.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func,
  ads: PropTypes.array.isRequired,
  setAds: PropTypes.func.isRequired
};

export default GoogleDisplayAds;