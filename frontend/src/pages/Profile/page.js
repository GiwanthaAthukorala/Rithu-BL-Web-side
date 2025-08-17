import React, { useState } from "react";
import {
  User,
  DollarSign,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";

export default function Profile() {
  const [earnings, setEarnings] = useState({
    totalEarned: 2400,
    availableBalance: 1500,
    pendingWithdrawal: 500,
    withdrawnAmount: 1200,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock user data
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+94 77 123 4567",
    bankName: "Commercial Bank",
    bankBranch: "Colombo 03",
    bankAccountNo: "1234567890",
  };

  const formatCurrency = (value) => (value || 0).toFixed(2);

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

    // Simulate API call
    setTimeout(() => {
      setEarnings((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance - amount,
        pendingWithdrawal: prev.pendingWithdrawal + amount,
      }));
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("500");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Beautiful Header */}
      <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          {/* Top Header */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TaskPay</h1>
                  <p className="text-xs text-gray-500">Earn & Withdraw</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-blue-600 font-medium"
                >
                  <User size={18} />
                  <span>Profile</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </a>
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                <div className="hidden md:flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4">
              <nav className="space-y-4">
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-blue-600 font-medium"
                >
                  <User size={20} />
                  <span>Profile</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </a>
                <hr className="border-gray-200" />
                <a
                  href="#"
                  className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Profile
          </h1>
          <p className="text-lg text-gray-600">
            Complete tasks by visiting links and uploading proof to earn
            rewards.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-blue-100">{user?.email}</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="text-gray-900">{user?.phoneNumber}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Bank
                    </label>
                    <p className="text-gray-900">{user?.bankName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Branch
                    </label>
                    <p className="text-gray-900">{user?.bankBranch}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account No
                    </label>
                    <p className="text-gray-900 font-mono">
                      {user?.bankAccountNo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <DollarSign className="mr-3" size={28} />
                  Your Earnings
                </h2>
              </div>

              <div className="p-6">
                {isFetching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                        <p className="text-sm font-medium text-blue-700 mb-2">
                          Total Approved Tasks
                        </p>
                        <p className="text-3xl font-bold text-blue-900">
                          {Math.round(earnings.totalEarned / 0.8)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                        <p className="text-sm font-medium text-purple-700 mb-2">
                          Total Earned
                        </p>
                        <p className="text-3xl font-bold text-purple-900">
                          Rs {formatCurrency(earnings.totalEarned)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                        <p className="text-sm font-medium text-green-700 mb-2">
                          Available Balance
                        </p>
                        <p className="text-3xl font-bold text-green-900">
                          Rs {formatCurrency(earnings.availableBalance)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6">
                        <p className="text-sm font-medium text-amber-700 mb-2">
                          Total Withdrawn
                        </p>
                        <p className="text-3xl font-bold text-amber-900">
                          Rs {formatCurrency(earnings.withdrawnAmount)}
                        </p>
                      </div>
                    </div>

                    {earnings.pendingWithdrawal > 0 && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Pending Withdrawal
                            </p>
                            <p className="text-xl font-bold text-yellow-900">
                              Rs {formatCurrency(earnings.pendingWithdrawal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Withdraw Button */}
                    <button
                      onClick={() => {
                        setIsWithdrawModalOpen(true);
                        setError(null);
                      }}
                      disabled={earnings.availableBalance < 500}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
                        earnings.availableBalance >= 500
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <DollarSign size={24} className="mr-2" />
                      Withdraw Funds
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Withdrawal Rules */}
            <div className="bg-white rounded-2xl shadow-xl mt-6 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Withdrawal Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-700 font-bold">500</span>
                  </div>
                  <p className="text-sm font-medium text-green-800">
                    Minimum Rs 500
                  </p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-700 font-bold">3-5</span>
                  </div>
                  <p className="text-sm font-medium text-blue-800">
                    Business Days
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-700 font-bold">0%</span>
                  </div>
                  <p className="text-sm font-medium text-purple-800">No Fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-in fade-in-0 zoom-in-95">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">Withdraw Funds</h3>
              <p className="text-blue-100 text-sm mt-1">
                Request a withdrawal to your bank account
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              <label className="block text-sm font-bold text-gray-700 mb-3">
                Amount to withdraw
              </label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  Rs
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="500"
                  max={earnings.availableBalance}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                  placeholder={`Max: Rs${formatCurrency(
                    earnings.availableBalance
                  )}`}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">Available balance</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs {formatCurrency(earnings.availableBalance)}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setError(null);
                    setWithdrawAmount("500");
                  }}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Request Withdrawal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
