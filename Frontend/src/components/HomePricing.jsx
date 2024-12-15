import { useState } from "react";

const PricingTable = () => {
  const [pricingType, setPricingType] = useState("monthly");
  const [expandedItems, setExpandedItems] = useState({});

  const pricingData = [
    {
      suite: "Creative Suite",
      pricing: { free: "$0.00", average: "$100", maximum: "$500" },
      gradient: "from-blue-500 to-blue-700",
      items: [
        {
          name: "Genius",
          color: "text-pink-500",
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
          color: "text-blue-500",
          description: "Complete color grading and palette management system",
          features: [
            "Color schemes",
            "Palette extraction",
            "Brand color management",
          ],
        },
        {
          name: "Opus",
          color: "text-purple-500",
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
      suite: "Media Suite",
      pricing: { free: "$0.00", average: "$100", maximum: "$500" },
      gradient: "from-blue-400 to-blue-600",
      items: [
        {
          name: "Wildcard",
          color: "text-green-500",
          description: "Versatile media management and organization tool",
          features: ["Asset organization", "Quick search", "Batch processing"],
        },
        {
          name: "Thrive",
          color: "text-purple-500",
          description: "Social media management and analytics platform",
          features: [
            "Post scheduling",
            "Analytics dashboard",
            "Engagement tracking",
          ],
        },
        {
          name: "Hawkeye",
          color: "text-blue-500",
          description: "Advanced image recognition and tagging system",
          features: ["Auto-tagging", "Visual search", "Image analytics"],
        },
      ],
    },
    {
      suite: "Growth Suite",
      pricing: { free: "$0.00", average: "$100", maximum: "$500" },
      gradient: "from-pink-500 to-pink-700",
      items: [
        {
          name: "Creative",
          color: "text-blue-500",
          description: "Complete creative workflow solution",
          features: [
            "Project management",
            "Resource library",
            "Team collaboration",
          ],
        },
        {
          name: "Media",
          color: "text-blue-400",
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 sm:p-12">
      {/* Title Section */}
      <h1 className="text-center text-3xl lg:text-4xl font-bold mb-6">
        Pricing
      </h1>
      <p className="text-center text-gray-400 mb-12">
        Lorem ipsum dolor sit amet consectetur.
      </p>

      {/* Toggle Pricing Options */}
      <div className="flex justify-center items-center mb-8">
        <button
          onClick={() => setPricingType("monthly")}
          className={`px-6 py-2 rounded-l-lg ${
            pricingType === "monthly"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          Monthly Pricing
        </button>
        <button
          onClick={() => setPricingType("yearly")}
          className={`px-6 py-2 rounded-r-lg ${
            pricingType === "yearly"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          Yearly Pricing
        </button>
      </div>

      {/* Pricing Table */}
      <div className="space-y-16 max-w-5xl w-full">
        {pricingData.map((suite, index) => (
          <div key={index} className="space-y-8">
            {/* Suite Box and Pricing */}
            <div className="flex items-center justify-between rounded-lg w-[997.5px] h-[114px] px-6">
              {/* Suite Box */}
              <div
                className={`bg-gradient-to-r ${suite.gradient} rounded-lg flex items-center justify-center w-[300px] h-full`}
              >
                <h2 className="text-2xl font-bold text-white">{suite.suite}</h2>
              </div>

              {/* Pricing Section */}
              <div className="flex items-center justify-around w-[600px]">
                <div className="text-center">
                  <p className="text-xl text-gray-400 mb-1 pb-2">Free</p>
                  <p className="text-3xl font-extrabold text-white">
                    {suite.pricing.free}
                    <span className="text-base text-gray-400">/mo</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl text-gray-400 mb-1 pb-2">Average</p>
                  <p className="text-3xl font-extrabold text-white">
                    {suite.pricing.average}
                    <span className="text-base text-gray-400">/mo</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl text-gray-400 mb-1 pb-2">Maximum</p>
                  <p className="text-3xl font-extrabold text-white">
                    {suite.pricing.maximum}
                    <span className="text-base text-gray-400">/mo</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Suite Items */}
            <div className="space-y-4 pl-4">
              {suite.items.map((item, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden">
                  <div
                    className="flex justify-between items-center px-4 py-3 bg-gradient-to-t from-[#59759566] to-[#1C252F66] cursor-pointer transition-colors duration-200 hover:bg-[#59759588]"
                    onClick={() => toggleItem(suite.suite, item.name)}
                  >
                    <span className={`${item.color} text-lg font-medium`}>
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
                        className="w-5 h-5"
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
                    <div className="p-6">
                      {/* Description and Features Grid */}
                      <div className="grid grid-cols-12 gap-4">
                        {/* Description Column */}
                        <div className="col-span-4">
                          <p className="text-gray-300">{item.description}</p>
                        </div>

                        {/* Features Columns */}
                        <div className="col-span-8 grid grid-cols-3 gap-4">
                          {/* Free Column */}
                          <div className="space-y-4">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center">
                              GET STARTED
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                              </svg>
                            </button>
                            {item.features.map((feature, featureIdx) => (
                              <div key={featureIdx} className="flex items-start gap-2">
                                <div className="w-2 h-2 mt-2 rounded-full bg-gray-600"></div>
                                <span className="text-gray-400 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Average Column */}
                          <div className="space-y-4">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center">
                              GET STARTED
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                              </svg>
                            </button>
                            {item.features.map((feature, featureIdx) => (
                              <div key={featureIdx} className="flex items-start gap-2">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-400 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Maximum Column */}
                          <div className="space-y-4">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center">
                              GET STARTED
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                              </svg>
                            </button>
                            {item.features.map((feature, featureIdx) => (
                              <div key={featureIdx} className="flex items-start gap-2">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-400 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
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