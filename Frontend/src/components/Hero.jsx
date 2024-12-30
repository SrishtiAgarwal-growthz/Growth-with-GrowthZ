import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.png";

const Hero = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  const images = [image1, image2, image3, image4, image5, image6];

  const growthStyle = {
    color: "#007bff",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full bg-black min-h-[510px]  md:min-h-[680px] lg:min-h-screen overflow-hidden mt-[80px] lg:mt-[96px]">
      {/* Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-black" />
          <div
            className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
            style={{
              background:
                "radial-gradient(circle at center, rgba(1,100,248,0.5) 0%, rgba(2,43,104,0.5) 50%, transparent 80%)",
              filter: "blur(80px)",
            }}
          />
        </div>
      </div>

      {/* Combined Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Hero Content */}
        <div className="w-full max-w-[877px] mx-auto px-4 sm:px-6 pt-8 sm:pt-[36px] pb-2 sm:pb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Powering the <span style={growthStyle}>&ldquo;Growth&rdquo;</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg lg:text-[20px] mt-3 sm:mt-4">
            Campaign &mdash;{">"} Scalable &mdash;{">"} Conversions
          </p>

          <div className="flex justify-center mt-4 sm:mt-6">
            <div
              onClick={() => navigate("/login")}
              className="bg-[#015FF8] p-[2px] rounded-full w-[128px] md:w-[180px] hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <button className="bg-[#015FF8] w-full h-[44px] md:h-[62px] px-4 rounded-full text-[12px] md:text-xl flex items-center justify-between text-white">
                <span className="ml-3 font-bold">TRY ME</span>
                <div className="w-8 md:w-12 h-8 md:h-12 rounded-full bg-black flex items-center justify-center">
                  <svg
                    className="w-6 md:w-8 h-6 md:h-8 text-white transform -rotate-45"
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

        {/* Carousel Container */}
        <div className="w-full overflow-hidden">
          <div className="carousel-container">
            <div className="carousel-track">
              {/* First set of images */}
              {images.map((img, index) => (
                <div key={`first-${index}`} className="carousel-item">
                  <div className="carousel-image-container">
                    <img
                      src={img}
                      alt={`Slide ${index + 1}`}
                      className="carousel-image"
                    />
                    <div className="absolute inset-0 rounded-lg ring-1 ring-blue-500/20" />
                  </div>
                </div>
              ))}
              {/* Duplicate set for smooth infinite scroll */}
              {images.map((img, index) => (
                <div key={`second-${index}`} className="carousel-item">
                  <div className="carousel-image-container">
                    <img
                      src={img}
                      alt={`Slide ${index + 1}`}
                      className="carousel-image"
                    />
                    <div className="absolute inset-0 rounded-lg ring-1 ring-blue-500/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .carousel-container {
            width: 100%;
            overflow: hidden;
            position: relative;
          }

          .carousel-track {
            display: flex;
            width: max-content;
            animation: smoothScroll 30s linear infinite;
          }

          .carousel-item {
            flex-shrink: 0;
            padding: 0;
            margin-right: ${isMobile ? '16px' : '0'};
            margin-top: ${isMobile ? '16px' : '0'};
            width: ${isMobile ? '280px' : '400px'};
          }

          .carousel-image-container {
            width: 100%;
            height: ${isMobile ? '280px' : '400px'};
            position: relative;
            border-radius: 0.5rem;
            overflow: hidden;
          }

          .carousel-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          @keyframes smoothScroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .carousel-track:hover {
            animation-play-state: paused;
          }

          /* Add smooth transition when animation restarts */
          .carousel-track::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 100px;
            background: linear-gradient(to right, transparent, black);
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
};

export default Hero;