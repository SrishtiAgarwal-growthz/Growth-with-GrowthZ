import { useNavigate } from "react-router-dom";
import image1 from "../assets/GC.png";
import image2 from "../assets/GR.png";
import image3 from "../assets/GO.png";
import image4 from "../assets/GW.png";
import image5 from "../assets/GT.png";
import image6 from "../assets/GH.png";

const Hero = () => {
  const navigate = useNavigate();
  const images = [image1, image2, image3, image4, image5, image6];
  const growthStyle = {
    color: "#007bff",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  };

  return (
    <div className="relative w-full bg-black min-h-[510px] md:min-h-[680px] lg:min-h-screen overflow-hidden mt-[80px] lg:mt-[96px]">
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
        <div className="w-full max-w-[877px] mx-auto px-4 sm:px-6 pt-8 sm:pt-[36px] pb-2 sm:pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Powering the <span style={growthStyle}>&ldquo;Growth&rdquo;</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg lg:text-[20px] mt-3 sm:mt-4">
            Creative to Campaign to Scalable Conversions
          </p>

          <div className="flex justify-center mt-4 sm:mt-6">
            <div
              onClick={() => navigate("/login")}
              className="bg-[#015FF8] p-[2px] rounded-full w-[128px] md:w-[180px]"
            >
              <button className="bg-[#015FF8] w-full h-[44px] md:h-[62px] px-4 rounded-full text-[12px] md:text-xl flex items-center justify-between text-white">
                <span className="ml-3 font-bold pr-[2px]">TRY ME</span>
                <div className="w-8 md:w-12 h-8 md:h-12 rounded-full bg-black flex items-center justify-center transition-colors duration-200 hover:bg-black group">
                  <svg
                    className="w-6 md:w-8 h-6 md:h-8 text-white transform -rotate-45 transition-colors duration-200"
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
        <div className="w-full">
          <article className="flex w-[200%] animate-bannermove">
            {[0, 1].map((groupIndex) => (
              <div key={groupIndex} className="w-full flex">
                <ul className="flex list-none p-0 m-0">
                  {images.map((img, index) => (
                    <li
                      key={index}
                      className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[350px] lg:w-[550px] 
                               h-[250px] sm:h-[200px] md:h-[250px] lg:h-[400px] 
                               flex items-center justify-center px-2"
                    >
                      <div className="w-full h-full rounded-lg overflow-hidden relative">
                        <img
                          src={img}
                          alt={`Slide ${index + 1}`}
                          className="block w-full h-full object-contain"
                        />
                        {/* Card Glow Effect */}
                        <div className="absolute inset-0 rounded-lg ring-1 ring-blue-500/20" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        </div>
      </div>

      <style>
        {`
          @keyframes bannermove {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-bannermove {
            animation: bannermove 20s linear infinite;
          }
          
          @media (hover: hover) {
            .animate-bannermove:hover {
              animation-play-state: paused;
            }
          }
          
          @media (max-width: 640px) {
            .animate-bannermove {
              animation-duration: 15s;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Hero;
