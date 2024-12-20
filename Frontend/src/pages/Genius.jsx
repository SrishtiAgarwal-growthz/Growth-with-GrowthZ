import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { saveAppDetails, generatePhrases, approvePhrase, rejectPhrase } from "../logic/genius/geniusApi.js";

const BASE_URL = 'https://growth-with-growthz.onrender.com';

const GeniusMarketingForm = () => {
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

  // Initialize approval states when phrases arrive
  useEffect(() => {
    if (phrases && phrases.uspPhrases) {
      console.log("Phrases received:", phrases.uspPhrases);
      setApprovalStates(new Array(phrases.uspPhrases.length).fill("pending"));
    }
  }, [phrases]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form and fetch app details and phrases
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

      // Fetch userId from backend using email
      const userResponse = await fetch(`${BASE_URL}/api/users/get-user-by-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch userId.");
      }

      const userData = await userResponse.json();
      const userId = userData._id;

      console.log("Fetched userId:", userId);

      // Save app details
      console.log("Saving app details...");
      const savedApp = await saveAppDetails(formData);
      console.log("App saved successfully:", savedApp);
      const appIdFromResponse = savedApp._id;
      if (!appIdFromResponse) {
        throw new Error("App ID not returned from saveAppDetails.");
      }
      setAppId(appIdFromResponse);

      // Generate phrases
      console.log("Generating phrases for app ID:", appIdFromResponse);
      const generatedPhrases = await generatePhrases(formData, appIdFromResponse, userId);
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
    const phraseToApprove = phrases.uspPhrases[index];
    console.log("handleTickClick - Approving phrase:", phraseToApprove, "App ID:", appId); // Debug here

    try {
      await approvePhrase(phraseToApprove, appId);
      console.log("Phrase approved successfully:", phraseToApprove);

      const newStates = [...approvalStates];
      newStates[index] = "approved";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error approving phrase:", error.message);
    }
  };


  // Reject a phrase
  const handleCrossClick = async (index) => {
    const phraseToReject = phrases.uspPhrases[index];
    console.log(`Rejecting phrase at index ${index}:`, phraseToReject);
    try {
      await rejectPhrase(appId, phraseToReject);
      console.log("Phrase rejected successfully:", phraseToReject);

      const newStates = [...approvalStates];
      newStates[index] = "pending";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error rejecting phrase:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-blue-900/20 transform rotate-[-10deg] translate-y-1/4" />

      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-16">
          <h1 className="text-white text-xl font-semibold">growthZ.ai</h1>
          <span className="text-sm text-gray-400">Dashboard</span>
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

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {phrases && phrases.uspPhrases && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {phrases.uspPhrases.map((phrase, index) => {
                  let processedText;

                  if (index === 0) {
                    // For the first element, just remove the leading "## " and no Approve button
                    if (/^##\s*/.test(phrase)) {
                      processedText = phrase.replace(/^##\s*/, '').trim();
                    } else {
                      processedText = "20 Unique Selling Ad Copies";
                    }

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-[16px] bg-gray-900/80 border border-gray-800 flex justify-center items-center group hover:bg-gray-900/90 transition-all"
                      >
                        <p className="text-white text-lg font-bold text-center">
                          {processedText}
                        </p>
                      </div>
                    );
                  } else {
                    // For subsequent elements, do the full processing
                    processedText = phrase
                      .replace(/^\d+\.\s*/, '')       // Remove numbering if present
                      .replace(/\*/g, '')             // Remove all asterisks
                      .replace(/\s\([^)]*\)/g, '')    // Remove parenthetical text
                      .replace(/\s+/g, ' ')           // Normalize spaces
                      .replace(/\.{2,}/g, '.')        // Fix multiple dots
                      .replace(/[""]/g, '"')          // Normalize quotes
                      .replace(/['']/, "'")           // Normalize apostrophes
                      .trim();                        // Remove extra spaces

                    const approvalState = approvalStates[index];

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-[16px] bg-gray-900/80 border border-gray-800 flex justify-between items-center group hover:bg-gray-900/90 transition-all"
                      >
                        <div className="flex-1">
                          <p className="text-white text-lg">{processedText}</p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          {approvalState === 'approved' ? (
                            <span className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold">
                              Approved
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
                  }
                })}
              </div>
            )}


            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading || (!formData.google_play && !formData.apple_app)
              }
              className="w-full h-[70px] rounded-[16px] bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-white font-bold text-[20px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Generate Ad Copies
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
                </>
              )}
            </button>

            <div className="space-y-2">
              <p className="text-white text-[16px]">
                Don&apos;t have the App Store/ Google Play Store Link, No worries !
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
