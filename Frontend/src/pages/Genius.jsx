import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  saveAppDetails,
  generatePhrases,
  generateWebsitePhrases,
  approvePhrase,
  rejectPhrase,
  addCreativeToTasks,
  createAds,
  createAnimations,
} from "../logic/genius/geniusApi.js";
import logo from "../assets/logo.png";
import frame from "../assets/Frame.png";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import CustomAlert from "../components/Alert.jsx";

const BASE_URL = "http://localhost:8000";

export default function GeniusMarketingForm() {
  const navigate = useNavigate();

  // Form fields for app or website
  const [formData, setFormData] = useState({
    google_play: "",
    apple_app: "",
    website: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };
  // Show/hide the website input field
  const [showWebsiteInput, setShowWebsiteInput] = useState(false);

  // Whether the phrases list is expanded
  const [isPhrasesExpanded, setIsPhrasesExpanded] = useState(true);

  // The phrases we get from the backend, plus their local approval states
  const [phrases, setPhrases] = useState(null);
  const [approvalStates, setApprovalStates] = useState([]);

  // We store either the "appId" (for app docs) or the "_id" (for website docs).
  const [appId, setAppId] = useState(null);

  /**
   * Button states:
   * "generateCopies" => "Generate Ad Copies"
   * "getCreatives"   => "Get Creatives"
   * "showCreatives"  => "Show Creatives"
   */
  const [buttonState, setButtonState] = useState("generateCopies");

  /**
   * Once we set phrases, we may need to fill or update the approvalStates array
   */
  useEffect(() => {
    if (!phrases) return;

    // If phrases are "already_exists" from an app
    if (phrases.status === "already_exists" && phrases.phrases?.phrases && !phrases.uspPhrases) {
      const dbPhrases = phrases.phrases.phrases;
      setPhrases((prev) => ({
        ...prev,
        uspPhrases: dbPhrases,
      }));
      setApprovalStates(dbPhrases.map((item) => item.status || "pending"));
    }
    // If phrases are new or from "uspPhrases"
    else if (phrases.uspPhrases && approvalStates.length === 0) {
      setApprovalStates(new Array(phrases.uspPhrases.length).fill("pending"));
    }
  }, [phrases]);

  /**
   * Input change handler
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Step 1) Generate Ad Copies
   */
  const handleGenerateAdCopies = async () => {
    // Trim user input
    const googlePlayUrl = formData.google_play.trim();
    const appleAppUrl = formData.apple_app.trim();
    const websiteUrl = formData.website.trim();

    // Must have at least one URL
    if (!googlePlayUrl && !appleAppUrl && !websiteUrl) {
      setError("Please provide at least one App URL or a Website URL.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user from Firebase
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

      let generatedPhrasesResponse;

      // If google_play or apple_app => call /generate-phrases
      if (googlePlayUrl || appleAppUrl) {
        // Save the app
        const savedApp = await saveAppDetails(formData, userId);
        if (!savedApp._id) {
          throw new Error("App ID not returned from saveAppDetails.");
        }
        // Store appId
        setAppId(savedApp._id);

        // Generate phrases for the app
        generatedPhrasesResponse = await generatePhrases(
          formData,
          savedApp._id,
          userId
        );
        console.log("Generated Phrases Response:", generatedPhrasesResponse);

      } else {
        // Otherwise, website => /generate-website-copies
        generatedPhrasesResponse = await generateWebsitePhrases(formData, userId);
        console.log("Generated Website Phrases Response:", generatedPhrasesResponse);
      }

      // Now handle different shapes of returned data
      if (Array.isArray(generatedPhrasesResponse)) {
        // Just an array of phrases
        setPhrases({ uspPhrases: generatedPhrasesResponse });
        setApprovalStates(new Array(generatedPhrasesResponse.length).fill("pending"));

      } else if (
        // "already_exists" for an app
        generatedPhrasesResponse.status === "already_exists" &&
        generatedPhrasesResponse.phrases?.phrases
      ) {
        const dbPhrases = generatedPhrasesResponse.phrases.phrases;
        setPhrases({
          status: "already_exists",
          phrases: { phrases: dbPhrases },
          uspPhrases: dbPhrases,
        });
        setApprovalStates(dbPhrases.map((item) => item.status || "pending"));

      } else if (generatedPhrasesResponse.uspPhrases) {
        // Direct "uspPhrases"
        setPhrases(generatedPhrasesResponse);
        setApprovalStates(
          new Array(generatedPhrasesResponse.uspPhrases.length).fill("pending")
        );

      } else if (
        generatedPhrasesResponse.status === "success" &&
        generatedPhrasesResponse.phrases
      ) {
        // success + phrases
        if (Array.isArray(generatedPhrasesResponse.phrases)) {
          setPhrases({ uspPhrases: generatedPhrasesResponse.phrases });
          setApprovalStates(
            new Array(generatedPhrasesResponse.phrases.length).fill("pending")
          );
        } else if (Array.isArray(generatedPhrasesResponse.phrases.phrases)) {
          setPhrases({ uspPhrases: generatedPhrasesResponse.phrases.phrases });
          setApprovalStates(
            new Array(generatedPhrasesResponse.phrases.phrases.length).fill(
              "pending"
            )
          );
        } else {
          console.warn("No phrase array found in .phrases!");
        }

      } else if (
        // "already_exists" for a website
        generatedPhrasesResponse.status === "already_exists" &&
        generatedPhrasesResponse.adCopies &&
        Array.isArray(generatedPhrasesResponse.adCopies.phrases)
      ) {
        console.log("Found existing website-based doc:", generatedPhrasesResponse.adCopies);
        setPhrases({
          status: "already_exists",
          adCopies: generatedPhrasesResponse.adCopies,
          uspPhrases: generatedPhrasesResponse.adCopies.phrases,
        });
        setApprovalStates(
          generatedPhrasesResponse.adCopies.phrases.map(
            (item) => item.status || "pending"
          )
        );
        // If we need the doc's _id for approvals
        if (generatedPhrasesResponse.adCopies._id) {
          setAppId(generatedPhrasesResponse.adCopies._id);
        }

      } else if (
        // success + adCopies => website scenario
        generatedPhrasesResponse.status === "success" &&
        generatedPhrasesResponse.adCopies &&
        Array.isArray(generatedPhrasesResponse.adCopies.phrases)
      ) {
        console.log("Handling website-based adCopies (new doc)...");
        // Set doc's _id for approvals
        if (generatedPhrasesResponse.adCopies._id) {
          setAppId(generatedPhrasesResponse.adCopies._id);
        }
        setPhrases({ uspPhrases: generatedPhrasesResponse.adCopies.phrases });
        setApprovalStates(
          new Array(generatedPhrasesResponse.adCopies.phrases.length).fill("pending")
        );

      } else {
        console.warn("No recognized phrase array in the response.");
      }

      // Now that we have some phrases, move to the next step
      setButtonState("getCreatives");
    } catch (err) {
      setError(err.message);
      console.error("Error during form submission:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2) Generate Creatives
   */
  const handleGenerateCreatives = async () => {
    // Usually only relevant if we saved an app with appId
    // If you also handle "website creatives," you could skip or adapt this
    if (!appId) {
      showAlert("No App ID found. Please generate phrases first (or store doc ID).");
      return;
    }

    try {
      setIsPhrasesExpanded(false);
      setLoading(true);

      // Get user from Firebase
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

      // Add tasks, create ads, create animations
      await addCreativeToTasks(userId, appId);
      await createAds(userId, appId);
      await createAnimations(userId, appId);

      setButtonState("showCreatives");
    } catch (err) {
      console.error("Error generating creatives:", err.message);
      showAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3) Show Creatives Page
   */
  const handleShowCreatives = () => {
    if (appId) {
      localStorage.setItem("appId", appId);
      navigate("/rainbow");
    }
  };

  /**
   * Single button that triggers the appropriate step
   */
  const handleMainButtonClick = () => {
    if (loading) return;
    if (buttonState === "generateCopies") handleGenerateAdCopies();
    else if (buttonState === "getCreatives") handleGenerateCreatives();
    else if (buttonState === "showCreatives") handleShowCreatives();
  };

  /**
   * Approve a phrase
   */
  const handleTickClick = async (index) => {
    if (!phrases?.uspPhrases) return;

    const phraseObjOrString = phrases.uspPhrases[index];
    const phraseText =
      typeof phraseObjOrString === "object" ? phraseObjOrString.text : phraseObjOrString;

    try {
      const userId = localStorage.getItem('loggedInMongoUserId');
      await approvePhrase(phraseText, appId, userId);
      const newStates = [...approvalStates];
      newStates[index] = "approved";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error approving phrase:", error.message);
      showAlert(error.message);
    }
  };

  /**
   * Reject a phrase
   */
  const handleCrossClick = async (index) => {
    if (!phrases?.uspPhrases) return;

    const phraseObjOrString = phrases.uspPhrases[index];
    const phraseText =
      typeof phraseObjOrString === "object" ? phraseObjOrString.text : phraseObjOrString;

    try {
      const userId = localStorage.getItem('loggedInMongoUserId');
      await rejectPhrase(phraseText, appId, userId);
      const newStates = [...approvalStates];
      newStates[index] = "rejected";
      setApprovalStates(newStates);
    } catch (error) {
      console.error("Error rejecting phrase:", error.message);
      showAlert(error.message);
    }
  };

  // Debug logs
  useEffect(() => {
    console.log("Current phrases state:", phrases);
    console.log("Current approval states:", approvalStates);
    console.log("Button State:", buttonState);
  }, [phrases, approvalStates, buttonState]);

  /**
   * Decide the main button label
   */
  const getButtonLabel = () => {
    if (loading) return "Processing...";
    if (buttonState === "generateCopies") return "Generate Ad Copies";
    if (buttonState === "getCreatives") return "Get Creatives";
    if (buttonState === "showCreatives") return "Show Creatives";
    return "Generate Ad Copies";
  };

  // For the first step, require at least one URL
  const hasAnyURL =
    formData.google_play.trim() ||
    formData.apple_app.trim() ||
    formData.website.trim();
  const isButtonDisabled =
    loading || (buttonState === "generateCopies" && !hasAnyURL);

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

            {/* Apple App Store Input */}
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

            {/* Website Collapsible Section */}
            <div>
              <div className="text-white">
                Don&apos;t have an app?{" "}
                <button
                  type="button"
                  onClick={() => setShowWebsiteInput(!showWebsiteInput)}
                  className="text-blue-500 underline"
                >
                  Click here
                </button>{" "}
                to get Ad copies for your website
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${showWebsiteInput ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="space-y-2">
                <p className="text-white text-[16px]">Enter your website URL!</p>
                <div className="relative">
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full h-[70px] rounded-[16px] bg-gray-900/80 border border-gray-800 text-gray-300 px-4 pr-12 focus:outline-none focus:border-purple-500 placeholder:text-gray-600"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Display Error if any */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* Display Phrases */}
            {phrases?.uspPhrases && (
              <div className="space-y-4">
                <button
                  onClick={() => setIsPhrasesExpanded(!isPhrasesExpanded)}
                  className="w-full flex items-center justify-between bg-gray-900/80 p-4 rounded-t-[16px] border border-gray-800 hover:bg-gray-900/90 transition-all cursor-pointer"
                >
                  <div className="flex-1 flex justify-center">
                    <h3 className="text-2xl font-semibold text-white">
                      Press ✓ to get the creative assets
                    </h3>
                  </div>
                  <div className="text-white">
                    {isPhrasesExpanded ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out space-y-4 overflow-y-auto scrollbar-custom ${isPhrasesExpanded
                      ? "max-h-[60vh] opacity-100"
                      : "max-h-0 opacity-0"
                    }`}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4865F4 #374151",
                  }}
                >
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
              </div>
            )}

            {/* Single button for the 3 steps */}
            <button
              type="button"
              onClick={handleMainButtonClick}
              disabled={isButtonDisabled}
              className="w-full h-[70px] rounded-[16px] bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-black font-bold text-[20px] flex items-center justify-center gap-2"
            >
              {getButtonLabel()}
            </button>
          </form>
        </div>
      </div>
      <CustomAlert
              isOpen={isAlertOpen}
              message={alertMessage}
              onClose={() => setIsAlertOpen(false)}
            />
    </div>
  );
}
