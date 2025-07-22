import React, { useState, useEffect } from "react";

import api from "@/lib/api";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import Header from "@/components/Header/Header";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submissions");
  const [rejectionReason, setRejectionReason] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [subsRes, wdRes] = await Promise.all([
          api.get("/api/admin/submissions"),
          api.get("/api/admin/withdrawals"),
        ]);
        setSubmissions(subsRes.data);
        setWithdrawals(wdRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApproveSubmission = async (submissionId) => {
    try {
      await api.put(`/api/admin/submissions/${submissionId}/approve`);
      setSubmissions(submissions.filter((sub) => sub._id !== submissionId));
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleRejectSubmission = async (submissionId) => {
    if (!rejectionReason) return;

    try {
      await api.put(`/api/admin/submissions/${submissionId}/reject`, {
        reason: rejectionReason,
      });
      setSubmissions(submissions.filter((sub) => sub._id !== submissionId));
      setRejectionReason("");
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId, action) => {
    try {
      await api.put(`/api/admin/withdrawals/${withdrawalId}`, { action });
      setWithdrawals(withdrawals.filter((wd) => wd._id !== withdrawalId));
    } catch (error) {
      console.error("Withdrawal processing failed:", error);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
            <h2 className="text-xl font-bold mb-4">Access Denied</h2>
            <p>You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`py-2 px-4 font-medium ${
              activeTab === "submissions"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`py-2 px-4 font-medium ${
              activeTab === "withdrawals"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Withdrawals ({withdrawals.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === "submissions" ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pending submissions
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <li key={submission._id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={submission.screenshot}
                          alt="Submission"
                          className="h-16 w-16 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {submission.user.firstName}{" "}
                            {submission.user.lastName}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Platform: {submission.platform}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted:{" "}
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleApproveSubmission(submission._id)
                          }
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Reject this submission?")) {
                              handleRejectSubmission(submission._id);
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pending withdrawals
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <li key={withdrawal._id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {withdrawal.user.firstName}{" "}
                            {withdrawal.user.lastName}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Amount: Rs{withdrawal.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Bank: {withdrawal.bankDetails.name} (
                          {withdrawal.bankDetails.account})
                        </p>
                        <p className="text-sm text-gray-500">
                          Requested:{" "}
                          {new Date(withdrawal.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleProcessWithdrawal(withdrawal._id, "approve")
                          }
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Reason for rejection:");
                            if (reason) {
                              handleProcessWithdrawal(withdrawal._id, "reject");
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
