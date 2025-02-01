// import React from 'react';
import PropTypes from 'prop-types';
import {
  Home,
  Search,
  Mail,
  Users2,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  // Bookmark,
  // Share,
  // MoreHorizontal,
} from 'lucide-react';

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

export default function TwitterFeedCarousel({
  currentIndex,
  ads,
  appName,
  appLogo,
  // websiteLink,
}) {
  if (!ads?.length) {
    return (
      <p className="text-gray-500 text-center">No feed carousel ads found.</p>
    );
  }

  const currentAd = ads[currentIndex] || {};
  const mainAdUrl = currentAd?.creativeUrl?.adUrl;
  const rawPhrase = currentAd?.creativeUrl?.phrase || "";

  // Format numbers with K/M suffix
  const formatNumber = (num) => {
    if (num >= 1000000) return (num/1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num/1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <>
      {/* Twitter Header */}
      <div className="bg-black text-white px-3 pt-7 mt-2">
        <div className="flex items-center justify-between">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <img
              src={appLogo || "/api/placeholder/32/32"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <img
            src="/api/placeholder/24/24"
            alt="X Logo"
            className="w-6 h-6"
          />
          <div className="flex items-center space-x-4">
            <button className="px-4 py-1.5 bg-transparent border border-gray-600 rounded-full text-[10px] font-semibold">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 bg-black">
        <div className="flex-1 text-center py-2 border-b-2 border-blue-500">
          <span className="text-xs font-semibold text-white">For you</span>
        </div>
        <div className="flex-1 text-center py-2">
          <span className="text-xs font-semibold text-gray-500">Following</span>
        </div>
      </div>

      {/* Tweet Content */}
      <div className="bg-black text-white overflow-y-auto">
        <div className="p-3 border-b border-gray-800">
          <div className="flex">
            <div className="w-6 h-6 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <img
                src={appLogo || "/api/placeholder/40/40"}
                alt={appName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-wrap">
                  <span className="font-bold mr-1 text-[11px]">{getShortAppName(appName)}</span>
                  <span className="text-gray-500 text-xs">@{getShortAppName(appName)}</span>
                  {/* <span className="text-gray-500 mx-1">·</span> */}
                  <span className="text-xs mx-1 px-1 rounded bg-gray-800 text-gray-400">Ad</span>
                </div>

              </div>
              
              <p className="mt-2 text-[10px] break-words">{rawPhrase}</p>
              
              {mainAdUrl && (
                <div className="mt-2 rounded-xl overflow-hidden">
                  <img
                    src={mainAdUrl}
                    alt="Ad content"
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="flex justify-between mt-3 text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageCircle size={10} />
                  <span className="text-[10px]">{formatNumber(16700)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Repeat2 size={10} />
                  <span className="text-[10px]">{formatNumber(42300)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart size={10} />
                  <span className="text-[10px]">{formatNumber(401000)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart2 size={10} />
                  <span className="text-[10px]">{formatNumber(54400000)}</span>
                </div>
                {/* <div className="flex items-center space-x-1">
                  <Bookmark size={14} />
                </div>
                <div className="flex items-center space-x-1">
                  <Share size={14} />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-black border-t border-gray-800">
        <div className="flex justify-between px-6 py-2">
          <button className="flex flex-col items-center">
            <Home size={16} className="text-gray-400" />
          </button>
          <button className="flex flex-col items-center">
            <Search size={16} className="text-gray-400" />
          </button>
          <button className="flex flex-col items-center">
            <Users2 size={16} className="text-gray-400" />
          </button>
          <button className="flex flex-col items-center">
            <Mail size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    </>
  );
}

TwitterFeedCarousel.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  ads: PropTypes.array.isRequired,
  appName: PropTypes.string,
  appLogo: PropTypes.string,
  websiteLink: PropTypes.string
};