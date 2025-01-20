import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  saveAppDetails,
  generatePhrases,
  approvePhrase,
  rejectPhrase,
  addCreativeToTasks,
  createAds,
  createAnimations,
} from "../logic/genius/geniusApi.js";
import logo from "../assets/logo.png";
import frame from "../assets/Frame.png";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8000";

const GeniusMarketingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    google_play: "",
    apple_app: "",
    website: "",
  });
  const [error, setError] = useState(null);

  // This single loading flag is used for both generating phrases & creatives
  const [loading, setLoading] = useState(false);
  const [showWebsiteInput, setShowWebsiteInput] = useState(false);
  // State to hold phrases and their approval status
  const [phrases, setPhrases] = useState(null);
  const [approvalStates, setApprovalStates] = useState([]);

  // State for app ID
  const [appId, setAppId] = useState(null);

  /**
   * buttonState can be:
   *  "generateCopies"  -> show "Generate Ad Copies"
   *  "getCreatives"    -> show "Get Creatives"
   *  "showCreatives"   -> show "Show Creatives"
   */
  const [buttonState, setButtonState] = useState("generateCopies");

  // Effect to handle phrases and approval states
  useEffect(() => {
    if (!phrases) return;

    // If phrases already exist in the database
    if (phrases.status === "already_exists" && phrases.phrases?.phrases) {
      const dbPhrases = phrases.phrases.phrases;
      const phraseItems = dbPhrases.map((item) => item);
      const statesFromDB = dbPhrases.map((item) => item.status || "pending");

      setPhrases((prev) => ({
        ...prev,
        uspPhrases: phraseItems,
      }));
      setApprovalStates(statesFromDB);
    }
    // If phrases are new
    else if (phrases.uspPhrases && approvalStates.length === 0) {
      setApprovalStates(new Array(phrases.uspPhrases.length).fill("pending"));
    }
  }, [phrases, approvalStates.length]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 1) Generate Ad Copies
   */
  const handleGenerateAdCopies = async () => {
    // Validate
    if (!formData.google_play && !formData.apple_app) {
      setError("Please provide at least one app store URL.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user email from Firebase Auth
      const auth = getAuth();
      const userEmail = auth.currentUser?.email;
      if (!userEmail) throw new Error("User email is not available.");

      // Fetch user ID from backend
      const userResponse = await fetch(`${BASE_URL}/api/users/get-user-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!userResponse.ok) throw new Error("Failed to fetch userId.");
      const userData = await userResponse.json();
      const userId = userData._id;

      // Save app details
      const savedApp = await saveAppDetails(formData);
      if (!savedApp._id)
        throw new Error("App ID not returned from saveAppDetails.");
      setAppId(savedApp._id);

      // Generate phrases
      const generatedPhrases = await generatePhrases(
        formData,
        savedApp._id,
        userId
      );
      console.log("Generated Phrases Response:", generatedPhrases);

      // --- Different ways the backend might return phrases ---
      if (Array.isArray(generatedPhrases)) {
        // 1) If backend returns an array of strings
        setPhrases({ uspPhrases: generatedPhrases });
        setApprovalStates(new Array(generatedPhrases.length).fill("pending"));
      } else if (
        generatedPhrases.status === "already_exists" &&
        generatedPhrases.phrases?.phrases
      ) {
        // 2) If phrases already exist
        const dbPhrases = generatedPhrases.phrases.phrases;
        setPhrases({
          status: "already_exists",
          phrases: { phrases: dbPhrases },
          uspPhrases: dbPhrases,
        });
        setApprovalStates(dbPhrases.map((item) => item.status || "pending"));
      } else if (generatedPhrases.uspPhrases) {
        // 3) If there's a direct array in generatedPhrases.uspPhrases
        setPhrases(generatedPhrases);
        setApprovalStates(
          new Array(generatedPhrases.uspPhrases.length).fill("pending")
        );
      } else if (
        generatedPhrases.status === "success" &&
        generatedPhrases.phrases
      ) {
        // 4) If we have status="success" and .phrases is an array or object
        console.log("generatedPhrases.phrases content:", generatedPhrases.phrases);
        if (Array.isArray(generatedPhrases.phrases)) {
          setPhrases({ uspPhrases: generatedPhrases.phrases });
          setApprovalStates(
            new Array(generatedPhrases.phrases.length).fill("pending")
          );
        } else if (Array.isArray(generatedPhrases.phrases.phrases)) {
          setPhrases({ uspPhrases: generatedPhrases.phrases.phrases });
          setApprovalStates(
            new Array(generatedPhrases.phrases.phrases.length).fill("pending")
          );
        } else {
          console.warn("No phrase array found in generatedPhrases.phrases!");
        }
      } else {
        console.warn("No recognized phrase array in the response.");
      }

      // Now that we have phrases, move to the next step => "Get Creatives"
      setButtonState("getCreatives");
    } catch (err) {
      setError(err.message);
      console.error("Error during form submission:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2) Generate Creatives
   */
  const handleGenerateCreatives = async () => {
    if (!appId) {
      alert("No App ID found. Please generate phrases first.");
      return;
    }

    try {
      setLoading(true);

      // Fetch user ID
      const auth = getAuth();
      const userEmail = auth.currentUser?.email;
      if (!userEmail) throw new Error("User email is not available.");

      const userResponse = await fetch(`${BASE_URL}/api/users/get-user-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!userResponse.ok) throw new Error("Failed to fetch userId.");
      const userData = await userResponse.json();
      const userId = userData._id;

      // Add creatives to tasks and create ads/animations
      await addCreativeToTasks(userId, appId);
      await createAds(userId, appId);
      await createAnimations(userId, appId);

      // Once creatives are ready, change button to "Show Creatives"
      setButtonState("showCreatives");
    } catch (err) {
      console.error("Error generating creatives:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3) Show Creatives Page
   */
  const handleShowCreatives = () => {
    if (appId) {
      localStorage.setItem("appId", appId);
      navigate("/rainbow");
    }
  };

  /**
   * A single onClick handler for the unified button
   */
  const handleMainButtonClick = () => {
    if (loading) return; // Prevent multiple clicks while loading

    if (buttonState === "generateCopies") {
      handleGenerateAdCopies();
    } else if (buttonState === "getCreatives") {
      handleGenerateCreatives();
    } else if (buttonState === "showCreatives") {
      handleShowCreatives();
    }
  };

  // Approve a phrase
  const handleTickClick = async (index) => {
    if (!phrases?.uspPhrases) return;

    const phraseObjOrString = phrases.uspPhrases[index];
    const phraseText =
      typeof phraseObjOrString === "object"
        ? phraseObjOrString.text
        : phraseObjOrString;

    try {
      await approvePhrase(phraseText, appId);

      // Update approval state to "approved"
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
    if (!phrases?.uspPhrases) return;

    const phraseObjOrString = phrases.uspPhrases[index];
    const phraseText =
      typeof phraseObjOrString === "object"
        ? phraseObjOrString.text
        : phraseObjOrString;

    try {
      await rejectPhrase(appId, phraseText);
      const newStates = [...approvalStates];
      newStates[index] = "rejected";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error rejecting phrase:", error.message);
      alert(error.message);
    }
  };

  // Debug logs
  useEffect(() => {
    console.log("Current phrases state:", phrases);
    console.log("Current approval states:", approvalStates);
    console.log("Button State:", buttonState);
  }, [phrases, approvalStates, buttonState]);

  // Decide button label based on buttonState
  const getButtonLabel = () => {
    if (loading) return "Processing...";
    if (buttonState === "generateCopies") return "Generate Ad Copies";
    if (buttonState === "getCreatives") return "Get Creatives";
    if (buttonState === "showCreatives") return "Show Creatives";
    return "Generate Ad Copies"; // Fallback
  };

  // Decide if we disable the button:
  // In the first step, only enable if we have google_play or apple_app
  const isButtonDisabled =
    loading ||
    (buttonState === "generateCopies" &&
      !formData.google_play &&
      !formData.apple_app);

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
                className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 focus:outline-none focus:border-purple-500 placeholder:text-gray-600"
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
                className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 focus:outline-none focus:border-purple-500 placeholder:text-gray-600"
                placeholder="https://apps.apple.com/in/app/..."
              />
            </div>

            <div className="">
              <div   
                // onClick={() => setShowWebsiteInput(!showWebsiteInput)}
                className="text-white"
              >
                Don&apos;t have an app? <button
                type="button"
                onClick={() => setShowWebsiteInput(!showWebsiteInput)}
                className="text-blue-500 	text-decoration-line: underline"
                >
                Click here
                  </button> to get Ad copies for your website
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showWebsiteInput ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-2">
                <p className="text-white text-[16px]">
                  Enter you website URL!
                </p>
                <div className="relative">
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 pr-12 focus:outline-none focus:border-purple-500 placeholder:text-gray-600"
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
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* Display Phrases */}
            {phrases?.uspPhrases && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {phrases.uspPhrases.map((phraseObjOrString, index) => {
                  const text =
                    typeof phraseObjOrString === "object"
                      ? phraseObjOrString.text
                      : phraseObjOrString;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-[16px] bg-gray-900/80 border border-gray-800 flex justify-between items-center group hover:bg-gray-900/90 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-white text-lg">{text}</p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {approvalStates[index] === "approved" ? (
                          <button
                            type="button"
                            className="px-3 py-2 rounded-lg border border-green-500 text-green-500"
                            disabled
                          >
                            Approved
                          </button>
                        ) : approvalStates[index] === "rejected" ? (
                          <button
                            type="button"
                            className="px-3 py-2 rounded-lg border border-red-500 text-red-500"
                            disabled
                          >
                            Rejected
                          </button>
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

            {/* Single Button handling all steps */}
            <button
              type="button"
              onClick={handleMainButtonClick}
              disabled={isButtonDisabled}
              className="w-full h-[70px] rounded-[16px] bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-black font-bold text-[20px] flex items-center justify-center gap-2"
            >
              {getButtonLabel()}
            </button>

            {/* Website Link Input */}
           
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeniusMarketingForm;