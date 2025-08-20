"use client";

import { useState } from "react";
import { X, HelpCircle, Smartphone, Settings, Safari } from "lucide-react";

export default function IOSInstructions() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Smartphone className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">
              iPhone/iPad Instructions
            </h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Allow Pop-ups</h4>
              <p className="text-sm text-gray-600 mt-1">
                Go to Settings → Safari → disable "Block Pop-ups"
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Safari className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                Open Links Manually
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                If links don't open automatically, press and hold the link, then
                select "Open"
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Need Help?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Contact support if you continue to experience issues
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
