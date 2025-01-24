import { useState, useCallback } from "react";
import { Battery, Wifi } from "lucide-react";
import PropTypes from "prop-types";
import leftbtn from "../../assets/PhoneMockup/leftbtn.png";
import rightbtn from "../../assets/PhoneMockup/rightbtn.png";
import bg from "../../assets/PhoneMockup/background.png";

const PhoneMockup = ({ 
  children,
  handleNext,
  handlePrev,
  onAccept,
  onReject,
  adStatus // Changed from isApproved to adStatus
}) => {
  const [time] = useState("4:28");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const onNextClick = useCallback(() => {
    console.log('Next button clicked');
    if (handleNext) {
      handleNext();
    }
  }, [handleNext]);
  
  const onPrevClick = useCallback(() => {
    console.log('Previous button clicked');
    if (handlePrev) {
      handlePrev();
    }
  }, [handlePrev]);

  const onAcceptClick = useCallback(async (e) => {
    if (isAccepting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsAccepting(true);
    try {
      await onAccept(e);
    } finally {
      setIsAccepting(false);
    }
  }, [onAccept, isAccepting]);

  const onRejectClick = useCallback(async (e) => {
    if (isRejecting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Reject button clicked');
    setIsRejecting(true);
    try {
      await onReject(e);
    } finally {
      setIsRejecting(false);
    }
  }, [onReject, isRejecting]);

  const renderActionButtons = () => {
    switch (adStatus) {
      case 'approved':
        return (
          <div className="w-48 md:w-36">
            <button className="w-full h-10 md:h-12 bg-green-500 rounded-lg text-white font-semibold text-sm md:text-base cursor-default">
              Approved
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-48 md:w-36">
            <button className="w-full h-10 md:h-12 bg-red-500 rounded-lg text-white font-semibold text-sm md:text-base cursor-default">
              Rejected
            </button>
          </div>
        );
      default:
        return (
          <>
            <button
              className="w-24 md:w-36 h-10 md:h-12 bg-neutral-800 rounded-lg text-red-500 font-semibold text-sm md:text-base hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onRejectClick}
              disabled={isRejecting}
            >
              Reject
            </button>
            <button
              type="button"
              className="w-24 md:w-36 h-10 md:h-12 bg-neutral-800 rounded-lg text-green-500 font-semibold text-sm md:text-base hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAcceptClick}
              disabled={isAccepting}
            >
              Approve
            </button>
          </>
        );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-[34rem] mt-6">
      {/* Background */}
      <div className="absolute inset-6 z-0">
        <img
          src={bg}
          alt="Background Grid"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Phone Container */}
      <div
        className="relative"
        style={{ fontSize: "clamp(0.5rem, 2vw, 1rem)" }}
      >
        {/* Navigation Buttons */}
        <button
          aria-label="Previous advertisement"
          className="absolute left-[-1.875em] top-1/2 transform -translate-y-1/2 -translate-x-full w-8 h-8 cursor-pointer"
          onClick={onPrevClick}
        >
          <img src={leftbtn} alt="" className="w-full h-full" />
        </button>

        {/* Phone Frame */}
        <div
          className="relative bg-black rounded-[2.5em] border-[0.5em] border-[#1d1e20] shadow-xl overflow-hidden"
          style={{
            width: "16em",
            height: "31.875em",
          }}
        >
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-[1.75em] bg-[#3a3b3c] z-50">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[9em] h-[1.5em] bg-[#1d1e20] rounded-b-3xl" />
            <div className="relative h-full px-[0.75em] flex justify-between items-center text-white">
              <span className="text-[0.625em] font-semibold">{time}</span>
              <div className="flex items-center gap-[0.25em]">
                <Wifi size="1em" />
                <Battery size="1.2em" />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative h-full w-full bg-[#242526] overflow-hidden">
            {children}
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-[0.25em] left-1/2 transform -translate-x-1/2 w-[5em] h-[0.125em] bg-gray-300 rounded-full" />
        </div>

        {/* Next Button */}
        <button
          aria-label="Next advertisement"
          className="absolute right-[-1.875em] top-1/2 transform -translate-y-1/2 translate-x-full w-8 h-8 cursor-pointer"
          onClick={onNextClick}
        >
          <img src={rightbtn} alt="" className="w-full h-full" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        {renderActionButtons()}
      </div>
    </div>
  );
};

PhoneMockup.propTypes = {
  children: PropTypes.node,
  handleNext: PropTypes.func,
  handlePrev: PropTypes.func,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  adStatus: PropTypes.bool
};

PhoneMockup.defaultProps = {
  isApproved: false
};

export default PhoneMockup;
