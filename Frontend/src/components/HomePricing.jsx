import { useState, useRef } from "react";
import image1 from "../assets/p1.png";
import image2 from "../assets/p2.png";
import image3 from "../assets/p3.png";
import crown from "../assets/pricingcrown.png";
// import animation from "../assets/pricing.webm";
// import growth from "../assets/grow_animation.webm";


const PricingTable = () => {
  const [pricingType, setPricingType] = useState("monthly");
  const [expandedItems, setExpandedItems] = useState({});
  const scrollContainerRef = useRef(null);

  const pricingData = [
    {
      suite: "",
      imageUrl: image1, // Update with actual image path
      pricing: { free: "$0.00", average: "$100", maximum: "$500" },
      gradient: "from-blue-500 to-blue-700",
      items: [
        {
          name: "Genius",
          color:
            "bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-transparent bg-clip-text",
          description:
            "Advanced AI-powered creative tools for professional content creation",
          features: [
            "Smart editing",
            "AI asset generation",
            "Custom templates",
          ],
        },
        {
          name: "Rainbow",
          color:
            "bg-gradient-to-r from-[#0163F8] to-[#04EEF1] text-transparent bg-clip-text",
          description: "Complete color grading and palette management system",
          features: [
            "Color schemes",
            "Palette extraction",
            "Brand color management",
          ],
        },
        {
          name: "Opus",
          color:
            "bg-gradient-to-r from-[#6CFF7A] to-[#04EEF1] text-transparent bg-clip-text",
          description: "Professional audio editing and music creation suite",
          features: [
            "Multi-track editing",
            "Virtual instruments",
            "Audio effects",
          ],
        },
      ],
    },
    {
      suite: "",
      imageUrl: image2, // Update with actual image path
      pricing: { free: "$0.00", average: "$100", maximum: "$500" },
      gradient: "",
      items: [
        {
          name: "Wildcard",
          color:
            "bg-gradient-to-r from-[#0267F8] to-[#0AFF88] text-transparent bg-clip-text",
          description: "Versatile media management and organization tool",
          features: ["Asset organization", "Quick search", "Batch processing"],
        },
        {
          name: "Thrive",
          color:
            "bg-gradient-to-r from-[#0267F8] to-[#DA0AFF] text-transparent bg-clip-text",
          description: "Social media management and analytics platform",
          features: [
            "Post scheduling",
            "Analytics dashboard",
            "Engagement tracking",
          ],
        },
        {
          name: "Hawkeye",
          color:
            "bg-gradient-to-r from-[#E3FD1B] to-[#0163F8] text-transparent bg-clip-text",
          description: "Advanced image recognition and tagging system",
          features: ["Auto-tagging", "Visual search", "Image analytics"],
        },
      ],
    },
    {
      suite: "",
      imageUrl: image3, // Update with actual image path
      pricing: { free: "$0.00", average: "$100", maximum: "$500" },
      gradient: "from-pink-500 to-pink-700",
      items: [
        {
          name: "Creative",
          color: "text-[#015FF8]",
          description: "Complete creative workflow solution",
          features: [
            "Project management",
            "Resource library",
            "Team collaboration",
          ],
        },
        {
          name: "Media",
          color: "text-[#015FF8]",
          description: "Comprehensive media management toolkit",
          features: ["Media library", "Distribution tools", "Analytics"],
        },
      ],
    },
  ];

  const toggleItem = (suiteName, itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${suiteName}-${itemName}`]: !prev[`${suiteName}-${itemName}`],
    }));
  };

  return (
    <div className="min-h-screen bg-black text-gray-400 flex flex-col items-center p-4 md:p-6 lg:p-12">
      {/* Title Section */}
      <h1 className="text-center text-2xl md:text-3xl lg:text-[25px] font-bold mb-2">
        Pricing
      </h1>
      <p className="text-center text-white mb-8 md:mb-12 text-3xl md:text-4xl lg:text-[49px]">
        Lorem ipsum dolor sit amet consectetur.
      </p>

      {/* Toggle Pricing Options */}
      <div className="relative flex items-center justify-center mb-[40px] w-full max-w-md mt-8">
      <div className="flex border border-white rounded-[10px] overflow-hidden w-[282px] h-[39px] p-1 bg-black">
        <button
          onClick={() => setPricingType("monthly")}
          className={`flex-1 px-2 md:px-2 py-2 transition-all duration-300 text-sm flex items-center justify-center md:text-base ${
            pricingType === "monthly"
              ? "bg-gradient-to-t from-[#013A92] to-[#0163F8] text-white rounded-[10px]"
              : "bg-black text-gray-400"
          }`}
        >
          Monthly Pricing
        </button>
        <button
          onClick={() => setPricingType("yearly")}
          className={`flex-1 px-2 md:px-2 py-2 transition-all duration-300 text-sm flex items-center justify-center md:text-base ${
            pricingType === "yearly"
              ? "bg-gradient-to-t from-[#013A92] to-[#0163F8] text-white rounded-[10px]"
              : "bg-black text-gray-400"
          }`}
        >
          Yearly Pricing
        </button>
      </div>
      <img
        src={crown}
        alt="20% Off"
        className="absolute top-[-32px] right-[3px] sm:top-[-32px] sm:right-[45px] md:top-[-40px] md:right-[30px] w-[50px] md:w-[67.69px] h-auto"
      />
    </div>

      {/* Pricing Table */}
      <div className="space-y-8 md:space-y-16 w-full max-w-5xl">
        {pricingData.map((suite, index) => (
          <div key={index} className="space-y-6 md:space-y-8">
            {/* Suite Box and Pricing */}
            <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 px-4 md:px-6">
              {/* Suite Box with Image */}
              <div className="relative rounded-lg w-full lg:w-[292px] h-[114px]">
                <img
                  src={suite.imageUrl}
                  alt={suite.suite}
                  className="absolute inset-0 object-contain w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00000080] to-transparent rounded-lg"></div>

                {/* Animations */}
                {/* {index === 0 && (
                 <div className="absolute z-20 left-1/2 transform -translate-x-1/2 bottom-[-58px]">
                 <video
                   src={animation}
                   autoPlay
                   loop
                   muted
                   playsInline
                      className="w-[96px] h-[96px] pointer-events-none"
                      style={{ backgroundColor: 'transparent' }}
                 ></video>
               </div>
                )}

                {index === 2 && (
                  <div className="absolute z-20 left-1/2 transform -translate-x-1/2 bottom-[-58px]">
                  <video
                    src={growth}
                    autoPlay
                    loop
                    muted
                    playsInline
                      className="w-[96px] h-[96px] pointer-events-none"
                      style={{ backgroundColor: 'transparent' }}
                  ></video>
                </div>
                )} */}

                <h2 className="relative text-2xl font-bold text-white z-10 text-center">
                  {suite.suite}
                </h2>
              </div>

              {/* Pricing Section - Hidden on Mobile and Tablet */}
              <div className="hidden lg:grid grid-cols-3 gap-4 md:gap-8 w-full lg:flex-1">
                {["free", "average", "maximum"].map((type) => (
                  <div key={type} className="text-center">
                    <p className="text-sm md:text-xl text-gray-400 mb-1 pb-2 capitalize">
                      {type}
                    </p>
                    <p className="text-xl md:text-3xl font-extrabold text-white">
                      {suite.pricing[type]}
                      <span className="text-xs md:text-base text-gray-400">/mo</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suite Items Dropdown */}
            <div className="space-y-4 px-4 md:pl-4">
              {suite.items.map((item, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden">
                  <div
                    className="flex justify-between items-center px-4 py-3 bg-gradient-to-t from-[#59759566] to-[#1C252F66] cursor-pointer transition-colors duration-200 hover:bg-[#59759588]"
                    onClick={() => toggleItem(suite.suite, item.name)}
                  >
                    <span className={`${item.color} text-base md:text-lg font-medium`}>
                      {item.name}
                    </span>
                    <button
                      className="text-white transform transition-transform duration-200"
                      style={{
                        transform: expandedItems[`${suite.suite}-${item.name}`]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Dropdown Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      expandedItems[`${suite.suite}-${item.name}`]
                        ? "max-h-[800px] opacity-100"
                        : "max-h-0 opacity-0"
                    } overflow-hidden bg-gradient-to-t from-[#59759566] to-[#1C252F66] rounded-b-lg`}
                  >
                    <div className="p-4 md:p-6">
                      {/* Description */}
                      <p className="text-gray-300 mb-6">{item.description}</p>

                      {/* Mobile and Tablet Pricing Scroll Container */}
                      <div 
                        ref={scrollContainerRef}
                        className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4"
                      >
                        <div className="flex gap-4 min-w-max">
                          {["Free", "Average", "Maximum"].map((type, typeIdx) => (
                            <div key={typeIdx} className="w-[280px] space-y-4">
                              <div className="text-center mb-6">
                                <p className="text-gray-400 mb-1">{type}</p>
                                <p className="text-2xl font-bold text-white">
                                  {suite.pricing[type.toLowerCase()]}
                                  <span className="text-sm text-gray-400">/mo</span>
                                </p>
                              </div>
                              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center">
                                GET STARTED
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 12h14m0 0l-7-7m7 7l-7 7"
                                  />
                                </svg>
                              </button>
                              {item.features.map((feature, featureIdx) => (
                                <div key={featureIdx} className="flex items-start gap-2">
                                  <div className={`w-2 h-2 mt-2 rounded-full ${
                                    type === "Free" ? "bg-gray-600" : "bg-green-500"
                                  }`}></div>
                                  <span className="text-gray-400 text-sm">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop Features Grid */}
                      <div className="hidden lg:grid grid-cols-12 gap-6">
                        <div className="col-span-4">
                          <p className="text-gray-300">{item.description}</p>
                        </div>
                        <div className="col-span-8 grid grid-cols-3 gap-6">
                          {["free", "average", "maximum"].map((type, typeIdx) => (
                            <div key={typeIdx} className="space-y-4">
                              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center">
                                GET STARTED
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 12h14m0 0l-7-7m7 7l-7 7"
                                  />
                                </svg>
                              </button>
                              {item.features.map((feature, featureIdx) => (
                                <div key={featureIdx} className="flex items-start gap-2">
                                  <div className={`w-2 h-2 mt-2 rounded-full ${
                                    type === "free" ? "bg-gray-600" : "bg-green-500"
                                  }`}></div>
                                  <span className="text-gray-400 text-sm">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingTable;