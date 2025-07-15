import React from "react";

export default function Categories() {
  const platforms = [
    {
      name: "Facebook",
      icon: "F",
      description:
        "Connect your profile and pages to earn from likes on your posts.",
      rate: "80¢ per like",
      payouts: "Instant payouts",
      bgColor: "bg-blue-600",
      borderColor: "border-blue-600",
    },
    {
      name: "TikTok",
      icon: "T",
      description: "Earn money from likes on your videos and trending content.",
      rate: "80¢ per like",
      payouts: "Instant payouts",
      bgColor: "bg-black",
      borderColor: "border-black",
    },
    {
      name: "Instagram",
      icon: "I",
      description:
        "Link your account and monetize likes on your photos and reels.",
      rate: "80¢ per like",
      payouts: "Instant payouts",
      bgColor: "bg-pink-600",
      borderColor: "border-pink-600",
    },
    {
      name: "YouTube",
      icon: "Y",
      description: "Get paid for likes on your videos and community posts.",
      rate: "80¢ per like",
      payouts: "Instant payouts",
      bgColor: "bg-red-600",
      borderColor: "border-red-600",
    },
    {
      name: "WhatsApp",
      icon: "W",
      description: "Monetize your business messages and group interactions.",
      rate: "80¢ per like",
      payouts: "Instant payouts",
      bgColor: "bg-green-600",
      borderColor: "border-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Supported Platforms
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect all your social media accounts and maximize your earnings
            across every platform.
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Colored top border */}
              <div className={`h-1 ${platform.bgColor}`}></div>

              {/* Card Content */}
              <div className="p-6">
                {/* Platform Icon and Name */}
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 ${platform.bgColor} rounded-full flex items-center justify-center text-white font-bold text-xl mr-4`}
                  >
                    {platform.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {platform.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {platform.description}
                </p>

                {/* Rate and Payouts */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{platform.rate}</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    {platform.payouts}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Button */}
        <div className="text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-sm">
            Connect Your Accounts
          </button>
        </div>
      </div>
    </div>
  );
}
