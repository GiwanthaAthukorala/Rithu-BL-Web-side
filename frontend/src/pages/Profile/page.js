"use client";

import React, { useEffect, useState } from "react";
import { User, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header/Header";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation"; // Updated import
import api from "@/lib/api";
import { io } from "socket.io-client";

export default function Profile() {
  //const [totalEarned, setTotalEarned] = useState(500.0);
  const [availableBalance, setAvailableBalance] = useState(500.0);
  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pendingWithdrawal: 0,
    withdrawnAmount: 0,
    transactions: [],
  });
  const [isEarningLoading, setIsEarningLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchEarnings = async () => {
      try {
        const response = await api.get("/api/earnings");
        setEarnings(response.data);
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    };

    fetchEarnings();

    // Set up Socket.io for real-time updates
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("register", user._id);
    });

    socket.on("earningsUpdate", (updatedEarnings) => {
      setEarnings(updatedEarnings);
    });

    socket.on("withdrawalProcessed", ({ earnings, transaction }) => {
      setEarnings(earnings);
      // Update the specific transaction in state
      setEarnings((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t._id === transaction._id ? transaction : t
        ),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > earnings.availableBalance) {
      setError("Amount exceeds available balance");
      return;
    }

    setIsEarningLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/earnings/withdraw", {
        amount: parseFloat(withdrawAmount),
      });

      setEarnings(response.data.earnings);
      setIsWithdrawModalOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsEarningLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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

            {/* Earnings Summary */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Your Earnings</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Earned</p>
                    <p className="text-2xl font-bold">
                      Rs{earnings.totalEarned.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      Rs{earnings.availableBalance.toFixed(2)}
                    </p>
                  </div>

                  {earnings.pendingWithdrawal > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Pending Withdrawal
                      </p>
                      <p className="text-xl font-bold text-yellow-600">
                        Rs{earnings.pendingWithdrawal.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Total Withdrawn</p>
                    <p className="text-xl font-bold">
                      Rs{earnings.withdrawnAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={earnings.availableBalance <= 0}
                  className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center ${
                    earnings.availableBalance > 0
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <DollarSign size={20} className="mr-2" />
                  Withdraw Funds
                </button>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Withdrawal Rules</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Minimum withdrawal: Rs500
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Processed within 3-5 business days
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    No withdrawal fees
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="font-semibold">Withdraw Funds</h3>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

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
                    max={earnings.availableBalance}
                    min="500"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Maximum: Rs${earnings.availableBalance.toFixed(
                      2
                    )}`}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Available balance: Rs{earnings.availableBalance.toFixed(2)}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setError(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Processing..." : "Request Withdrawal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
