import { useState, useEffect } from "react";

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


  useEffect(() => {
    if (phrases && phrases.uspPhrases) {
      // Initialize all states to 'pending' when phrases arrive
      setApprovalStates(new Array(phrases.uspPhrases.length).fill('pending'));
    }
  }, [phrases]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setPhrases(null);
  
      // 1. Save the app
      const saveAppResponse = await fetch('http://localhost:8000/api/app/save-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_play: formData.google_play,
          apple_app: formData.apple_app
        })
      });
  
      if (!saveAppResponse.ok) {
        const errorData = await saveAppResponse.json();
        throw new Error(errorData.message || 'Failed to save app details');
      }
  
      const saveAppData = await saveAppResponse.json();
console.log("Full response:", saveAppData);

      
      const appIdFromResponse = saveAppData._id;
      console.log("this is AppID:", appIdFromResponse);
      
      setAppId(appIdFromResponse); // Store appId in state
  
      // 2. Generate phrases
      const phrasesResponse = await fetch('http://localhost:8000/api/reviews/generate-phrases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_play: formData.google_play,
          apple_app: formData.apple_app,
          app_id: appIdFromResponse
        })
      });
  
      if (!phrasesResponse.ok) {
        const errorData = await phrasesResponse.json();
        throw new Error(errorData.message || 'Failed to generate phrases');
      }
  
      const phrasesData = await phrasesResponse.json();
      console.log(phrasesData);
      
      setPhrases(phrasesData);
  
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTickClick = async (index) => {
    const newStates = [...approvalStates];
    newStates[index] = 'approved';
    setApprovalStates(newStates);
  
    try {
      const response = await fetch('http://localhost:8000/api/communications/approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: appId, // Use the dynamic appId
          text: phrases.uspPhrases[index]
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to approve the phrase');
      }
  
      const result = await response.json();
      console.log('Approval response:', result);
    } catch (error) {
      console.error('Error during approval:', error.message);
    }
  };
  
  const handleCrossClick = async (index) => {
    const newStates = [...approvalStates];
    newStates[index] = 'pending';
    setApprovalStates(newStates);
  
    try {
      const response = await fetch('http://localhost:8000/api/communications/rejected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: appId, // Use the dynamic appId
          text: phrases.uspPhrases[index]
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to reject the phrase');
      }
  
      const result = await response.json();
      console.log('Rejection response:', result);
    } catch (error) {
      console.error('Error during rejection:', error.message);
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
                Enter Google play store URL
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
                Enter App store URL
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
              className="w-full h-[70px] rounded-[16px] bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-black font-bold text=[20px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Make Creatives
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
