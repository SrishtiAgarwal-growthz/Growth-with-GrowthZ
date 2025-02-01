
import PropTypes from 'prop-types';
import { Home, Users, Bell, Briefcase, Search, MessageSquare, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';

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

export default function LinkedInFeedCarousel({
  currentIndex,
  ads,
  appName,
  appLogo,
  websiteLink,
}) {
  if (!ads?.length) {
    return (
      <p className="text-gray-500 text-center">No feed carousel ads found.</p>
    );
  }

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd?.creativeUrl?.adUrl;
  const rawPhrase = currentAd?.creativeUrl?.phrase || "";

  return (
    <>
      {/* LinkedIn Header */}
      <div className="bg-white px-3 pt-7 pb-1.5">
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center flex-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 mr-2">
              {appLogo ? (
                <img
                  src={appLogo}
                  alt={appName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                  Logo
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                <Search size={12} className="text-gray-500 mr-2" />
                <span className="text-gray-500 text-xs">Search</span>
              </div>
            </div>
            <MessageSquare size={16} className="text-gray-500 ml-2" />
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white">
        <div className="px-3 py-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-gray-200 rounded overflow-hidden mr-2">
                <img
                  src={appLogo || "https://placeholder.com/48"}
                  alt={appName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{getShortAppName(appName)}</p>
                <p className="text-xs text-gray-500">Promoted</p>
              </div>
            </div>
            <MoreHorizontal size={10} className="text-gray-500" />
          </div>

          <p className="text-xs">{rawPhrase}</p>

          {/* Post Image/Content */}
          <div className="rounded-lg overflow-hidden bg-white mb-2">
            {mainAdUrl ? (
              <img
                src={mainAdUrl}
                alt="Ad Content"
                className="w-full h-[225px] object-contain"
              />
            ) : (
              <div className="w-full h-[225px] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}
          </div>
          <div
            className="bg-white  flex justify-between items-center text-xs"
            style={{ margin: 0, padding: 0 }}
          >
            <div className="pl-2">
              <p className="text-gray-400 text-[8px]">{websiteLink}</p>
              <p className="font-semibold text-[10px]">{getShortAppName(appName)}</p>
            </div>
            <button
              onClick={() =>
                window.open(websiteLink, "_blank")
              }
              className="bg-white px-3 py-1 rounded text-[10px]"
            >
              Install Now
            </button>
          </div>

          {/* Action Stats */}
          {/* <div className="flex items-center text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <span className="mr-1">4,181</span>
              <span>reactions</span>
            </div>
            <span className="mx-1">•</span>
            <div>50 comments</div>
            <span className="mx-1">•</span>
            <div>34 reposts</div>
          </div> */}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-1 flex justify-between">
            <button className="flex items-center space-x-1 text-gray-500">
              <ThumbsUp size={14} />
              <span className="text-[10px]">Like</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500">
              <MessageCircle size={14} />
              <span className="text-[10px]">Comment</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500">
              <Share2 size={14} />
              <span className="text-[10px]">Repost</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500">
              <Send size={14} />
              <span className="text-[10px]">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200">
        <div className="flex justify-between px-6 py-2">
          <button className="flex flex-col items-center text-gray-500">
            <Home size={16} />
            <span className="text-[8px] mt-0.5">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-500">
            <Users size={16} />
            <span className="text-[8px] mt-0.5">My Network</span>
          </button>
          <button className="flex flex-col items-center text-gray-500">
            <Bell size={16} />
            <span className="text-[8px] mt-0.5">Notifications</span>
          </button>
          <button className="flex flex-col items-center text-gray-500">
            <Briefcase size={16} />
            <span className="text-[8px] mt-0.5">Jobs</span>
          </button>
        </div>
      </div>
    </>
  );
}

LinkedInFeedCarousel.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  ads: PropTypes.array.isRequired,
  appName: PropTypes.string,
  appLogo: PropTypes.string,
  websiteLink: PropTypes.string
};
