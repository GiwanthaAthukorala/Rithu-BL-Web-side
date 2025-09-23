"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// Icons
import {
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Image,
  Facebook,
  Youtube,
  MessageSquare,
  Star,
  Filter,
  Search,
  Download,
  Eye,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [submissions, setSubmissions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    platform: "all",
    status: "all",
    page: 1,
    search: "",
  });

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      fetchStatistics();
      fetchSubmissions();
    } else {
      router.push("/admin/login");
    }
  }, [user, filter]);

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/admin/statistics");
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.platform !== "all") params.append("platform", filter.platform);
      if (filter.status !== "all") params.append("status", filter.status);
      params.append("page", filter.page.toString());

      const response = await api.get(`/admin/submissions?${params}`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (
    platform,
    id,
    status,
    rejectionReason = ""
  ) => {
    try {
      await api.put(`/admin/submissions/${platform}/${id}/status`, {
        status,
        rejectionReason,
      });
      fetchSubmissions();
      fetchStatistics();
    } catch (error) {
      console.error("Failed to update submission:", error);
    }
  };

  const deleteSubmission = async (platform, id) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      try {
        await api.delete(`/admin/submissions/${platform}/${id}`);
        fetchSubmissions();
        fetchStatistics();
      } catch (error) {
        console.error("Failed to delete submission:", error);
      }
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "youtube":
        return <Youtube className="w-4 h-4" />;
      case "google":
        return <Star className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName} ({user.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: Users },
              { id: "submissions", label: "Submissions", icon: Image },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Image className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Submissions
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.totalSubmissions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Earnings Paid
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        Rs {statistics.totalEarnings.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Pending Reviews
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.pendingSubmissions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Statistics */}
            {statistics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Platform Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(statistics.platformStats).map(
                    ([platform, stats]) => (
                      <div key={platform} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {platform.replace("_", " ")}
                        </h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Approved:</span>
                            <span className="font-medium">
                              {stats.find((s) => s._id === "approved")?.count ||
                                0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium">
                              {stats.find((s) => s._id === "pending")?.count ||
                                0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Rejected:</span>
                            <span className="font-medium">
                              {stats.find((s) => s._id === "rejected")?.count ||
                                0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Submissions
              </h2>

              {/* Filters */}
              <div className="flex space-x-4">
                <select
                  value={filter.platform}
                  onChange={(e) =>
                    setFilter({ ...filter, platform: e.target.value, page: 1 })
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Platforms</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="google">Google</option>
                </select>

                <select
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value, page: 1 })
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {submissions.submissions?.map((submission) => (
                    <li key={`${submission.platform}-${submission._id}`}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          {/* Screenshot Thumbnail */}
                          <div className="flex-shrink-0 h-16 w-16 mr-4">
                            <img
                              className="h-16 w-16 object-cover rounded border"
                              src={submission.screenshot}
                              alt="Submission screenshot"
                              onClick={() =>
                                window.open(submission.screenshot, "_blank")
                              }
                              style={{ cursor: "pointer" }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              {getPlatformIcon(submission.platform)}
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {submission.platform} {submission.type}
                              </span>
                              <span
                                className={getStatusBadge(submission.status)}
                              >
                                {submission.status}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600">
                              User: {submission.user?.firstName}{" "}
                              {submission.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Email: {submission.user?.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: Rs {submission.amount}
                            </p>
                            <p className="text-sm text-gray-500">
                              Submitted:{" "}
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Action Buttons */}
                          {submission.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateSubmissionStatus(
                                    `${submission.platform}_${submission.type}`,
                                    submission._id,
                                    "approved"
                                  )
                                }
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt("Rejection reason:");
                                  if (reason) {
                                    updateSubmissionStatus(
                                      `${submission.platform}_${submission.type}`,
                                      submission._id,
                                      "rejected",
                                      reason
                                    );
                                  }
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              window.open(submission.screenshot, "_blank")
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              deleteSubmission(
                                `${submission.platform}_${submission.type}`,
                                submission._id
                              )
                            }
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {submissions.pagination && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page {submissions.pagination.currentPage} of{" "}
                          {submissions.pagination.totalPages}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setFilter({ ...filter, page: filter.page - 1 })
                          }
                          disabled={!submissions.pagination.hasPrev}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setFilter({ ...filter, page: filter.page + 1 })
                          }
                          disabled={!submissions.pagination.hasNext}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
