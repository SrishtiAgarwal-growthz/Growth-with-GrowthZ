import PropTypes from "prop-types";
import { X } from "lucide-react";
import share from "../../../assets/PhoneMockup/share.png";
import thumbs from "../../../assets/PhoneMockup/thumbs-up.png";
import heart from "../../../assets/PhoneMockup/heart.png";
import laugh from "../../../assets/PhoneMockup/laughing.png";

const getShortAppName = (name) => {
  if (!name) return "App Name"; // Default fallback

  // Step 1: Check for ":" or "|"
  if (name.includes(":")) {
    return name.split(":")[0].trim();
  }

  if (name.includes("|")) {
    return name.split("|")[0].trim();
  }

  if (name.includes("-")) {
    return name.split("-")[0].trim();
  }

  // Step 2: Return the full name if no truncation is needed
  return name.trim();
};

export default function FbStoryAds({
  currentIndex,
  // If you don't need the child to set its own index, you can remove the line below:
  // setCurrentIndex,
  ads,
  appName,
  appLogo,
  textColor,
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
          <span className="ml-2 text-sm font-semibold" style={{ color: textColor }}>
            {getShortAppName(appName)}
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
      <div className="absolute bottom-2 left-0 right-0 flex items-center px-1">
        <div className="flex items-center rounded-full px-2 py-2 flex-1">
          <img
            src={share}
            alt="Share"
            className="w-31 h-6 mr-2"
          />

        </div>
        <div className="flex gap-1 ml-1">
          <img src={heart} alt="Heart" className="w-6 h-6" />
          <img src={thumbs} alt="Thumbs Up" className="w-6 h-6" />
          <img src={laugh} alt="Laugh" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

FbStoryAds.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func, // Only if needed
  ads: PropTypes.array.isRequired,
  appName: PropTypes.string,
  appLogo: PropTypes.string,
  textColor: PropTypes.string,
};
