// FacebookMockup.jsx
import { Plus, Search, MessageCircle, MoreHorizontal, Home, PlaySquare, Users, X } from 'lucide-react';
import image from "../../../assets/creative.png";

const FacebookMockup = () => {
  return (
    <>
      {/* Facebook Header - pushed down to account for notch */}
      <div className="bg-[#3a3b3c] text-white px-3 pt-7 pb-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-[#0866ff]">facebook</span>
          <div className="flex items-center space-x-2">
            <button className="bg-[#3a3b3c] p-1.5 rounded-full">
              <Plus size={14} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-1.5 rounded-full">
              <Search size={14} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-1.5 rounded-full relative">
              <MessageCircle size={14} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] w-3 h-3 flex items-center justify-center rounded-full">4</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-[7px] bg-black"></div>
      {/* Post Content */}
      <div className="bg-[#3a3b3c] text-white px-3">
        <div className="py-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#3a3b3c] rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                <span>I</span>
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold">IndMoney</p>
                </div>
                <p className="text-[10px] text-gray-400">Sponsored · </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MoreHorizontal size={16} className="text-gray-400" />
              <X size={16} className="text-gray-400" />
            </div>
          </div>
          
          <p className="text-xs mb-2">Start your investment journey today.... <span className="text-blue-500">See More</span></p>
          
          {/* Post Image */}
          <div className="rounded-lg overflow-hidden bg-[#242526]">
            <img 
              src={image}
              alt="Food presentation"
              className="w-full h-[225px] object-contain"
            />
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

      <div className="h-[4px] bg-black"></div>
      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-[#242526] border-t border-[#3a3b3c] mb-[10px]">
        <div className="flex justify-between px-6 py-1">
          <button className="flex flex-col items-center text-[#0866ff]">
            <Home size={20} />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <PlaySquare size={20} />
            <span className="text-[10px] mt-0.5">Video</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Users size={20} />
            <span className="text-[10px] mt-0.5">Friends</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <img 
              src="/api/placeholder/20/20" 
              alt="Marketplace"
              className="w-5 h-5"
            />
            <span className="text-[10px] mt-0.5">Market</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FacebookMockup;