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
    <div className="min-h-screen lg:h-[800px] bg-black text-white p-6 sm:p-12 lg:p-32 relative">
      {/* Main heading */}
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-center mb-8">
        Lorem ipsum dolor sit amet consectetur.
      </h1>

      {/* Top Letters Section */}
      <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mb-8">
        {letters.map((letter, index) => (
          <motion.div
            key={letter.short}
            layout
            className="text-lg sm:text-xl lg:text-2xl"
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

      <div className="flex flex-col lg:flex-row gap-20 items-center w-full pt-12">
        {/* Video Section with Extended Gradient */}
        <div className="relative w-full lg:w-[600px] aspect-video">
          {/* Extended Gradient Container */}
          <div className="absolute -inset-32 pointer-events-none">
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%]"
              style={{
                background: 'radial-gradient(circle at center, rgba(1,100,248,0.15) 0%, rgba(2,43,104,0.15) 30%, transparent 60%)',
                filter: 'blur(80px)'
              }}
            />
          </div>
          
          {/* Border Glow Effect */}
          <div className="absolute inset-0 rounded-lg"
               style={{
                 boxShadow: '0 0 96px -8px rgba(1,100,248,0.3)',
               }} 
          />
          
          {/* Video Content Container */}
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
        <div className="w-full lg:w-1/3 text-center lg:text-left relative flex flex-col justify-center h-full">
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl text-gray-400">
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

            <div className="relative inline-flex items-center mt-6">
              <div className="bg-gradient-to-r from-[#FA828C] to-[#4865F4] p-[2px] rounded-full">
                <button className="bg-black w-full h-full px-6 py-3 rounded-full text-sm sm:text-base flex items-center gap-2 text-white hover:bg-gradient-to-r hover:from-[#FA828C] hover:to-[#4865F4] transition-all">
                  TRY ME
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FA828C] to-[#4865F4] flex items-center justify-center transition-colors duration-200 hover:bg-black group">
                    <svg
                      className="w-4 h-4 text-white transform rotate-45 transition-colors duration-200"
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

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 -right-20 w-12 h-12 rounded-full bg-transparent border border-blue-500 
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
      </div>
    </div>
  );
};

export default GrowthCarousel;