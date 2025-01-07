import { useState } from 'react';
import { Battery, Wifi } from 'lucide-react';
import PropTypes from 'prop-types';

const IPhoneMockup = ({ children }) => {
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
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

IPhoneMockup.propTypes = {
  children: PropTypes.node.isRequired
};

export default IPhoneMockup;