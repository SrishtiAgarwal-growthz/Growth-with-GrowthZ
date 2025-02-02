import { useState, useEffect, useCallback } from "react";
import PhoneMockup from "../components/PhoneMockup/PhoneMockup";
import FbFeedCarousel from "../components/PhoneMockup/FbMockup/FbFeedCarousel";
import FbStoryAds from "../components/PhoneMockup/FbMockup/FbStoryAds";
import GoogleAnimatedAds from "../components/PhoneMockup/GoogleMockup/GoogleAnimatedads";
import GoogleDisplayAds from "../components/PhoneMockup/GoogleMockup/GoogleDisplayads";
import { getGeneratedAds } from "../logic/rainbow/rainbowApi";
import { useNavigate } from "react-router-dom";
import FacebookIcon from "../assets/PhoneMockup/FB.png";
import GoogleIcon from "../assets/PhoneMockup/Google.png";
import loader from "../assets/PhoneMockup/loader.mp4";
import IgFeedCarousel from "../components/PhoneMockup/InstaMockup/InstaFeedCarousel";
import IgStoryAds from "../components/PhoneMockup/InstaMockup/InstaStoryAds";
import LinkedInFeedCarousel from "../components/PhoneMockup/LinkedinMockup/LinkedinFeedCarousel";
import XFeedCarousel from "../components/PhoneMockup/XMockup/XFeedCarousel";
import TwitterIcon from "../assets/PhoneMockup/Twitter.png";
import LinkedinIcon from "../assets/PhoneMockup/Linkedin.png";

const BASE_URL = "http://localhost:8000";

export default function Rainbow() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // We already had these
  const [appName, setAppName] = useState("");
  const [appLogo, setAppLogo] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [websiteLink, setWebsiteLink] = useState("");

  const [ads, setAds] = useState({
    storyAds: [],
    feedCarousel: [],
    displayAds: [],
    animatedAds: [],
    igFeedCarousel: [],
    igStoryAds: [],
    linkedinFeedCarousel: [],
    xFeedCarousel: [],
  });

  const [currentIndex, setCurrentIndex] = useState({
    storyAds: 0,
    feedCarousel: 0,
    displayAds: 0,
    animatedAds: 0,
    igFeedCarousel: 0,
    igStoryAds: 0,
    linkedinFeedCarousel: 0,
    xFeedCarousel: 0,
  });

  const [adStatuses, setAdStatuses] = useState({
    approved: new Set(),
    rejected: new Set(),
  });

  const [activeApp, setActiveApp] = useState("facebook");
  const [activeMockup, setActiveMockup] = useState("storyAds");

  const apps = [
    { id: "facebook", alt: "Facebook", icon: FacebookIcon },
    { id: "google", alt: "Google", icon: GoogleIcon },
    { id: "instagram", alt: "Instagram" },
    { id: "linkedin", alt: "Linkedin", icon: LinkedinIcon },
    { id: "x", alt: "X", icon: TwitterIcon },
  ];

  useEffect(() => {
    const storedAppId = localStorage.getItem("appId");
    // if (!storedAppId) {
    //   console.log("No appId found, redirecting to genius");
    //   navigate("/genius");
    //   return;
    // }

    const fetchAds = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = localStorage.getItem("loggedInMongoUserId");
        const data = await getGeneratedAds(storedAppId, userId);

        console.log("API Response Data:", data);

        // Set app info
        setAppName(data.appName || "");
        setAppLogo(data.logo || "");
        setTextColor(data.textColor || "#FFFFFF");
        setWebsiteLink(data.website || "");

        // Provide default empty arrays if data.ads or data.animations are undefined
        const rawStaticAds = data.ads || [];
        const rawAnimationAds = data.animations || [];

        // Sort static ads by size
        const storyAds = rawStaticAds
          .filter(
            (ad) =>
              ad.creativeUrl?.size === "1440x2560" && ad.creativeUrl?.adUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "storyAd" },
          }));

        const igStoryAds = rawStaticAds
          .filter(
            (ad) =>
              ad.creativeUrl?.size === "1440x2560" && ad.creativeUrl?.adUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "igStoryAd" },
          }));

        const displayAds = rawStaticAds
          .filter(
            (ad) => ad.creativeUrl?.size === "300x250" && ad.creativeUrl?.adUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "displayAd" },
          }));

        const xFeedCarousel = rawStaticAds
          .filter(
            (ad) => ad.creativeUrl?.size === "800x800" && ad.creativeUrl?.adUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "xFeedCarousel" },
          }));

        // Sort animations by size
        const feedCarousel = rawAnimationAds
          .filter(
            (ad) =>
              ad.creativeUrl?.size === "1080x1080" &&
              ad.creativeUrl?.animationUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "feedCarousel" },
          }));

        const linkedinFeedCarousel = rawStaticAds
          .filter(
            (ad) => ad.creativeUrl?.size === "720x900" && ad.creativeUrl?.adUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "feedCarousel" },
          }));

        const igFeedCarousel = rawAnimationAds
          .filter(
            (ad) =>
              ad.creativeUrl?.size === "1080x1080" &&
              ad.creativeUrl?.animationUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "igFeedCarousel" },
          }));

        const animatedAds = rawAnimationAds
          .filter(
            (ad) =>
              ad.creativeUrl?.size === "300x250" && ad.creativeUrl?.animationUrl
          )
          .map((ad) => ({
            ...ad,
            creativeUrl: { ...ad.creativeUrl, type: "animatedAd" },
          }));

        // Finally set them in state
        setAds({
          storyAds,
          feedCarousel,
          displayAds,
          animatedAds,
          igFeedCarousel,
          igStoryAds,
          linkedinFeedCarousel,
          xFeedCarousel,
        });
      } catch (err) {
        console.error("[Rainbow] Error fetching ads:", err);
        setError(err.message || "Failed to load ads");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [navigate]);

  // Handle app switching
  useEffect(() => {
    if (activeApp === "google") {
      setActiveMockup("displayAds");
    } else if (activeApp === "facebook") {
      setActiveMockup("storyAds");
    } else if (activeApp === "instagram") {
      setActiveMockup("igStoryAds");
    } else if (activeApp === "linkedin") {
      setActiveMockup("linkedinFeedCarousel");
    } else if (activeApp === "x") {
      setActiveMockup("xFeedCarousel");
    }
  }, [activeApp]);

  // Helper: next
  const handleNext = useCallback(() => {
    const currentAds = ads[activeMockup];
    if (!currentAds?.length) return;

    setCurrentIndex((prev) => ({
      ...prev,
      [activeMockup]: (prev[activeMockup] + 1) % currentAds.length,
    }));
  }, [ads, activeMockup]);

  // Helper: previous
  const handlePrev = useCallback(() => {
    const currentAds = ads[activeMockup];
    if (!currentAds?.length) return;

    setCurrentIndex((prev) => ({
      ...prev,
      [activeMockup]:
        prev[activeMockup] === 0
          ? currentAds.length - 1
          : prev[activeMockup] - 1,
    }));
  }, [ads, activeMockup]);

  // Decide ad url
  const getAdUrl = (mockupType, currentAd) => {
    if (!currentAd?.creativeUrl) return null;

    // Animated
    if (
      mockupType === "feedCarousel" ||
      mockupType === "animatedAds" ||
      mockupType === "igFeedCarousel"
    ) {
      return currentAd.creativeUrl.animationUrl || null;
    }
    // Static
    if (
      mockupType === "storyAds" ||
      mockupType === "displayAds" ||
      mockupType === "igStoryAds" ||
      mockupType === "linkedinFeedCarousel" ||
      mockupType === "xFeedCarousel"
    ) {
      return currentAd.creativeUrl.adUrl || null;
    }
    return null;
  };

  const getAdIdentifier = useCallback((mockupType, currentAd) => {
    const url = getAdUrl(mockupType, currentAd);
    return `${mockupType}:${currentAd?.id || url}`;
  }, []);

  // Approve
  const handleAccept = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        const currentAd = ads[activeMockup][currentIndex[activeMockup]];
        const creativeUrl = getAdUrl(activeMockup, currentAd);
        if (!creativeUrl) {
          throw new Error("No URL found for the current creative");
        }

        const payload = {
          creativeId: creativeUrl,
          status: "approved",
        };

        const response = await fetch(
          `${BASE_URL}/api/creativesStatus/approve`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to approve creative");
        }

        const adIdentifier = getAdIdentifier(activeMockup, currentAd);
        setAdStatuses((prev) => {
          const newApproved = new Set(prev.approved);
          const newRejected = new Set(prev.rejected);
          newApproved.add(adIdentifier);
          newRejected.delete(adIdentifier);
          return { approved: newApproved, rejected: newRejected };
        });
        // handleNext(); // optional auto-next
      } catch (err) {
        console.error("Error approving creative:", err.message);
        setError(err.message);
      }
    },
    [ads, currentIndex, activeMockup, getAdIdentifier]
  );

  // Reject
  const handleReject = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        const currentAd = ads[activeMockup][currentIndex[activeMockup]];
        const creativeUrl = getAdUrl(activeMockup, currentAd);
        if (!creativeUrl) {
          throw new Error("No URL found for the current creative");
        }

        const response = await fetch(`${BASE_URL}/api/creativesStatus/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creativeId: creativeUrl,
            status: "rejected",
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to reject creative");
        }

        const adIdentifier = getAdIdentifier(activeMockup, currentAd);
        setAdStatuses((prev) => {
          const newApproved = new Set(prev.approved);
          const newRejected = new Set(prev.rejected);
          newRejected.add(adIdentifier);
          newApproved.delete(adIdentifier);
          return { approved: newApproved, rejected: newRejected };
        });
        // handleNext(); // optional auto-next
      } catch (err) {
        console.error("Error rejecting creative:", err.message);
        setError(err.message);
      }
    },
    [ads, currentIndex, activeMockup, getAdIdentifier]
  );

  // Check status
  const getCurrentAdStatus = () => {
    const currentAd = ads[activeMockup]?.[currentIndex[activeMockup]];
    if (!currentAd) return null;

    const adIdentifier = getAdIdentifier(activeMockup, currentAd);
    if (adStatuses.approved.has(adIdentifier)) return "approved";
    if (adStatuses.rejected.has(adIdentifier)) return "rejected";
    return null;
  };

  // RENDER CHILD
  const renderAllMockups = () => {
    const mockupProps = {
      currentIndex: currentIndex[activeMockup],
      setCurrentIndex: (newIndex) =>
        setCurrentIndex((prev) => ({ ...prev, [activeMockup]: newIndex })),
      ads: ads[activeMockup],
      appName,
      appLogo,
      textColor,
      websiteLink,
    };

    switch (activeMockup) {
      case "storyAds":
        return <FbStoryAds {...mockupProps} />;
      case "feedCarousel":
        return <FbFeedCarousel {...mockupProps} />;
      case "displayAds":
        return <GoogleDisplayAds {...mockupProps} />;
      case "animatedAds":
        return <GoogleAnimatedAds {...mockupProps} />;
      case "igStoryAds":
        return <IgStoryAds {...mockupProps} />;
      case "igFeedCarousel":
        return <IgFeedCarousel {...mockupProps} />;
      case "linkedinFeedCarousel":
        return <LinkedInFeedCarousel {...mockupProps} />;
      case "xFeedCarousel":
        return <XFeedCarousel {...mockupProps} />;
      default:
        return null;
    }
  };

  // LOADING
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "black",
        }}
      >
        <video autoPlay loop muted style={{ width: "200px", height: "200px" }}>
          <source src={loader} type="video/mp4" />
          Loading ...
        </video>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen w-full relative overflow-x-hidden">
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="fixed top-5 right-4"> {/* Added container with positioning */}
      <button className="group flex items-center justify-start w-10 h-10 rounded-full border-none cursor-pointer relative overflow-hidden transition-all duration-300 shadow-md hover:w-32 hover:rounded-full bg-red-500 active:translate-x-0.5 active:translate-y-0.5"
      onClick={ ()=> navigate("/login")}
      >
        <div className="w-full transition-all duration-300 flex items-center justify-center group-hover:w-1/3 group-hover:pl-5">
          <svg 
            viewBox="0 0 512 512" 
            className="w-4 h-4 fill-white"
          >
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
        </div>
        
        <div className="absolute right-0 w-0 opacity-0 text-white text-[15px] font-semibold transition-all duration-300 group-hover:opacity-100 group-hover:w-2/3 group-hover:pr-3">
          Logout
        </div>
      </button>
    </div>

      {/* Sidebar */}
      <div className=" fixed left-0">
        <button
        onClick={() => navigate("/genius")}
          className="bg-black text-center w-24 rounded-2xl h-7 relative text-white text-xs font-semibold group"
          type="button"
        >
          <div className="bg-blue-500 rounded-xl h-6 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[80px] z-10 duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              height="15px"
              width="15px"
            >
              <path
                d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                fill="#000000"
              ></path>
              <path
                d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                fill="#000000"
              ></path>
            </svg>
          </div>
          <p className="translate-x-1">Go Back</p>
        </button>
      </div>
      <div className="fixed left-0 top-[80px] h-[calc(100%-80px)] w-[6rem] bg-[#0F0F0F] flex flex-col items-center justify-center gap-8 z-10">
        {apps.map((app) => (
          <div key={app.id} className="relative flex items-center">
            {activeApp === app.id && (
              <div className="absolute -right-6 h-12 w-1 bg-blue-600 rounded-full" />
            )}
            <button
              onClick={() => setActiveApp(app.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${
                activeApp === app.id
                  ? "text-blue-800"
                  : "text-gray-500 hover:text-gray-300"
              } transition-colors duration-300`}
            >
              <div className="w-[3rem] h-[3rem] flex items-center justify-center">
                <img
                  src={app.icon}
                  alt={app.alt}
                  className="w-full h-full object-contain"
                />
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="ml-16 w-[calc(100%-4rem)] p-4 md:p-6">
        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8 w-full">
          {activeApp === "facebook" ? (
            <>
              <button
                onClick={() => setActiveMockup("storyAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "storyAds"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Story Ads
              </button>
              <button
                onClick={() => setActiveMockup("feedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "feedCarousel"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Feed Carousel
              </button>
            </>
          ) : activeApp === "google" ? (
            <>
              <button
                onClick={() => setActiveMockup("displayAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "displayAds"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Display Ads
              </button>
              <button
                onClick={() => setActiveMockup("animatedAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "animatedAds"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Animated Ads
              </button>
            </>
          ) : activeApp === "instagram" ? (
            <>
              <button
                onClick={() => setActiveMockup("igStoryAds")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "igStoryAds"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Story Ads
              </button>
              <button
                onClick={() => setActiveMockup("igFeedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "igFeedCarousel"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Feed Carousel
              </button>
            </>
          ) : activeApp === "linkedin" ? (
            <>
              <button
                onClick={() => setActiveMockup("linkedinFeedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "linkedinFeedCarousel"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Feed Carousel
              </button>
            </>
          ) : (
            // "x"
            <>
              <button
                onClick={() => setActiveMockup("xFeedCarousel")}
                className={`w-32 sm:w-40 h-8 sm:h-9 rounded-xl text-white font-medium transition-all duration-300 ${
                  activeMockup === "xFeedCarousel"
                    ? "selected-gradient"
                    : "unselected-gradient"
                }`}
              >
                Feed Carousel
              </button>
            </>
          )}
        </div>

        {/* Phone Mockup Container */}
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-md mx-auto">
            <PhoneMockup
              handleNext={handleNext}
              handlePrev={handlePrev}
              onAccept={handleAccept}
              onReject={handleReject}
              adStatus={getCurrentAdStatus()}
            >
              {renderAllMockups()}
            </PhoneMockup>
          </div>
        </div>
      </div>

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
}
