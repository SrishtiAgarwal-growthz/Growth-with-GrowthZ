import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import image from '../assets/image.png';

const Hero = () => {
  const navigate = useNavigate();
  const images = [image, image, image, image];

  return (
    <div className="relative w-full bg-black min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-black" />
          <div 
            className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
            style={{
              background: 'radial-gradient(circle at center, rgba(1,100,248,0.5) 0%, rgba(2,43,104,0.5) 50%, transparent 80%)',
              filter: 'blur(40px)'
            }}
          />
        </div>
      </div>

      {/* Combined Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Hero Content */}
        <div className="w-full max-w-[877px] mx-auto px-4 sm:px-6 pt-16 sm:pt-16 pb-8 sm:pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Powering the GROWTH
          </h1>
          
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl mt-3 sm:mt-4">
            Creative to Campaign to Scalable Conversions
          </p>
          
          <div className="flex justify-center mt-4 sm:mt-6">
            <button 
              onClick={() => navigate('/login')} 
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full 
                       bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-white
                       text-sm sm:text-base hover:opacity-90 transition-opacity"
            >
              TRY ME
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <p className="mt-4 sm:mt-6 text-white font-mulish text-sm sm:text-base leading-relaxed">
            Craft Ad Copies That Resonate, Inspire, and Convert
            <br />
            With Genius
          </p>
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
                      className="flex-shrink-0 w-[280px] sm:w-[350px] md:w-[400px] lg:w-[470px] 
                               h-[200px] sm:h-[250px] md:h-[275px] lg:h-[300px] 
                               flex items-center justify-center px-2"
                    >
                      <div className="w-full h-full rounded-lg overflow-hidden relative">
                        <img 
                          src={img}
                          alt={`Slide ${index + 1}`}
                          className="block w-full h-full object-cover"
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