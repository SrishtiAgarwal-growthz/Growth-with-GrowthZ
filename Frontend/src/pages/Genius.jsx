import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  saveAppDetails,
  generatePhrases,
  approvePhrase,
  rejectPhrase,
} from "../logic/genius/geniusApi.js";
import logo from "../assets/logo.png";
import frame from "../assets/Frame.png";
import { useNavigate } from "react-router-dom";

// Base URL for API endpoints
const BASE_URL = "https://growth-with-growthz.onrender.com";

// API function to add creative tasks
async function addCreativeToTasks(userId, appId) {
  const response = await fetch(`${BASE_URL}/api/creatives/addCreativeToTasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, appId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add Creatives task");
  }
  return response.json();
}

// API function to create ads
async function createAds(userId, appId) {
  const response = await fetch(`${BASE_URL}/api/creatives/createAd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, appId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create ads");
  }
  return response.json();
}

// API function to create animations
async function createAnimations(userId, appId) {
  const response = await fetch(`${BASE_URL}/api/creatives/createAnimation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, appId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create ads");
  }
  return response.json();
}

const GeniusMarketingForm = () => {
  const navigate = useNavigate();
  
  // Initialize all state variables
  const [formData, setFormData] = useState({
    google_play: "",
    apple_app: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phrases, setPhrases] = useState(null);
  const [approvalStates, setApprovalStates] = useState([]);
  const [appId, setAppId] = useState(null);
  const [isGeneratingCreatives, setIsGeneratingCreatives] = useState(false);
  const [buttonState, setButtonState] = useState('generate');

  // Effect to handle existing phrases from database
  useEffect(() => {
    if (!phrases) return;

    if (
      phrases.status === "already_exists" &&
      phrases.phrases?.phrases &&
      !phrases.uspPhrases
    ) {
      const dbPhrases = phrases.phrases.phrases;
      const phraseTexts = dbPhrases.map((item) => item.text);
      const statesFromDB = dbPhrases.map((item) => item.status || "pending");

      setPhrases((prev) => ({
        ...prev,
        uspPhrases: phraseTexts,
      }));
      setApprovalStates(statesFromDB);
    } else if (phrases.uspPhrases && approvalStates.length === 0) {
      setApprovalStates(new Array(phrases.uspPhrases.length).fill("pending"));
    }
  }, [phrases, approvalStates.length]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Main form submission handler
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setPhrases(null);

      const auth = getAuth();
      const userEmail = auth.currentUser?.email;
      if (!userEmail) throw new Error("User email is not available.");

      const userResponse = await fetch(
        `${BASE_URL}/api/users/get-user-by-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      if (!userResponse.ok) throw new Error("Failed to fetch userId.");
      const userData = await userResponse.json();
      const userId = userData._id;

      const savedApp = await saveAppDetails(formData);
      const appIdFromResponse = savedApp._id;
      if (!appIdFromResponse) throw new Error("App ID not returned from saveAppDetails.");
      
      setAppId(appIdFromResponse);
      const generatedPhrases = await generatePhrases(formData, appIdFromResponse, userId);
      setPhrases(generatedPhrases);
      
      setButtonState('getCreatives');
    } catch (err) {
      setError(err.message);
      console.error("Error during form submission:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle phrase approval
  const handleTickClick = async (index) => {
    if (!phrases?.uspPhrases) return;
    try {
      const phraseToApprove = phrases.uspPhrases[index];
      await approvePhrase(phraseToApprove, appId);
      const newStates = [...approvalStates];
      newStates[index] = "approved";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error approving phrase:", error.message);
      alert(error.message);
    }
  };

  // Handle phrase rejection
  const handleCrossClick = async (index) => {
    if (!phrases?.uspPhrases) return;
    try {
      const phraseToReject = phrases.uspPhrases[index];
      await rejectPhrase(appId, phraseToReject);
      const newStates = [...approvalStates];
      newStates[index] = "rejected";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error rejecting phrase:", error.message);
      alert(error.message);
    }
  };

  // Handle creative generation
  const handleGetCreatives = async () => {
    if (!appId) {
      alert("No App ID found. Please generate phrases first.");
      return;
    }

    try {
      setIsGeneratingCreatives(true);

      const auth = getAuth();
      const userEmail = auth.currentUser?.email;
      if (!userEmail) throw new Error("User email is not available.");

      const userResponse = await fetch(
        `${BASE_URL}/api/users/get-user-by-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      if (!userResponse.ok) throw new Error("Failed to fetch userId.");
      const userData = await userResponse.json();
      const userId = userData._id;

      await addCreativeToTasks(userId, appId);
      await createAds(userId, appId);
      await createAnimations(userId, appId);

      setButtonState('showCreatives');
    } catch (err) {
      console.error("Error generating creatives:", err.message);
      alert(err.message);
    } finally {
      setIsGeneratingCreatives(false);
    }
  };

  // Handle showing creatives
  const handleShowCreatives = () => {
    if (appId) {
      localStorage.setItem("appId", appId);
    }
    window.location.href = "/rainbow";
  };

  // Unified button click handler
  const handleButtonClick = async () => {
    switch (buttonState) {
      case 'generate':
        await handleSubmit();
        break;
      case 'getCreatives':
        await handleGetCreatives();
        break;
      case 'showCreatives':
        handleShowCreatives();
        break;
    }
  };

  // Get dynamic button text
  const getButtonText = () => {
    if (loading) return "Processing...";
    
    switch (buttonState) {
      case 'generate':
        return "Generate Ad Copies";
      case 'getCreatives':
        return isGeneratingCreatives ? "Generating Creatives..." : "Get Creatives";
      case 'showCreatives':
        return "Show Creatives";
      default:
        return "Generate Ad Copies";
    }
  };

  // Get dynamic button styles
  const getButtonStyles = () => {
    const baseStyles = "w-full h-[70px] rounded-[16px] font-bold text-[20px] flex items-center justify-center gap-2";
    
    switch (buttonState) {
      case 'generate':
        return `${baseStyles} bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-black`;
      case 'getCreatives':
        return `${baseStyles} bg-purple-600 text-white`;
      case 'showCreatives':
        return `${baseStyles} bg-green-600 text-white`;
      default:
        return baseStyles;
    }
  };
  // Component render method starts here
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background decorative effect */}
      <div className="absolute bottom-0 right-0 w-full h-[80vh] overflow-hidden">
        <img
          src={frame}
          alt="Decorative Effect"
          className="absolute bottom-0 right-0 w-auto h-full object-contain"
        />
      </div>

      {/* Main content container */}
      <div className="relative p-6">
        {/* Header with logo */}
        <div className="flex items-center gap-2 mb-16">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="w-[120px] h-[25px] md:w-[131px] md:h-[32px]"
            />
          </button>
        </div>

        {/* Main content area */}
        <div className="max-w-[847px] mx-auto space-y-8">
          {/* Title section */}
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
              Genius
            </h2>
            <p className="text-gray-300">
              Create Brand Marketing Communication For Free!
            </p>
          </div>

          {/* Main form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Google Play Store URL input */}
            <div>
              <label className="block text-white mb-2 text-[16px]">
                Enter Google Play Store URL
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="google_play"
                value={formData.google_play}
                onChange={handleInputChange}
                className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 focus:outline-none focus:border-purple-500"
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </div>

            {/* App Store URL input */}
            <div>
              <label className="block text-white mb-2 text-[16px]">
                Enter App Store URL
              </label>
              <input
                type="url"
                name="apple_app"
                value={formData.apple_app}
                onChange={handleInputChange}
                className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 focus:outline-none focus:border-purple-500"
                placeholder="https://apps.apple.com/in/app/..."
              />
            </div>

            {/* Error message display */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* Generated phrases display section */}
            {phrases?.uspPhrases && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {phrases.uspPhrases.map((phrase, index) => {
                  // Process the phrase text for display
                  let processedText = phrase;
                  if (index === 0 && /^##\s*/.test(phrase)) {
                    processedText = phrase.replace(/^##\s*/, "").trim();
                  } else if (index === 0) {
                    processedText = "20 Unique Selling Ad Copies";
                  } else {
                    processedText = phrase
                      .replace(/^\d+\.\s*/, "")
                      .replace(/\*/g, "")
                      .replace(/\s\([^)]*\)/g, "")
                      .replace(/\s+/g, " ")
                      .replace(/\.{2,}/g, ".")
                      .replace(/[""]/g, '"')
                      .replace(/['']/, "'")
                      .trim();
                  }

                  const status = approvalStates[index] || "pending";

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-[16px] bg-gray-900/80 border border-gray-800 flex justify-between items-center group hover:bg-gray-900/90 transition-all"
                    >
                      {/* Phrase text */}
                      <div className="flex-1">
                        <p className="text-white text-lg">{processedText}</p>
                      </div>
                      
                      {/* Approval/Rejection buttons or status */}
                      <div className="ml-4 flex items-center space-x-2">
                        {status === "approved" ? (
                          <span className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold">
                            Approved
                          </span>
                        ) : status === "rejected" ? (
                          <span className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">
                            Rejected
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleTickClick(index)}
                              className="px-3 py-2 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                              aria-label="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleCrossClick(index)}
                              className="px-3 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              aria-label="Reject"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Main action button - dynamically changes based on state */}
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={
                (buttonState === 'generate' && (!formData.google_play && !formData.apple_app)) ||
                loading ||
                isGeneratingCreatives
              }
              className={getButtonStyles()}
            >
              {getButtonText()}
            </button>

            {/* Website URL input section */}
            <div className="space-y-2">
              <p className="text-white text-[16px]">
                Don&apos;t have the App Store/ Google Play Store Link? No worries!
              </p>
              <div className="relative">
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 pr-12 focus:outline-none focus:border-purple-500"
                  placeholder="Paste your Website Link Here"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 8L14 12L10 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Export the component
export default GeniusMarketingForm;