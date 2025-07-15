"use client"; // Must be the very first line

import React, { useEffect, useState } from "react";
import { User, DollarSign } from "lucide-react";
import Header from "@/components/Header/Header";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation"; // Updated import

export default function Profile() {
  const [totalEarned, setTotalEarned] = useState(500.0);
  const [availableBalance, setAvailableBalance] = useState(500.0);
  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isLoading && !user) {
      router.push("/Log-in/page");
    }
  }, [isLoading, user, router]);

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will handle the redirect
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= availableBalance) {
      setAvailableBalance((prev) => prev - amount);
      setWithdrawAmount(
        availableBalance - amount > 0
          ? (availableBalance - amount).toFixed(2)
          : "0"
      );
      setIsWithdrawModalOpen(false);
    }
  };

  const handleWithdrawClick = () => {
    setWithdrawAmount(availableBalance.toFixed(2));
    setIsWithdrawModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <Header />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600">
            Complete tasks by visiting links and uploading proof to earn
            rewards.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* User Profile Header */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center">
              <User size={20} className="mr-2" />
              <span className="font-semibold">User Profile</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-blue-600">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">{user?.phoneNumber}</p>
              </div>
            </div>

            {/* User Bank Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Bank Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">
                  <span className="font-medium">Bank:</span> {user?.bankName}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Branch:</span>{" "}
                  {user?.bankBranch}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Account No:</span>{" "}
                  {user?.bankAccountNo}
                </p>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Earnings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Total Earned
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rs{totalEarned.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Available Balance
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rs{availableBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleWithdrawClick}
                disabled={availableBalance <= 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                  availableBalance > 0
                    ? "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <DollarSign size={20} className="inline mr-2" />
                Withdraw Funds
              </button>

              <button
                onClick={logout}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Withdraw Modal */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              {/* Modal Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <h3 className="font-semibold">Withdraw Funds</h3>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to withdraw
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      Rs
                    </span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={availableBalance}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Available balance: Rs{availableBalance.toFixed(2)}
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > availableBalance
                    }
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                      withdrawAmount &&
                      parseFloat(withdrawAmount) > 0 &&
                      parseFloat(withdrawAmount) <= availableBalance
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
