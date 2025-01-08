import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import image1 from "../assets/HomePage/Hero1.png";
import image2 from "../assets/HomePage/Hero2.png";
import image3 from "../assets/HomePage/Hero3.png";
import image4 from "../assets/HomePage/Hero4.png";
import image5 from "../assets/HomePage/Hero5.png";
import image6 from "../assets/HomePage/Hero6.png";

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
    <div className="relative w-full bg-black min-h-screen overflow-hidden pt-[5.125rem] md:pt-[10rem]">
      {/* Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-black" />
          <div
            className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[37.5rem]"
            style={{
              background:
                "radial-gradient(circle at center, rgba(1,100,248,0.5) 0%, rgba(2,43,104,0.5) 50%, transparent 80%)",
              filter: "blur(5rem)",
            }}
          />
        </div>
      </div>

      {/* Combined Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Hero Content */}
        <div className="w-full max-w-[54.8125rem] mx-auto px-4 sm:px-6 pt-6 sm:pt-9 pb-2 sm:pb-8 text-center">
          <h1 className="text-[1.875rem] sm:text-[2.25rem] md:text-[3.125rem] lg:text-[3.75rem] font-bold text-white">
            Powering the <span style={growthStyle}>&ldquo;Growth&rdquo;</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg lg:text-xl mt-3 sm:mt-1">
            Campaign &mdash;{">"} Scalable &mdash;{">"} Conversions
          </p>

          <div className="flex justify-center mt-[1rem] sm:mt-[1.5rem]">
            <div
              onClick={() => navigate("/login")}
              className="bg-[#015FF8] p-[0.125rem] rounded-full w-[8rem] md:w-[11.25rem] hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <button className="bg-[#015FF8] w-full h-[2.75rem] md:h-[3.875rem] px-[1rem] rounded-full text-[0.75rem] md:text-[1.25rem] flex items-center justify-between text-white">
                <span className="ml-[0.75rem] font-bold">TRY ME</span>
                <div className="w-[2rem] md:w-[3rem] h-[2rem] md:h-[3rem] rounded-full bg-black flex items-center justify-center">
                  <svg
                    className="w-[1.5rem] md:w-[2rem] h-[1.5rem] md:h-[2rem] text-white transform -rotate-45"
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
                    <div className="absolute inset-0 rounded-lg" />
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
                    <div className="absolute inset-0 rounded-lg" />
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
            margin-top: ${isMobile ? '1.5rem' : '0'};
            padding: 0 1rem;
            -webkit-overflow-scrolling: touch;
          }

          .carousel-track {
            display: flex;
            width: max-content;
            animation: smoothScroll 30s linear infinite;
            will-change: transform;
            gap: 1rem;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
          }

          .carousel-item {
            flex: 0 0 auto;
            width: clamp(280px, calc(100vw - 2rem), 400px);
            max-width: ${isMobile ? '17.5rem' : '25rem'};
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          .carousel-image-container {
            width: 100%;
            height: ${isMobile ? '17.5rem' : '25rem'};
            position: relative;
            border-radius: 0.5rem;
            overflow: hidden;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          .carousel-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimizeQuality;
          }

          @media screen and (min-width: 640px) {
            .carousel-container {
              padding: 0 2rem;
            }
            
            .carousel-track {
              gap: 1.5rem;
            }
          }

          @media screen and (min-width: 1024px) {
            .carousel-container {
              padding: 0 3rem;
            }
            
            .carousel-item {
              width: clamp(320px, calc((100vw - 8rem) / 3), 400px);
            }
          }

          @media screen and (min-width: 1280px) {
            .carousel-item {
              width: clamp(320px, calc((100vw - 10rem) / 4), 400px);
            }
          }

          @-webkit-keyframes smoothScroll {
            0% {
              -webkit-transform: translate3d(0, 0, 0);
              transform: translate3d(0, 0, 0);
            }
            100% {
              -webkit-transform: translate3d(-50%, 0, 0);
              transform: translate3d(-50%, 0, 0);
            }
          }

          @keyframes smoothScroll {
            0% {
              -webkit-transform: translate3d(0, 0, 0);
              transform: translate3d(0, 0, 0);
            }
            100% {
              -webkit-transform: translate3d(-50%, 0, 0);
              transform: translate3d(-50%, 0, 0);
            }
          }

          .carousel-track:hover {
            -webkit-animation-play-state: paused;
            animation-play-state: paused;
          }

          .carousel-track::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 6.25rem;
            background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,1));
            pointer-events: none;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          .carousel-container, 
          .carousel-track, 
          .carousel-item, 
          .carousel-image-container {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          @supports (-webkit-overflow-scrolling: touch) {
            .carousel-track {
              -webkit-overflow-scrolling: touch;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Hero;