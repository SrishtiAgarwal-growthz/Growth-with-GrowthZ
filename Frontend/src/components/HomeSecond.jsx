import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GrowthCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const letters = [
    { short: "G", expanded: "Genius" },
    { short: "R", expanded: "Rainbow" },
    { short: "O", expanded: "Opus" },
    { short: "W", expanded: "Wildcard" },
    { short: "T", expanded: "Thrive" },
    { short: "H", expanded: "Hawkeye" },
  ];

  const dummyText = [
    "Lorem ipsum dolor sit amet consectetur. Ut pharetra pellentesque sed justo metus amet congue. Auctor ac mauris sed donec. Eget purus sed viverra feugiat mollis nec. Convallis enim et pellentesque quis leo aliquam.",
    "Second slide content about the rainbow of possibilities...",
    "Third slide content about opportunities...",
    "Fourth slide content about wildcards...",
    "Fifth slide content about thriving ideas...",
    "Sixth slide content about hawk-eye precision...",
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % letters.length);
  };

  return (
    <div className="min-h-screen overflow-x-hidden  bg-black text-white p-4 sm:p-8 lg:p-32 relative">
  {/* Main heading */}
  <h1 className="text-[24px] sm:text-[36px] lg:text-5xl font-bold text-center mb-6 sm:mb-8">
    Lorem ipsum dolor sit amet consectetur.
  </h1>

  {/* Top Letters Section */}
  <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mb-0 lg:mb-4">
    {letters.map((letter, index) => (
      <motion.div
        key={letter.short}
        layout
        className="text-lg sm:text-[25px] lg:text-2xl"
      >
        <motion.span
          animate={{
            opacity: currentSlide === index ? 1 : 0.7,
          }}
          className={`cursor-pointer transition-all duration-300 ${
            currentSlide === index
              ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FA828C] to-[#4865F4]"
              : "text-white"
          }`}
        >
          {currentSlide === index ? letter.expanded : letter.short}
        </motion.span>
      </motion.div>
    ))}
  </div>

  {/* Content Section */}
  <div className="flex flex-col lg:flex-row gap-0 lg:gap-28 items-center w-full pt-8 sm:pt-12 relative">
    {/* Video Section */}
    <div className="relative w-full max-w-[600px] h-[280px] sm:h-[400px] lg:h-[400px] mx-auto pt-4 pb-4 sm:pt-8 sm:pb-8">
      {/* Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(1,100,248,0.15) 0%, rgba(2,43,104,0.15) 30%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Video Content */}
      <div className="relative w-full h-full bg-[#0A0F29] rounded-lg border border-[#1E293B] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full flex items-center justify-center text-xl text-gray-300"
          >
            Video Content {currentSlide + 1}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

    {/* Text Section */}
    <div className="w-full lg:w-1/3 text-center lg:text-left flex flex-col justify-center min-h-[250px] lg:min-h-[400px]">
      <div className="space-y-4">
        <h2 className="text-lg sm:text-[25px] text-gray-400">
          How Does IT Work?
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-gray-400 text-sm sm:text-base"
          >
            {dummyText[currentSlide]}
          </motion.p>
        </AnimatePresence>

        {/* CTA Button */}
        <div className="relative inline-flex items-center mt-4 sm:mt-6">
          <div className="bg-gradient-to-r from-[#FA828C] to-[#4865F4] p-[1px] sm:p-[2px] rounded-full">
            <button className="bg-black w-[135px] h-[46.5px] sm:w-auto sm:h-auto px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm lg:text-base 
               flex items-center gap-2 justify-center text-white hover:bg-gradient-to-r hover:from-[#FA828C] hover:to-[#4865F4] transition-all">
              TRY ME
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-[#FA828C] to-[#4865F4] flex items-center justify-center 
                    transition-colors duration-200 hover:bg-black group">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transform -rotate-45 transition-colors duration-200"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Next Button - Using absolute instead of fixed */}
  <button
    onClick={nextSlide}
    className="absolute bottom-6 right-12 lg:bottom-28 lg:right-16 w-7 sm:w-9 sm:h-9 h-7 lg:w-12 lg:h-12 rounded-full bg-transparent border border-blue-500 
              flex items-center justify-center text-blue-500 hover:text-white hover:bg-blue-500 transition-all"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>
  );
};

export default GrowthCarousel;