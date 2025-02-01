import PropTypes from "prop-types";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Home,
  Search,
  PlusSquare,
  Play,
  User,
  X,
  MoreHorizontal,
} from "lucide-react";

export default function InstagramFeedCarousel({
  currentIndex,
  ads,
  appName,
  appLogo,
  websiteLink,
}) {
  console.log("InstagramFeedCarousel - currentIndex:", currentIndex);
  console.log("InstagramFeedCarousel - ads:", ads);
  console.log("InstagramFeedCarousel - appName:", appName);
  console.log("InstagramFeedCarousel - appLogo:", appLogo);
  console.log("InstagramFeedCarousel - website:", websiteLink);

  if (!ads?.length) {
    console.log("InstagramFeedCarousel - No ads found.");
    return (
      <p className="text-gray-500 text-center">No feed carousel ads found.</p>
    );
  }

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd?.creativeUrl?.animationUrl;
  const rawPhrase = currentAd?.creativeUrl?.phrase || "";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 mt-5">
        <div className="flex items-center gap-2">
          <button className="p-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path
                fill="currentColor"
                d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
              />
            </svg>
          </button>
          <div className="text-sm font-semibold">Posts</div>
        </div>
        <div className="flex items-center space-x-2">
          <MoreHorizontal size={16} className="text-gray-600" />
          <X size={16} className="text-gray-600" />
        </div>
      </div>

      {/* Post Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col">
          {/* Post Header */}
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                {appLogo ? (
                  <img
                    src={appLogo}
                    alt={appName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-red-500 flex items-center justify-center text-white text-xs">
                    {appName?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold">{appName || "App"}</div>
                <div className="text-[8px] text-gray-500">Sponsored</div>
              </div>
            </div>
          </div>

          {/* Post Image */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {mainAdUrl ? (
              <img
                src={mainAdUrl}
                alt="Ad Content"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm">No image available</div>
            )}
          </div>

          {/* Shop Now Strip */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
             <button
              onClick={() =>
                window.open(websiteLink, "_blank")
              }
             className="text-[10px] "
             >
                Install Now
             </button>
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>

          {/* Post Actions */}
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Heart size={15} className="text-gray-900" />
                <MessageCircle size={15} className="text-gray-900" />
                <Share2 size={15} className="text-gray-900" />
              </div>
              <Bookmark size={15} className="text-gray-900" />
            </div>
            

            {/* Caption */}
            <div className="text-xs">
              <span className="font-semibold">{appName}</span>{" "}
              {rawPhrase?.length > 100
                ? `${rawPhrase.substring(0, 100)}`
                : rawPhrase}
              {rawPhrase?.length > 100 }
            </div>

            {/* Website Link */}
            {/* <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-900 mt-1 block"
            >
              {websiteLink}
            </a> */}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white py-1 mt-auto">
        <div className="flex justify-between items-center px-6">
          <Home size={20} className="text-gray-900" />
          <Search size={20} className="text-gray-900" />
          <PlusSquare size={20} className="text-gray-900" />
          <Play size={20} className="text-gray-900" />
          <User size={20} className="text-gray-900" />
        </div>
      </div>
    </div>
  );
}

InstagramFeedCarousel.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  ads: PropTypes.array.isRequired,
  appName: PropTypes.string,
  appLogo: PropTypes.string,
  websiteLink: PropTypes.string,
};