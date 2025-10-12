"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  ExternalLink,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

const SmartVideoPlayer = ({ video, onClose, onTimeUpdate, sessionId }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [useExternalPlayer, setUseExternalPlayer] = useState(false);
  const [externalWindow, setExternalWindow] = useState(null);
  const timeIntervalRef = useRef(null);
  const externalTimerRef = useRef(null);

  // Platform configuration
  const platformConfig = {
    youtube: {
      embeddable: true,
      icon: <Youtube size={20} className="text-red-500" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    facebook: {
      embeddable: false, // Facebook embedding is complex, use external
      icon: <Facebook size={20} className="text-blue-500" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    instagram: {
      embeddable: false,
      icon: <Instagram size={20} className="text-pink-500" />,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
    tiktok: {
      embeddable: false,
      icon: <MessageCircle size={20} className="text-black" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const config = platformConfig[video.platform] || platformConfig.youtube;

  useEffect(() => {
    if (useExternalPlayer && externalWindow) {
      startExternalTimeTracking();
    }

    return () => {
      clearInterval(timeIntervalRef.current);
      clearInterval(externalTimerRef.current);
      if (externalWindow && !externalWindow.closed) {
        externalWindow.close();
      }
    };
  }, [useExternalPlayer, externalWindow]);

  const startExternalTimeTracking = () => {
    let seconds = 0;
    externalTimerRef.current = setInterval(() => {
      seconds += 1;
      setCurrentTime(seconds);

      // Send progress update every 5 seconds
      if (seconds % 5 === 0) {
        onTimeUpdate(seconds);
      }

      // Check if video duration reached
      if (seconds >= video.duration) {
        completeVideo();
      }
    }, 1000);
  };

  const startTimeTracking = () => {
    let seconds = 0;
    timeIntervalRef.current = setInterval(() => {
      seconds += 1;
      setCurrentTime(seconds);

      // Send progress update
      if (seconds % 5 === 0) {
        onTimeUpdate(seconds);
      }

      if (seconds >= video.duration) {
        completeVideo();
      }
    }, 1000);
  };

  const completeVideo = () => {
    clearInterval(timeIntervalRef.current);
    clearInterval(externalTimerRef.current);
    setIsCompleted(true);
    onTimeUpdate(video.duration, true); // Final update
  };

  const openExternalPlayer = () => {
    const windowFeatures =
      "width=800,height=600,menubar=no,toolbar=no,location=no";
    const newWindow = window.open(video.videoUrl, "_blank", windowFeatures);

    if (newWindow) {
      setExternalWindow(newWindow);
      setUseExternalPlayer(true);
      startExternalTimeTracking();
    } else {
      alert("Please allow popups for this website to watch the video.");
    }
  };

  // YouTube Player
  const renderYouTubePlayer = () => {
    // Extract YouTube ID from URL
    const extractYouTubeId = (url) => {
      const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    };

    const videoId = extractYouTubeId(video.videoUrl);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;

    return (
      <div className="w-full h-96 rounded-2xl overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
          onLoad={startTimeTracking}
        />
      </div>
    );
  };

  // External Platform Player
  const renderExternalPlatformPlayer = () => (
    <div
      className={`w-full h-96 rounded-2xl overflow-hidden ${config.bgColor} border-2 ${config.borderColor} flex flex-col items-center justify-center p-8 text-center`}
    >
      <div className="text-4xl mb-4">{config.icon}</div>

      <h3 className="text-2xl font-bold text-gray-800 mb-4">{video.title}</h3>

      <p className="text-gray-600 mb-2">
        Watch on{" "}
        {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
      </p>

      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Click below to open the video in a new tab. Time tracking will continue
        automatically.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={openExternalPlayer}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Play size={20} />
          <span>Open Video</span>
          <ExternalLink size={16} />
        </button>

        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-600 transition-all duration-300 shadow-lg"
        >
          Cancel
        </button>
      </div>

      {useExternalPlayer && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-xl">
          <div className="flex items-center text-green-700">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
            <span className="font-medium">
              Time tracking active - {formatTime(currentTime)} /{" "}
              {formatTime(video.duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return (currentTime / video.duration) * 100;
  };

  return (
    <div className="relative">
      {/* Platform Header */}
      <div className="absolute top-4 left-4 bg-black/75 text-white px-4 py-2 rounded-full flex items-center space-x-2 z-10">
        {config.icon}
        <span className="text-sm font-medium capitalize">{video.platform}</span>
      </div>

      {/* Video Player */}
      {config.embeddable
        ? renderYouTubePlayer()
        : renderExternalPlatformPlayer()}

      {/* Progress Tracking */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>
            Progress: {formatTime(currentTime)} / {formatTime(video.duration)}
          </span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {isCompleted && (
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center text-green-700">
              <CheckCircle size={20} className="mr-2" />
              <span className="font-medium">
                Video Completed! Rs {video.rewardAmount} earned!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded-xl">
        <p className="text-blue-800 text-sm text-center">
          💡 <strong>Keep this window open</strong> while watching to receive
          your Rs {video.rewardAmount} reward
        </p>
      </div>
    </div>
  );
};

export default SmartVideoPlayer;
