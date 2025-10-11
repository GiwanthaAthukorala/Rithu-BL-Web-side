"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/Context/AuthContext";
import { useSocket } from "@/Context/SocketContext";
import api from "@/lib/api";
import {
  Play,
  Clock,
  DollarSign,
  CheckCircle,
  X,
  AlertCircle,
  History,
  Video,
  Sparkles,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
import Header from "@/components/Header/Header";

export default function VideoRewards() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [imageErrors, setImageErrors] = useState({});
  const [trackingSession, setTrackingSession] = useState(null);
  const [secondsWatched, setSecondsWatched] = useState(0);

  const trackingTimerRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    fetchAvailableVideos();
    fetchWatchHistory();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("videoCompleted", handleVideoCompleted);
      return () => {
        socket.off("videoCompleted", handleVideoCompleted);
      };
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (trackingTimerRef.current) {
        clearInterval(trackingTimerRef.current);
      }
    };
  }, []);

  const fetchAvailableVideos = async () => {
    try {
      const response = await api.get("/videos/available");
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Fetch videos error:", error);
      setError("Failed to load videos");
    }
  };

  const fetchWatchHistory = async () => {
    try {
      const response = await api.get("/videos/history");
      setWatchHistory(response.data.data || []);
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  const startVideoSession = async (video) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(`/videos/${video._id}/start`);
      const session = response.data.data;

      setCurrentVideo(video);
      setTrackingSession(session);
      setSecondsWatched(0);

      startTimeTracking(session.sessionId, video.duration);
    } catch (error) {
      console.error("Start session error:", error);
      setError(
        error.response?.data?.message || "Failed to start video session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startTimeTracking = (sessionId, duration) => {
    let localSeconds = 0;

    trackingTimerRef.current = setInterval(async () => {
      localSeconds += 1;
      setSecondsWatched(localSeconds);

      try {
        if (localSeconds % 5 === 0 || localSeconds >= duration) {
          const response = await api.put(
            `/videos/session/${sessionId}/progress`,
            {
              currentTime: localSeconds,
            }
          );

          if (response.data.data.status === "completed") {
            console.log("Video marked as completed in backend");
            completeTracking(sessionId, true);
            return;
          }
        }

        if (localSeconds >= duration) {
          console.log("Video completed locally, sending final update");
          await api.put(`/videos/session/${sessionId}/progress`, {
            currentTime: duration,
          });
          completeTracking(sessionId, false);
        }
      } catch (error) {
        console.error("Progress update error:", error);
      }
    }, 1000);
  };

  const completeTracking = (sessionId, immediate = false) => {
    if (trackingTimerRef.current) {
      clearInterval(trackingTimerRef.current);
      trackingTimerRef.current = null;
    }

    if (!immediate) {
      setTimeout(() => {
        setTrackingSession(null);
        setCurrentVideo(null);
        setSecondsWatched(0);
        fetchAvailableVideos();
        fetchWatchHistory();
      }, 2000);
    } else {
      setTrackingSession(null);
      setCurrentVideo(null);
      setSecondsWatched(0);
      fetchAvailableVideos();
      fetchWatchHistory();
    }
  };

  const handleVideoCompleted = (data) => {
    setSuccess(
      `Congratulations! You earned Rs ${data.amount} for watching "${data.videoTitle}"!`
    );

    fetchAvailableVideos();
    fetchWatchHistory();

    setTimeout(() => setSuccess(null), 8000);
  };

  const stopTracking = () => {
    if (trackingTimerRef.current) {
      clearInterval(trackingTimerRef.current);
      trackingTimerRef.current = null;
    }
    setTrackingSession(null);
    setCurrentVideo(null);
    setSecondsWatched(0);
  };

  const closeVideo = () => {
    stopTracking();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!currentVideo) return 0;
    return (secondsWatched / currentVideo.duration) * 100;
  };

  const handleImageError = (videoId) => {
    setImageErrors((prev) => ({
      ...prev,
      [videoId]: true,
    }));
  };

  const getThumbnailUrl = (video) => {
    if (imageErrors[video._id]) {
      return null;
    }
    return video.thumbnailUrl;
  };

  const hasUserWatchedVideo = (videoId) => {
    return watchHistory.some(
      (session) =>
        session.video?._id === videoId && session.status === "completed"
    );
  };

  const totalEarned = watchHistory
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + (session.amountEarned || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 relative overflow-hidden">
      <Header />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Enhanced Header with stats */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="text-yellow-500 animate-pulse" size={28} />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mx-3">
              Watch & Earn Platform
            </h1>
            <Sparkles className="text-yellow-500 animate-pulse" size={28} />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your time into money! Watch engaging videos and earn
            instant rewards.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                  <DollarSign className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                Rs {totalEarned}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                  <Eye className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {watchHistory.filter((s) => s.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Videos Watched</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {videos.length}
              </div>
              <div className="text-sm text-gray-600">Available Videos</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-red-200 text-red-700 shadow-lg flex items-center justify-between animate-slideIn">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-xl mr-3">
                <AlertCircle size={24} />
              </div>
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-green-200 text-green-700 shadow-lg flex items-center justify-between animate-slideIn">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-xl mr-3">
                <CheckCircle size={24} />
              </div>
              <span className="font-medium">{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Video Player Modal */}
        {currentVideo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white p-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentVideo.title}</h3>
                    <p className="text-purple-100 flex items-center mt-1">
                      <Sparkles size={16} className="mr-1" />
                      Earn Rs {currentVideo.rewardAmount} by watching
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeVideo}
                  className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Video Player */}
              <div className="p-8">
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <iframe
                    src={currentVideo.videoUrl}
                    className="w-full h-96"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentVideo.title}
                  ></iframe>
                </div>

                {/* Enhanced Progress Tracking */}
                <div className="mt-1 p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="text-purple-600" size={20} />
                      <span className="text-lg font-bold text-gray-800">
                        {formatTime(secondsWatched)} /{" "}
                        {formatTime(currentVideo.duration)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="text-pink-600" size={20} />
                      <span className="text-lg font-bold text-gray-800">
                        {Math.round(getProgressPercentage())}% Complete
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${getProgressPercentage()}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  {secondsWatched >= currentVideo.duration && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg animate-slideIn">
                      <div className="flex items-center justify-center text-white">
                        <CheckCircle size={24} className="mr-3" />
                        <span className="text-lg font-bold">
                          🎉 Video Completed! Rs {currentVideo.rewardAmount}{" "}
                          earned!
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-md">
                  <p className="text-yellow-800 font-medium text-center flex items-center justify-center">
                    <AlertCircle size={18} className="mr-2" />
                    Keep this window open until completion to receive your
                    reward
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-xl border border-purple-200">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === "available"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Video size={20} />
                <span>Available Videos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-2">
                <History size={20} />
                <span>Watch History</span>
              </div>
            </button>
          </div>
        </div>

        {/* Available Videos */}
        {activeTab === "available" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Clock size={48} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No Videos Available Right Now
                </h3>
                <p className="text-gray-500 text-lg">
                  You've completed all available videos! Check back soon for
                  fresh content.
                </p>
              </div>
            ) : (
              videos.map((video) => {
                const isWatched = hasUserWatchedVideo(video._id);
                if (isWatched) return null;

                return (
                  <div
                    key={video._id}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-purple-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                      {getThumbnailUrl(video) ? (
                        <img
                          src={getThumbnailUrl(video)}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={() => handleImageError(video._id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Video
                              size={48}
                              className="text-purple-300 mx-auto mb-3"
                            />
                            <p className="text-sm text-purple-400 font-medium">
                              Video Preview
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                        <Clock size={16} className="mr-1" />
                        {formatTime(video.duration)}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
                        <DollarSign size={16} className="mr-1" />
                        Rs {video.rewardAmount}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                        {video.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                        {video.description}
                      </p>

                      <button
                        onClick={() => startVideoSession(video)}
                        disabled={isLoading || currentVideo}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-2"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play size={20} className="mr-2" />
                            Watch & Earn Rs {video.rewardAmount}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Watch History */}
        {activeTab === "history" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-200 overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                    <History className="mr-3 text-purple-600" size={32} />
                    Your Watch History
                  </h2>
                  <p className="text-gray-600 text-lg flex items-center">
                    <Award className="mr-2 text-green-500" size={20} />
                    Total earned:{" "}
                    <span className="font-bold text-green-600 ml-2">
                      Rs {totalEarned}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-purple-100">
              {watchHistory.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <History size={40} className="text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3">
                    No Watch History Yet
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Start watching videos to build your earning history!
                  </p>
                </div>
              ) : (
                watchHistory.map((session) => (
                  <div
                    key={session._id}
                    className="p-6 hover:bg-purple-50/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">
                          {session.video?.title}
                        </h4>
                        <div className="flex items-center flex-wrap gap-4 text-sm">
                          <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock size={14} className="mr-1" />
                            {formatTime(session.watchDuration)}
                          </span>
                          {session.amountEarned > 0 && (
                            <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full font-bold">
                              <DollarSign size={14} className="mr-1" />
                              Rs {session.amountEarned}
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              session.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : session.status === "watching"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {session.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-700">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Enhanced Instructions */}
        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center">
            <AlertCircle size={28} className="mr-3" />
            How It Works
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-200 rounded-lg mt-1">
                <Play size={20} className="text-yellow-700" />
              </div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Step 1: Choose
                </div>
                <div className="text-yellow-700 text-sm">
                  Click "Watch & Earn" to start any video
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-200 rounded-lg mt-1">
                <Eye size={20} className="text-yellow-700" />
              </div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Step 2: Watch
                </div>
                <div className="text-yellow-700 text-sm">
                  Watch for 1 minute to complete
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-200 rounded-lg mt-1">
                <DollarSign size={20} className="text-yellow-700" />
              </div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Step 3: Earn
                </div>
                <div className="text-yellow-700 text-sm">
                  Get Rs 1 added automatically
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-200 rounded-lg mt-1">
                <CheckCircle size={20} className="text-yellow-700" />
              </div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Step 4: Repeat
                </div>
                <div className="text-yellow-700 text-sm">
                  Watch more videos to earn more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
