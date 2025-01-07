import { useState } from 'react';
import { 
  Battery, 
  Wifi, 
  Plus, 
  Search, 
  MessageCircle, 
  MoreHorizontal,
  Home,
  PlaySquare,
  Users,
  X
} from 'lucide-react';
import image from "../assets/creative.png"

const IPhoneMockup = () => {
  const [time] = useState('4:28');

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-100">
      <div className="relative w-64 h-[32rem] bg-black rounded-[2.5rem] border-8 border-[#1d1e20] shadow-xl overflow-hidden">
        {/* Notch Container */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-[#3a3b3c] z-50">
          {/* Actual Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-[#1d1e20] rounded-b-3xl" />
          
          {/* Status Bar Content */}
          <div className="relative h-full px-3 flex justify-between items-center text-white">
            <span className="text-[10px] font-semibold">{time}</span>
            <div className="flex items-center gap-1">
              <Wifi size={10} />
              <Battery size={12} />
            </div>
          </div>
        </div>
        
        {/* Screen */}
        <div className="relative h-full w-full bg-black overflow-hidden">
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
                {/* <div className="p-2">
               
                  <p className="text-sm font-semibold">Shaadi season must haves!</p>
                  <p className="text-xs text-gray-400">Free Shipping | Upto 70% off</p>
                  <button className="mt-1.5 px-3 py-1 bg-[#3a3b3c] rounded text-xs font-medium">Shop now</button>
                </div> */}
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
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

export default IPhoneMockup;