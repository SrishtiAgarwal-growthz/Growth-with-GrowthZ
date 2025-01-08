import { Plus, Search, MessageCircle, MoreHorizontal, Home, PlaySquare, Users, X } from 'lucide-react';
import image from "../../../assets/creative.png";

const FacebookMockup = () => {
  return (
    <>
      {/* Facebook Header - pushed down to account for notch */}
      <div className="bg-[#3a3b3c] text-white px-[0.75rem] pt-[1.75rem] pb-[0.375rem]">
        <div className="flex justify-between items-center">
          <span className="text-[1.25rem] font-bold text-[#0866ff]">facebook</span>
          <div className="flex items-center space-x-[0.5rem]">
            <button className="bg-[#3a3b3c] p-[0.375rem] rounded-full">
              <Plus size={14} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-[0.375rem] rounded-full">
              <Search size={14} className="text-white" />
            </button>
            <button className="bg-[#3a3b3c] p-[0.375rem] rounded-full relative">
              <MessageCircle size={14} className="text-white" />
              <span className="absolute -top-[0.25rem] -right-[0.25rem] bg-red-500 text-[0.5rem] w-[0.75rem] h-[0.75rem] flex items-center justify-center rounded-full">4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[0.4375rem] bg-black"></div>

      {/* Post Content */}
      <div className="bg-[#3a3b3c] text-white px-[0.75rem]">
        <div className="py-[0.5rem]">
          <div className="flex items-center justify-between mb-[0.375rem]">
            <div className="flex items-center">
              <div className="w-[2rem] h-[2rem] bg-[#3a3b3c] rounded-full flex items-center justify-center text-white text-[0.875rem] font-bold mr-[0.5rem]">
                <span>I</span>
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-[0.875rem] font-semibold">IndMoney</p>
                </div>
                <p className="text-[0.625rem] text-gray-400">Sponsored · </p>
              </div>
            </div>
            <div className="flex items-center space-x-[0.5rem]">
              <MoreHorizontal size={16} className="text-gray-400" />
              <X size={16} className="text-gray-400" />
            </div>
          </div>
          
          <p className="text-[0.75rem] mb-[0.5rem]">Start your investment journey today.... <span className="text-blue-500">See More</span></p>
          
          {/* Post Image */}
          <div className="rounded-lg overflow-hidden bg-[#242526]">
            <img 
              src={image}
              alt="Food presentation"
              className="w-full h-[14.0625rem] object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-[0.5rem] flex justify-between border-t border-[#3a3b3c] pt-[0.5rem]">
            <button className="flex items-center space-x-[0.25rem] text-gray-400">
              <span>👍</span>
              <span className="text-[0.75rem]">Like</span>
            </button>
            <button className="flex items-center space-x-[0.25rem] text-gray-400">
              <span>💬</span>
              <span className="text-[0.75rem]">Comment</span>
            </button>
            <button className="flex items-center space-x-[0.25rem] text-gray-400">
              <span>↗</span>
              <span className="text-[0.75rem]">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[0.25rem] bg-black"></div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-[#242526] border-t border-[#3a3b3c] mb-[0.625rem]">
        <div className="flex justify-between px-[1.5rem] py-[0.25rem]">
          <button className="flex flex-col items-center text-[#0866ff]">
            <Home size={20} />
            <span className="text-[0.625rem] mt-[0.125rem]">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <PlaySquare size={20} />
            <span className="text-[0.625rem] mt-[0.125rem]">Video</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Users size={20} />
            <span className="text-[0.625rem] mt-[0.125rem]">Friends</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <img 
              src="/api/placeholder/20/20" 
              alt="Marketplace"
              className="w-[1.25rem] h-[1.25rem]"
            />
            <span className="text-[0.625rem] mt-[0.125rem]">Market</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FacebookMockup;