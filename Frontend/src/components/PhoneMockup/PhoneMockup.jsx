import { useState } from 'react';
import { Battery, Wifi } from 'lucide-react';
import PropTypes from 'prop-types';
import leftbtn from "../../assets/PhoneMockup/leftbtn.png";
import rightbtn from "../../assets/PhoneMockup/rightbtn.png";

const PhoneMockup = ({ children }) => {
  const [time] = useState('4:28');

  return (
    <div className="flex flex-col items-center justify-center h-[34rem] mt-12">
      {/* Phone Mockup Container */}
      <div className="relative">
        {/* Left Button */}
        <img
          src={leftbtn}
          alt="Previous"
          className="absolute left-[-30px] top-1/2 transform -translate-y-1/2 -translate-x-full w-8 h-8 cursor-pointer"
        />

        {/* Phone Mockup */}
        <div className="relative w-[256px] h-[510px] bg-black rounded-[2.5rem] border-8 border-[#1d1e20] shadow-xl overflow-hidden">
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
            {children}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Right Button */}
        <img
          src={rightbtn}
          alt="Next"
          className="absolute right-[-30px] top-1/2 transform -translate-y-1/2 translate-x-full w-8 h-8 cursor-pointer"
        />
      </div>
    </div>
  );
};

PhoneMockup.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PhoneMockup;