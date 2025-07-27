"use client";

import React, { useEffect, useState } from "react";
import { User, DollarSign } from "lucide-react";
import Header from "@/components/Header/Header";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSocket } from "@/Context/SocketContext";

export default function Profile() {
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pendingWithdrawal: 0,
    withdrawnAmount: 0,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Changed from setLoading to setIsFetching
  const [error, setError] = useState(null);

  const { user, isAuthLoading } = useAuth();
  const socket = useSocket();
  const router = useRouter();

  const formatCurrency = (value) => (value || 0).toFixed(2);

  const fetchEarnings = async () => {
    try {
      setIsFetching(true); // Changed from setLoading to setIsFetching
      setError(null);

      const response = await api.get("/earnings");

      if (response.data?.success) {
        setEarnings(
          response.data.data || {
            totalEarned: 0,
            availableBalance: 0,
            pendingWithdrawal: 0,
            withdrawnAmount: 0,
          }
        );
      } else {
        throw new Error(response.data?.message || "Invalid earnings data");
      }
    } catch (err) {
      console.error("Fetch earnings error:", err);
      setError(err.response?.data?.message || "Failed to load earnings");
      setEarnings({
        totalEarned: 0,
        availableBalance: 0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } finally {
      setIsFetching(false); // Changed from setLoading to setIsFetching
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchEarnings();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("register", user._id);

    const handleEarningsUpdate = (updated) => {
      setEarnings((prev) => ({
        ...prev,
        ...updated,
      }));
    };

    socket.on("earningsUpdate", handleEarningsUpdate);

    return () => {
      socket.off("earningsUpdate", handleEarningsUpdate);
    };
  }, [socket, user?._id]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount < 500) {
      setError("Minimum withdrawal amount is Rs 500");
      return;
    }

    if (amount > earnings.availableBalance) {
      setError("Amount exceeds available balance");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/earnings/withdraw", { amount });
      const updated = response.data?.earnings;
      if (updated) {
        setEarnings(updated);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount("500");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !user) {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600">
            Complete tasks by visiting links and uploading proof to earn
            rewards.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="bg-blue-600 text-white p-4 flex items-center">
            <User size={20} className="mr-2" />
            <span className="font-semibold">User Profile</span>
          </div>

          <div className="p-6">
            {/* User Info */}
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

            {/* Bank Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Bank Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">
                  <strong>Bank:</strong> {user?.bankName}
                </p>
                <p className="text-gray-700">
                  <strong>Branch:</strong> {user?.bankBranch}
                </p>
                <p className="text-gray-700">
                  <strong>Account No:</strong> {user?.bankAccountNo}
                </p>
              </div>
            </div>

            {/* Earnings */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-4">Your Earnings</h2>

              {isFetching ? ( // Changed from fetching to isFetching
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Total Approved Submissions
                  </p>
                  <p className="text-xl font-bold">
                    {Math.round(earnings.totalEarned / 0.8)}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Earned</p>
                      <p className="text-2xl font-bold">
                        Rs{formatCurrency(earnings.totalEarned)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Available Balance</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rs{formatCurrency(earnings.availableBalance)}
                      </p>
                    </div>

                    {earnings.pendingWithdrawal > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Pending Withdrawal
                        </p>
                        <p className="text-xl font-bold text-yellow-600">
                          Rs{formatCurrency(earnings.pendingWithdrawal)}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Total Withdrawn</p>
                      <p className="text-xl font-bold">
                        Rs{formatCurrency(earnings.withdrawnAmount)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsWithdrawModalOpen(true);
                      setError(null);
                    }}
                    disabled={earnings.availableBalance < 500}
                    className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center ${
                      earnings.availableBalance >= 500
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <DollarSign size={20} className="mr-2" />
                    Withdraw Funds
                  </button>
                </>
              )}
            </div>

            {/* Withdrawal Rules */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Withdrawal Rules</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Minimum withdrawal: Rs500</li>
                <li>✓ Processed within 3-5 business days</li>
                <li>✓ No withdrawal fees</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
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

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to withdraw
              </label>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  Rs
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="500"
                  max={earnings.availableBalance}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={`Max: Rs${formatCurrency(
                    earnings.availableBalance
                  )}`}
                />
              </div>

              <div className="text-sm text-gray-500 mb-4">
                Available balance: Rs{formatCurrency(earnings.availableBalance)}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setError(null);
                    setWithdrawAmount("500");
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
