import { useState, useEffect } from "react";
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
// import GoogleTextAds from "../components/PhoneMockup/GoogleMockup/GoogleTextads";
import GoogleDisplayAds from "../components/PhoneMockup/GoogleMockup/GoogleDisplayads";

// Import icons from assets
import FacebookIcon from "../assets/PhoneMockup/FB.png";
import GoogleIcon from "../assets/PhoneMockup/Google.png";
// import LinkedInIcon from "../assets/PhoneMockup/Linkedin.png";
// import TwitterIcon from "../assets/PhoneMockup/Twitter.png";
// import ProgramaticIcon from "../assets/PhoneMockup/Programatic.png";

// Suppose you have an API utility or inline fetch:
// e.g. /api/creatives/get-ads?appId=...

/** 
 * shortCaption(phrase):
 *   - Removes leading numbering like "12. " 
 *   - Takes the first 5 words 
 *   - Returns e.g. "Hello world from GPT ...See More"
 */
function shortCaption(phrase) {
  if (!phrase || typeof phrase !== "string") return "";
  // Remove leading digits like "4. "
  const cleaned = phrase.replace(/^\d+\.\s*/, "").trim();
  const words = cleaned.split(/\s+/);
  const firstFive = words.slice(0, 5).join(" ");
  return firstFive + " ... See More";
}

export default function Rainbow() {
  const [error] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [activeApp, setActiveApp] = useState("facebook");
  const [activeMockup, setActiveMockup] = useState("feedCarousel");

  
  const apps = [
    { id: 'facebook', alt: 'Facebook', icon: FacebookIcon },
    { id: 'google', alt: 'Google', icon: GoogleIcon }
    // { id: 'linkedin', alt: 'LinkedIn', icon: LinkedInIcon },
    // { id: 'twitter', alt: 'Twitter', icon: TwitterIcon },
    // { id: 'presentation', alt: 'Presentation', icon: ProgramaticIcon }
  ];



  useEffect(() => {
    if (activeApp === "google") {
      setActiveMockup("display"); // Set Animated Ads as default for Google
    } else if (activeApp === "facebook") {
      setActiveMockup("storyAds"); // Set Feed Carousel as default for Facebook
    }
  }, [activeApp]); // Run this effect whenever activeApp changes

  useEffect(() => {
    // fetch or set your ads here, for example
    setAds([{ id: 1, name: "Ad #1" }, { id: 2, name: "Ad #2" }]);
  }, []);

  // const currentAd = ads[currentIndex] || {};

  useEffect(() => {
    // Simulate some work
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Decide what to render inside the phone
  const renderMockup = () => {
    if (activeApp === "facebook") {
      if (activeMockup === "feedCarousel") {
        return <FbFeedCarousel
          ads={ads}
          currentIndex={currentIndex}
          shortCaption={shortCaption}
        />;
      } else {
        // "storyAds"
        // We pass ads, currentIndex, shortCaption, etc. to FbStoryAds
        return (
          <FbStoryAds
            ads={ads}
            currentIndex={currentIndex}
            shortCaption={shortCaption}
          />
        );
      }
    }
    else if (activeApp === "google") {
      // if (activeMockup === "search") {
      //   return <GoogleTextAds />;
      // } else
        if (activeMockup === "maps") {
        return <GoogleAnimatedAds />;
      } else if (activeMockup === "display") {
        return <GoogleDisplayAds />; // Render the new component
      }
    }

    return null;
  };

  return (
    <div className="bg-black min-h-screen w-full relative overflow-x-hidden">
      {error && <p>{error}</p>}
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-[#0F0F0F] flex flex-col items-center justify-center gap-8 z-10">
        {apps.map((app) => (
          <div key={app.id} className="relative flex items-center">
            {/* Active indicator line */}
            {activeApp === app.id && (
              <div className="absolute -right-2 h-6 w-1 bg-blue-500 rounded-full" />

            )}

            {/* Button container with hover effect */}

            <button
              onClick={() => setActiveApp(app.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center
                ${activeApp === app.id ? 'text-blue-800' : 'text-gray-500 hover:text-gray-300'}
                transition-colors duration-300`}
            >
              <div className="w-[3rem] h-[3rem] flex items-center justify-center">
                <img src={app.icon} alt={app.alt} className="w-full h-full object-contain" />
              </div>
            </button>

          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="ml-16 w-[calc(100%-4rem)] p-4 md:p-6">
        {/* Centered Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8 w-full">
          {activeApp === "facebook" ? (
            <>
              <button
                onClick={() => setActiveMockup("storyAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "storyAds" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Story Ads
              </button>
              <button
                onClick={() => setActiveMockup("feedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "feedCarousel" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Feed Carousel
              </button>
              
            </>
          ) : (
            <>
              {/* <button
                onClick={() => setActiveMockup("search")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "search" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Text Ads
              </button> */}
                  <button
                onClick={() => setActiveMockup("display")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "display" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Display Ads
              </button>
              <button
                onClick={() => setActiveMockup("maps")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300
                  ${activeMockup === "maps" ? "selected-gradient" : "unselected-gradient"}`}
              >
                Animated Ads
              </button>
            
              
            </>
          )}
        </div>

        {/* Phone Mockup Container */}
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-md mx-auto">
            <PhoneMockup>{renderMockup()}</PhoneMockup>
          </div>
        </div>
      </div>

      {/* Styles for gradients */}
      <style>
        {`
          .selected-gradient {
            background: linear-gradient(180deg, #0163F8 0%, #013A92 100%);
          }
          
          .unselected-gradient {
            background: linear-gradient(180deg, #1C252F66 0%, #59759566 100%);
          }
          
          .selected-gradient:hover {
            opacity: 0.9;
          }
          
          .unselected-gradient:hover {
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
};
