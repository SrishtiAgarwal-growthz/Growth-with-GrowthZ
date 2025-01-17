import PropTypes from "prop-types";
import { Share } from "lucide-react";

/**
 * Renders Google display ads (e.g., 300x250) within a phone mockup UI.
 */
export default function GoogleDisplayAds({
  currentIndex,
  // setCurrentIndex, // only needed if child modifies index
  ads
  // setAds,          // only needed if child modifies ads
  // appName,
  // appLogo
}) {
  // If no ads, fallback
  if (!ads?.length) {
    return <p className="text-gray-400 text-center">No display ads found.</p>;
  }

  const currentAd = ads[currentIndex] || null;
  const mainAdUrl = currentAd.creativeUrl?.adUrl;

  // Optional placeholder content
  const ArticleBlurSection = () => (
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  );


  return (
    <div className="flex flex-col h-full bg-neutral-900">
      <div className="pt-8">
        {/* "Site Header" */}
        <div className="p-2 bg-neutral-800 flex items-center">
          <div className="text-white text-sm">google.com</div>
          <div className="ml-auto">
            <Share className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <ArticleBlurSection />

          <div className="space-y-6 py-4">
            <div className="p-2">
              <div className="relative">
                {mainAdUrl ? (
                  <img
                    src={mainAdUrl}
                    alt="Display Ad"
                    className="w-full h-auto object-contain"
                    style={{ maxWidth: "300px", maxHeight: "250px" }}
                  />
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    No display ad URL available
                  </p>
                )}
              </div>
            </div>
          </div>

          <ArticleBlurSection />
        </div>
      </div>
    </div>
  );
}

GoogleDisplayAds.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func,
  ads: PropTypes.array.isRequired,
  setAds: PropTypes.func,
  appName: PropTypes.string,
  appLogo: PropTypes.string
};
