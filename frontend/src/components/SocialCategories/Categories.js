"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SupportedPlatforms = () => {
  const router = useRouter();

  const handleConnect = (platformName) => {
    alert(`Connecting to ${platformName}`);
    // Or use: router.push(`/connect/${platformName.toLowerCase()}`);
  };

  return (
    <section className="py-16 px-4 text-center bg-white">
      <h2 className="text-3xl font-bold mb-2">Supported Platforms</h2>
      <p className="text-gray-600 mb-10 max-w-xl mx-auto">
        Connect all your social media accounts and maximize your earnings across
        every platform.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
        {/* Facebook */}
        <Link href="/facebook-verification/page">
          <div className="cursor-pointer bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold mr-3">
                F
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Facebook</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Connect your profile and pages to earn from likes on your posts.
            </p>
            <div className="text-sm text-gray-500">
              Rs 0.80 like or follwing • Instant payouts
            </div>
          </div>
        </Link>

        {/* TikTok */}
        <Link href="/facebook-verification/page">
          <div className="cursor-pointer bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-bold mr-3">
                T
              </div>
              <h3 className="text-lg font-semibold text-gray-900">TikTok</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Earn money from likes on your videos and trending content.
            </p>
            <div className="text-sm text-gray-500">
              80¢ per like • Instant payouts
            </div>
          </div>
        </Link>

        {/* Instagram */}
        <Link href="/facebook-verification/page">
          <div className="cursor-pointer bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white font-bold mr-3">
                I
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Link your account and monetize likes on your photos and reels.
            </p>
            <div className="text-sm text-gray-500">
              80¢ per like • Instant payouts
            </div>
          </div>
        </Link>

        {/* YouTube */}
        <Link href="/facebook-verification/page">
          <div className="cursor-pointer bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white font-bold mr-3">
                Y
              </div>
              <h3 className="text-lg font-semibold text-gray-900">YouTube</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Get paid for likes on your videos and community posts.
            </p>
            <div className="text-sm text-gray-500">
              Rs 0.80 like or follwing • Instant payouts
            </div>
          </div>
        </Link>

        {/* WhatsApp */}
        <Link href="/facebook-verification/page">
          <div className="cursor-pointer bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white font-bold mr-3">
                W
              </div>
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Monetize your business messages and group interactions.
            </p>
            <div className="text-sm text-gray-500">
              Rs 0.80 like • Instant payouts
            </div>
          </div>
        </Link>
      </div>

      <button className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">
        Connect Your Accounts
      </button>
    </section>
  );
};

export default SupportedPlatforms;
