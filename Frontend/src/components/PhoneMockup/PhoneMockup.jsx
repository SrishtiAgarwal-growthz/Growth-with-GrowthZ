import { useState } from "react";
import { Battery, Wifi } from "lucide-react";
import PropTypes from "prop-types";
import leftbtn from "../../assets/PhoneMockup/leftbtn.png";
import rightbtn from "../../assets/PhoneMockup/rightbtn.png";
import bg from "../../assets/PhoneMockup/background.png"

const PhoneMockup = ({ children }) => {
  const [time] = useState("4:28");

  return (
    <div className="relative flex flex-col items-center justify-center h-[34rem] mt-6">
      <div className="absolute inset-6 z-0">
        <img
          src={bg}
          alt="Background Grid"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Phone Mockup Container */}
      <div
        className="relative"
        style={{ fontSize: "clamp(0.5rem, 2vw, 1rem)" }}
      >
        {/* Left Button */}
        <img
          src={leftbtn}
          alt="Previous"
          className="absolute left-[-1.875em] top-1/2 transform -translate-y-1/2 -translate-x-full w-8 h-8 cursor-pointer"
        />

        {/* Phone Mockup */}
        <div
          className="relative bg-black rounded-[2.5em] border-[0.5em] border-[#1d1e20] shadow-xl overflow-hidden"
          style={{
            width: "16em",
            height: "31.875em",
          }}
        >
          {/* Notch Container */}
          <div className="absolute top-0 left-0 right-0 h-[1.75em] bg-[#3a3b3c] z-50">
            {/* Actual Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[9em] h-[1.5em] bg-[#1d1e20] rounded-b-3xl" />

            {/* Status Bar Content */}
            <div className="relative h-full px-[0.75em] flex justify-between items-center text-white">
              <span className="text-[0.625em] font-semibold">{time}</span>
              <div className="flex items-center gap-[0.25em]">
                <Wifi size="1em" />
                <Battery size="1.2em" />
              </div>
            </div>
          </div>

          {/* Screen */}
          <div className="relative h-full w-full bg-black overflow-hidden">
            {children}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-[0.25em] left-1/2 transform -translate-x-1/2 w-[5em] h-[0.125em] bg-gray-300 rounded-full" />
        </div>

        {/* Right Button */}
        <img
          src={rightbtn}
          alt="Next"
          className="absolute right-[-1.875em] top-1/2 transform -translate-y-1/2 translate-x-full w-8 h-8 cursor-pointer"
        />
      </div>

      {/* Accept/Reject Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          className="w-24 md:w-36 h-10 md:h-12 bg-neutral-800 rounded-lg text-red-500 font-semibold text-sm md:text-base hover:bg-neutral-700 transition-colors"
          onClick={() => console.log("Rejected")}
        >
          Reject
        </button>
        <button
          className="w-24 md:w-36 h-10 md:h-12 bg-neutral-800 rounded-lg text-green-500 font-semibold text-sm md:text-base hover:bg-neutral-700 transition-colors"
          onClick={() => console.log("Approved")}
        >
          Approve
        </button>
      </div>
    </div>
  );
};

PhoneMockup.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PhoneMockup;
