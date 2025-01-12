import { useEffect, useState } from "react";
import { Share, ArrowLeft, ArrowRight } from "lucide-react";

async function fetchAds(appId) {
  const BASE_URL = "http://localhost:8000";
  const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch ads");
  }
  return response.json();
}

const NewsArticleMockup = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const storedAppId = localStorage.getItem("appId") || "";

  useEffect(() => {
    if (!storedAppId) return;

    const fetchAndSetAds = async () => {
      try {
        setLoading(true);
        const data = await fetchAds(storedAppId);
        const filteredAds = data.ads.filter(
          (ad) => ad.creativeUrl?.size === "300x250"
        );
        setAds(filteredAds);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetAds();
  }, [storedAppId]);

  const handleNextAd = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
  };

  const handlePrevAd = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ads.length - 1 : prevIndex - 1
    );
  };

  const currentAd = ads[currentIndex] || null;

  const ArticleBlurSection = () => (
    <div className="space-y-2 px-4">
      <div className="h-4 bg-neutral-800 rounded w-11/12 blur-sm"></div>
      <div className="h-4 bg-neutral-800 rounded w-3/4 blur-sm"></div>
      <div className="h-4 bg-neutral-800 rounded w-10/12 blur-sm"></div>
      <div className="h-4 bg-neutral-800 rounded w-5/6 blur-sm"></div>
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
          {!loading && currentAd && (
            <div className="space-y-6 py-4">
              {/* Top Article Section */}
              <ArticleBlurSection />
              
              {/* Ad Creative */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={currentAd.creativeUrl.adUrl}
                    alt="Ad"
                    className="w-full h-auto object-contain"
                    style={{ maxWidth: "300px", maxHeight: "250px" }}
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

              {/* Bottom Article Section */}
              <ArticleBlurSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsArticleMockup;