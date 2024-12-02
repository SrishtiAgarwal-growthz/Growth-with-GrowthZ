import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="w-full bg-black h-[736px]"> {/* Changed min-h-screen to h-[736px] */}
      <div className="max-w-[877px] mx-auto pt-20 text-center flex flex-col items-center"> {/* Changed from 736px to 877px */}
        <h1 className="text-6xl font-bold text-white">
          Powering the GROWTH
        </h1>
        <p className="text-gray-300 text-xl mt-4">
          Creative to Campaign to Scalable Conversions
        </p>
        
        <button className="mt-6 flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-blue-600 text-white">
          TRY ME
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="mt-6 text-white font-mulish text-base leading-[19.2px] w-[384px]">
          Craft Ad Copies That Resonate, Inspire, and Convert
          <br />
          With Genius
        </p>
      </div>
    </div>
  );
};

export default Hero;