import  { useState } from 'react';


const AdPreview = () => {
  const [adContent, setAdContent] = useState({
    headline: '',
    description: '',
    imageUrl: '',
    linkUrl: ''
  });
  
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState('');

  const generatePreview = async () => {
    setLoading(true);
    // setError('');
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/act_6923617611097949/generatepreviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: "e921a46b134ebab4c33c0a2279e4cbe2",
            creative: {
              object_story_spec: {
                page_id: "433088776561334",
                link_data: {
                  link: adContent.linkUrl,
                  message: adContent.description,
                  name: adContent.headline,
                  image_url: adContent.imageUrl,
                  call_to_action: {
                    type: 'LEARN_MORE'
                  }
                }
              }
            },
            ad_format: 'DESKTOP_FEED_STANDARD'
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setPreview(data.data[0].body);
    // } catch (err) {
      // setError(`Failed to generate preview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Facebook Ad Preview</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Headline</label>
          <input
            type="text"
            value={adContent.headline}
            onChange={(e) => setAdContent({...adContent, headline: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Enter your headline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={adContent.description}
            onChange={(e) => setAdContent({...adContent, description: e.target.value})}
            className="w-full p-2 border rounded h-24"
            placeholder="Enter your ad description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            value={adContent.imageUrl}
            onChange={(e) => setAdContent({...adContent, imageUrl: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Enter image URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Destination URL</label>
          <input
            type="url"
            value={adContent.linkUrl}
            onChange={(e) => setAdContent({...adContent, linkUrl: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Enter destination URL"
          />
        </div>

        <button
          onClick={generatePreview}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Preview'}
        </button>
      </div>

      {/* {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}

      {preview && (
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="p-4 border-b bg-gray-50">
            <span className="text-sm text-gray-600">Ad Preview</span>
          </div>
          <div 
            className="p-4"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}
    </div>
  );
};

export default AdPreview;