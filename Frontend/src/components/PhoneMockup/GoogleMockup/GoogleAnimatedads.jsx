import PropTypes from "prop-types";
import { Share } from "lucide-react";

export default function GoogleAnimatedAds({
  currentIndex,
  ads
}) {
  console.log("GoogleAnimatedAds - currentIndex:", currentIndex);
  console.log("GoogleAnimatedAds - ads:", ads);

  if (!ads?.length) {
    console.log("GoogleAnimatedAds - No ads found.");
    return <p className="text-gray-400 text-center">No animated ads found.</p>;
  }

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd.creativeUrl?.animationUrl;

  console.log("GoogleAnimatedAds - currentAd:", currentAd);
  console.log("GoogleAnimatedAds - mainAdUrl:", mainAdUrl);

  const ArticleBlurSection = () => (
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#18191A]">
      {/* Google "Search Bar" */}
      <div className="pt-8 pb-2">
        <div className="px-4 flex items-center justify-between">
          <div className="text-white text-sm">google.com</div>
          <Share className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <ArticleBlurSection />

        {/* Ad Container */}
        <div className="p-4 flex justify-center items-center">
          <div className="w-full max-w-[300px]">
            {mainAdUrl ? (
              <img
                src={mainAdUrl}
                alt="Animated Ad"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-[250px] flex items-center justify-center bg-gray-800 rounded-lg">
                <p className="text-gray-400">No animation URL available</p>
              </div>
            )}
          </div>
        </div>

        <ArticleBlurSection />
      </div>
    </div>
  );
}

GoogleAnimatedAds.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func,
  ads: PropTypes.array.isRequired,
  setAds: PropTypes.func,
  appName: PropTypes.string,
  appLogo: PropTypes.string
};