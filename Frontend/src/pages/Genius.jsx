
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

const BASE_URL = "https://growth-with-growthz.onrender.com";

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
  const [formData, setFormData] = useState({
    google_play: "",
    apple_app: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * "phrases" will hold the entire response from generate-phrases:
   *   e.g. { status: "already_exists", appId, phrases: { phrases: [...] }, uspPhrases: [...] }
   */
  const [phrases, setPhrases] = useState(null);

  /**
   * approvalStates is an array parallel to `phrases.uspPhrases`.
   * Each element is "pending", "approved", or "rejected".
   */
  const [approvalStates, setApprovalStates] = useState([]);

  const [appId, setAppId] = useState(null);

  const [isGeneratingCreatives, setIsGeneratingCreatives] = useState(false);
  const [hasGeneratedCreatives, setHasGeneratedCreatives] = useState(false);

  // -----------------------------------------------------------
  // useEffect to handle "already_exists" or brand-new phrases
  // -----------------------------------------------------------
  useEffect(() => {
    if (!phrases) return; // do nothing if we haven't fetched phrases yet

    // (A) If the server says "already_exists" and we haven't set uspPhrases yet, do so once
    if (
      phrases.status === "already_exists" &&
      phrases.phrases &&
      phrases.phrases.phrases && // an array of { text, status }
      !phrases.uspPhrases // means we haven't inserted them yet
    ) {
      const dbPhrases = phrases.phrases.phrases;
      console.log("Existing phrases from DB:", dbPhrases);

      // Convert array of objects -> array of strings for the UI
      const phraseTexts = dbPhrases.map((item) => item.text);
      // statuses from DB
      const statesFromDB = dbPhrases.map((item) => item.status || "pending");

      // 1) Insert the array of texts into `phrases.uspPhrases`
      setPhrases((prev) => ({
        ...prev,
        uspPhrases: phraseTexts,
      }));

      // 2) Set local approvalStates to DB statuses
      setApprovalStates(statesFromDB);
    }
    // (B) If we have brand-new phrases (no "already_exists") but haven't set approval states yet
    else if (phrases.uspPhrases && approvalStates.length === 0) {
      console.log("Brand-new phrases => defaulting to 'pending'.");
      setApprovalStates(new Array(phrases.uspPhrases.length).fill("pending"));
    }
  }, [phrases, approvalStates.length]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form => fetch app details => generate phrases
  const handleSubmit = async () => {
    console.log("Submitting form data:", formData);
    try {
      setLoading(true);
      setError(null);
      setPhrases(null);

      // Get userId from Firebase Auth
      const auth = getAuth();
      const userEmail = auth.currentUser ? auth.currentUser.email : null;
      if (!userEmail) {
        throw new Error("User email is not available.");
      }
      console.log("User email:", userEmail);

      // Fetch userId from backend
      const userResponse = await fetch(
        `${BASE_URL}/api/users/get-user-by-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      if (!userResponse.ok) {
        throw new Error("Failed to fetch userId.");
      }
      const userData = await userResponse.json();
      const userId = userData._id;
      console.log("Fetched userId:", userId);

      // 1) Save app details
      console.log("Saving app details...");
      const savedApp = await saveAppDetails(formData);
      console.log("App saved successfully:", savedApp);

      const appIdFromResponse = savedApp._id;
      if (!appIdFromResponse) {
        throw new Error("App ID not returned from saveAppDetails.");
      }
      setAppId(appIdFromResponse);

      // 2) Generate phrases
      console.log("Generating phrases for app ID:", appIdFromResponse);
      const generatedPhrases = await generatePhrases(
        formData,
        appIdFromResponse,
        userId
      );
      console.log("Phrases generated successfully:", generatedPhrases);

      setPhrases(generatedPhrases);
    } catch (err) {
      setError(err.message);
      console.error("Error during form submission:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve a phrase
  const handleTickClick = async (index) => {
    if (!phrases || !phrases.uspPhrases) return;
    const phraseToApprove = phrases.uspPhrases[index];
    console.log(
      "handleTickClick - Approving phrase:",
      phraseToApprove,
      "App ID:",
      appId
    );

    try {
      await approvePhrase(phraseToApprove, appId);
      console.log("Phrase approved successfully:", phraseToApprove);

      const newStates = [...approvalStates];
      newStates[index] = "approved";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error approving phrase:", error.message);
      alert(error.message);
    }
  };

  // Reject a phrase
  const handleCrossClick = async (index) => {
    if (!phrases || !phrases.uspPhrases) return;
    const phraseToReject = phrases.uspPhrases[index];
    console.log(`Rejecting phrase at index ${index}:`, phraseToReject);
    try {
      await rejectPhrase(appId, phraseToReject);
      console.log("Phrase rejected successfully:", phraseToReject);

      const newStates = [...approvalStates];
      newStates[index] = "rejected";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error rejecting phrase:", error.message);
      alert(error.message);
    }
  };

  /**
   * Handle "Get Creatives" flow:
   * 1) Add 'Creatives' to tasks
   * 2) Create ads
   * 3) Show "Show Creatives" button
   */
  const handleGetCreatives = async () => {
    if (!appId) {
      alert("No App ID found. Please generate phrases first.");
      return;
    }

    try {
      setIsGeneratingCreatives(true);

      // re-fetch user
      const auth = getAuth();
      const userEmail = auth.currentUser ? auth.currentUser.email : null;
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

      console.log("Creating ads for appId:", appId);
      const adsResponse = await createAds(userId, appId);
      console.log("Ads creation response:", adsResponse);
      const animationsResponse = await createAnimations(userId, appId);
      console.log("Ads creation response:", animationsResponse);

      setHasGeneratedCreatives(true);
    } catch (err) {
      console.error("Error generating creatives:", err.message);
      alert(err.message);
    } finally {
      setIsGeneratingCreatives(false);
    }
  };

  // Show final creatives in the "Rainbow" page
  const handleShowCreatives = () => {
    if (appId) {
      localStorage.setItem("appId", appId);
    }
    window.location.href = "/rainbow";
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-full h-[80vh] overflow-hidden">
        <img
          src={frame}
          alt="Decorative Effect"
          className="absolute bottom-0 right-0 w-auto h-full object-contain"
        />
      </div>

      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-16">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="w-[120px] h-[25px] md:w-[131px] md:h-[32px]"
            />
          </button>
        </div>

        <div className="max-w-[847px] mx-auto space-y-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
              Genius
            </h2>
            <p className="text-gray-300">
              Create Brand Marketing Communication For Free!
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Google Play Input */}
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

            {/* Apple App Input */}
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

            {/* Error Message */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* If we have phrases => show them */}
            {phrases && phrases.uspPhrases && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {phrases.uspPhrases.map((phrase, index) => {
                  // Preprocess the text
                  let processedText;
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
                      <div className="flex-1">
                        <p className="text-white text-lg">{processedText}</p>
                      </div>
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

            {/* Button to Generate Ad Copies */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading || (!formData.google_play && !formData.apple_app)
              }
              className="w-full h-[70px] rounded-[16px] bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-black font-bold text-[20px] flex items-center justify-center gap-2 "
            >
              {loading ? "Processing..." : "Generate Ad Copies"}
            </button>

            {/* "Get Creatives" button: Only if phrases are present */}
            {phrases && phrases.uspPhrases && (
              <div className="flex flex-col items-center mt-6">
                {!hasGeneratedCreatives ? (
                  <button
                    onClick={handleGetCreatives}
                    disabled={isGeneratingCreatives}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg"
                  >
                    {isGeneratingCreatives
                      ? "Generating Creatives..."
                      : "Get Creatives"}
                  </button>
                ) : (
                  <button
                    onClick={handleShowCreatives}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg"
                  >
                    Show Creatives
                  </button>
                )}
              </div>
            )}

            {/* Website Link Input */}
            <div className="space-y-2">
              <p className="text-white text-[16px]">
                Don&apos;t have the App Store/ Google Play Store Link? No
                worries!
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

export default GeniusMarketingForm;