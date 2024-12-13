import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import image from '../assets/image.png';

const Hero = () => {
  const navigate = useNavigate();
  const images = [
    image,
    image,
    image,
    image
  ];

  return (
    <div className="w-full bg-black">
      <div className="max-w-[877px] mx-auto pt-10 text-center flex flex-col items-center h-[300px]">
        <h1 className="text-6xl font-bold text-white">
          Powering the GROWTH
        </h1>
        <p className="text-gray-300 text-xl mt-4">
          Creative to Campaign to Scalable Conversions
        </p>
        
        <button 
          onClick={() => navigate('/login')} 
          className="mt-6 flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-white"
        >
          TRY ME
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="mt-6 text-white font-mulish text-base leading-[19.2px] w-[384px]">
          Craft Ad Copies That Resonate, Inspire, and Convert
          <br />
          With Genius
        </p>
      </div>

      <section className="w-full overflow-hidden">
        <article className="flex w-[200%] animate-bannermove">
          {[0, 1].map((groupIndex) => (
            <div key={groupIndex} className="w-full flex">
              <ul className="flex list-none p-0 m-0">
                {images.map((img, index) => (
                  <li 
                    key={index} 
                    className="flex-shrink-0 w-[470px] h-[300px] flex items-center justify-center"
                  >
                    <img 
                      src={img}
                      alt={`Slide ${index + 1}`}
                      className="block w-[420px] h-[300px] rounded-lg object-cover"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      </section>

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
        `}
      </style>
    </div>
  );
};

export default Hero;