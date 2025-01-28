import PropTypes from "prop-types";
import {
  Plus,
  Search,
  MessageCircle,
  MoreHorizontal,
  Home,
  PlaySquare,
  Users,
  X,
} from "lucide-react";

export default function FacebookFeedCarousel({
  currentIndex,
  ads,
  appName,
  appLogo,
  websiteLink,
}) {
  console.log("FbFeedCarousel - currentIndex:", currentIndex);
  console.log("FbFeedCarousel - ads:", ads);
  console.log("FbFeedCarousel - appName:", appName);
  console.log("FbFeedCarousel - appLogo:", appLogo);
  console.log("FbFeedCarousel - website:", websiteLink);

  if (!ads?.length) {
    console.log("FbFeedCarousel - No ads found.");
    return (
      <p className="text-gray-500 text-center">No feed carousel ads found.</p>
    );
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
          <span className="text-l font-bold text-white">facebook</span>
          <div className="flex items-center space-x-2">
            <button className="bg-[#3a3b3c] p-1.5 rounded-full">
              <Plus size={10} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-1.5 rounded-full">
              <Search size={10} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-1.5 rounded-full relative">
              <MessageCircle size={10} className="text-white" />
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
        <div className="py-0">
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
          <div
            className="bg-[#18191a] p-0.5 flex justify-between items-center text-xs"
            style={{ margin: 0, padding: 0 }}
          >
            <div className="pl-2">
              <p className="text-gray-400 text-[8px]">{websiteLink}</p>
              <p className="font-semibold text-[10px]">{appName}</p>
            </div>
            <button
              onClick={() =>
                window.open(websiteLink, "_blank")
              }
              className="bg-[#3a3b3c] px-3 py-1 rounded text-[10px]"
            >
              Install now
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-1 flex justify-between border-t border-[#242526] pt-0">
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

      <div className="h-[1px] bg-[#242526]"></div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-[#242526] border-t border-[#3a3b3c] mb-[10px]">
        <div className="flex justify-between px-6 py-1">
          <button className="flex flex-col items-center text-[#0866ff]">
            <Home size={10} />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <PlaySquare size={10} />
            <span className="text-[10px] mt-0.5">Video</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Users size={10} />
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
  appLogo: PropTypes.string,
  websiteLink: PropTypes.string
};
