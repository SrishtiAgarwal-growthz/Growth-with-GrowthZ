
import { Share } from 'lucide-react';

const GoogleAdsMockup = () => {
  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Add padding-top to account for the notch */}
      <div className="pt-8">
        {/* Google Search Bar */}
        <div className="p-2 bg-neutral-800">
          <div className="flex items-center">
            <div className="text-white text-sm">google.com</div>
            <div className="ml-auto">
              <Share className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Content Area with Skeleton Loading */}
        <div className="flex-1 overflow-y-auto">
          {/* Skeleton Text at Top */}
          <div className="p-4 space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Advertisement Block */}
          <div className="p-4">
            <div className="bg-purple-600 rounded-lg overflow-hidden">
              {/* Ad Content */}
              <div className="p-6 space-y-4">
                <div className="text-white text-lg font-bold">zepto</div>
                <div className="text-white text-xl font-bold">
                  bath & body essentials
                  <div className="text-sm font-normal mt-1">at lowest prices</div>
                </div>
                <div className="flex justify-end">
                  <button className="bg-neutral-800 text-white px-6 py-2 rounded-lg">
                    GET
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* More Skeleton Text at Bottom */}
          <div className="p-4 space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-neutral-800 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-neutral-800 rounded w-4/5 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsMockup;