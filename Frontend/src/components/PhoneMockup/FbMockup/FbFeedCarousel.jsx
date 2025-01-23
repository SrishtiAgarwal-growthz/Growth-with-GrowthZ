import PropTypes from "prop-types";
import {
  Plus,
  Search,
  MessageCircle,
  MoreHorizontal,
  Home,
  PlaySquare,
  Users,
  X
} from "lucide-react";

// function shortCaption(phrase) {
//   if (!phrase || typeof phrase !== "string") return null;
//   const cleaned = phrase.replace(/^\d+\.\s*/, "").trim();
//   const words = cleaned.split(/\s+/);
//   const firstFive = words.slice(0, 5).join(" ");
//   return (
//     <>
//       {firstFive}{" "}
//       <span style={{ color: "#0096FF" }}> ... See More</span>
//     </>
//   );
// }

export default function FacebookFeedCarousel({
  currentIndex,
  ads,
  appName,
  appLogo
}) {
  console.log("FbFeedCarousel - currentIndex:", currentIndex);
  console.log("FbFeedCarousel - ads:", ads);
  console.log("FbFeedCarousel - appName:", appName);
  console.log("FbFeedCarousel - appLogo:", appLogo);

  if (!ads?.length) {
    console.log("FbFeedCarousel - No ads found.");
    return <p className="text-gray-500 text-center">No feed carousel ads found.</p>;
  }

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd?.creativeUrl?.animationUrl;
  const rawPhrase = currentAd?.creativeUrl?.phrase || "";

  console.log("FbFeedCarousel - currentAd:", currentAd);
  console.log("FbFeedCarousel - mainAdUrl:", mainAdUrl);
  console.log("FbFeedCarousel - adCaption:", rawPhrase);

  return (
    <>
      {/* Facebook Header */}
      <div className="bg-[#242526] text-white px-3 pt-7 pb-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-[#0866ff]">Facebook</span>
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

      <div className="h-[1px] bg-[#3a3b3c]"></div>

      {/* Post Content */}
      <div className="bg-[#242526] text-white px-3">
        <div className="py-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#3a3b3c] rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 overflow-hidden">
                {appLogo ? (
                  <img
                    src={appLogo}
                    alt={appName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Logo"
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-[10px] font-semibold">
                    {appName || "MyApp"}
                  </p>
                </div>
                <p className="text-[8px] text-gray-400">Sponsored · </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MoreHorizontal size={16} className="text-gray-400" />
              <X size={16} className="text-gray-400" />
            </div>
          </div>

          <p className="text-xs mb-2">{rawPhrase}</p>

          {/* Post Image */}
          <div className="rounded-lg overflow-hidden bg-[#242526]">
            {mainAdUrl ? (
              <img
                src={mainAdUrl}
                alt="Carousel Ad"
                className="w-full h-[225px] object-contain"
              />
            ) : (
              <p className="text-center text-gray-400 py-8">
                No animation URL available
              </p>
            )}
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

      <div className="h-[1px] bg-[#3a3b3c]"></div>

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
  ads: PropTypes.array.isRequired,
  appName: PropTypes.string,
  appLogo: PropTypes.string
};