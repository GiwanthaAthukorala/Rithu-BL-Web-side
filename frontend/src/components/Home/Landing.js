export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-white space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Get Paid for Your Social Media Activity
            </h1>
            <p className="text-xl text-blue-100 max-w-lg">
              Earn 80¢ for every like on your content across multiple platforms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
              Start Earning Now
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Content - Phone Mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Phone Frame */}
            <div
              className="bg-gray-100 rounded-3xl p-2 shadow-2xl"
              style={{ width: "320px", height: "640px" }}
            >
              {/* Status Bar */}
              <div className="bg-gray-200 rounded-t-2xl px-4 py-2 flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Screen Content */}
              <div
                className="bg-white rounded-b-2xl p-6 space-y-4"
                style={{ height: "580px" }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Today's Earnings
                  </h2>
                  <span className="text-green-600 font-bold text-lg">
                    +$24.80
                  </span>
                </div>

                {/* Earnings Chart Area */}
                <div className="bg-gray-50 rounded-xl p-4 h-32 mb-6">
                  <div className="w-full h-full bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg opacity-50"></div>
                </div>

                {/* Platform Earnings */}
                <div className="space-y-4">
                  {/* Instagram */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-gray-700">
                        Instagram
                      </span>
                    </div>
                    <span className="text-green-600 font-bold">+$11.20</span>
                  </div>

                  {/* TikTok */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-gray-700">TikTok</span>
                    </div>
                    <span className="text-green-600 font-bold">+$7.20</span>
                  </div>

                  {/* Twitter */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-gray-700">Twitter</span>
                    </div>
                    <span className="text-green-600 font-bold">+$6.40</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
