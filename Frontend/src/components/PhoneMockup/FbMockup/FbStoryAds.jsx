import PropTypes from "prop-types";
import { X, Share } from "lucide-react";

export default function FbStoryAds({
  currentIndex,
  // If you don't need the child to set its own index, you can remove the line below:
  // setCurrentIndex,
  ads,
  appName,
  appLogo
}) {
  // Safely get current ad
  const currentAd = ads?.[currentIndex] || null;
  const mainAdUrl = currentAd?.creativeUrl?.adUrl;

  // If no ads in the array, show fallback
  if (!ads?.length) {
    return <p className="text-gray-500 text-center">No Story Ads found.</p>;
  }

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      {/* Story progress bar */}
      <div className="absolute top-8 left-4 right-4 h-0.5 bg-gray-700 rounded-full">
        <div
          className="h-0.5 bg-white rounded-full"
          style={{ width: "70%" }}
        ></div>
      </div>

      {/* App header */}
      <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* If you have a logo: */}
          {appLogo ? (
            <img
              src={appLogo}
              alt="App Logo"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
          )}
          <span className="ml-2 text-white text-sm font-semibold">
            {appName || "App Name"}
          </span>
        </div>
        <button className="text-white">
          <X size={22} />
        </button>
      </div>

      {/* Main ad content */}
      <div className="flex-grow flex items-center justify-center mt-[38px] mb-20">
        {mainAdUrl ? (
          <img
            src={mainAdUrl}
            alt="Story Ad"
            className="w-full h-full object-contain"
          />
        ) : (
          <p className="text-white">No ad URL available.</p>
        )}
      </div>

      {/* Share button */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <button className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-semibold">
          <Share size={12} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}

FbStoryAds.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func, // Only if needed
  ads: PropTypes.array.isRequired,
  appName: PropTypes.string,
  appLogo: PropTypes.string
};
