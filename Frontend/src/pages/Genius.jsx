import { useState } from 'react';

const GeniusMarketingForm = () => {
  const [formData, setFormData] = useState({
    google_play: '',
    apple_app: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phrases, setPhrases] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setPhrases(null);

      // Make both API calls concurrently
      const [saveAppResponse, phrasesResponse] = await Promise.all([
        // First API call - save app details
        fetch('http://localhost:8000/api/app/save-app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            google_play: formData.google_play,
            apple_app: formData.apple_app
          })
        }),
        
        // Second API call - generate phrases
        fetch('http://localhost:8000/api/reviews/generate-phrases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            google_play: formData.google_play,
            apple_app: formData.apple_app
          })
        })
      ]);

      // Check if either response failed
      if (!saveAppResponse.ok || !phrasesResponse.ok) {
        const errorData = !saveAppResponse.ok 
          ? await saveAppResponse.json() 
          : await phrasesResponse.json();
        throw new Error(errorData.message || 'Failed to process request');
      }

      // Parse both responses
      const [saveAppData, phrasesData] = await Promise.all([
        saveAppResponse.json(),
        phrasesResponse.json()
      ]);

      console.log('App Saved:', saveAppData);
      console.log('Phrases Generated:', phrasesData);
      
      // Store phrases in state for display
      setPhrases(phrasesData);
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
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

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            {phrases && (
              <div className="bg-gray-900/80 p-4 rounded-[16px] border border-gray-800">
                <h3 className="text-white font-semibold mb-2">Generated Phrases:</h3>
                <div className="text-gray-300">
                  {typeof phrases === 'object' 
                    ? JSON.stringify(phrases, null, 2)
                    : phrases}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (!formData.google_play && !formData.apple_app)}
              className="w-full h-[70px] rounded-[16px] bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-black font-bold text=[20px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  Show me The Ad
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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