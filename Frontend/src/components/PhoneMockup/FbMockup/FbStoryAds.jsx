
import { X, Share } from 'lucide-react';
import image from "../../../assets/creative.png";

const FacebookStory = () => {
  const userName = "Zac Efron";

  const handleCloseStory = () => {
    console.log("Story closed");
  };

  const handleShareStory = () => {
    console.log("Story shared");
  };

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-8 left-4 right-4 h-0.5 bg-gray-700 rounded-full">
        <div className="h-0.5 bg-white rounded-full" style={{ width: '70%' }}></div>
      </div>

      {/* User Info and Close Button */}
      <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {userName.charAt(0)}
          </div>
          <span className="ml-2 text-white font-semibold">{userName}</span>
        </div>
        <button onClick={handleCloseStory} className="text-white">
          <X size={22} />
        </button>
      </div>

      {/* Story Content - Main content area with flex-grow */}
      <div className="flex-grow flex items-center justify-center mt-16 mb-20">
        <div className="w-full h-full flex items-center justify-center px-4">
          <img
            src={image}
            alt="Story"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Share Button */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-center">
        <button
          onClick={handleShareStory}
          className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-semibold"
        >
          <Share size={16} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
};

export default FacebookStory;
