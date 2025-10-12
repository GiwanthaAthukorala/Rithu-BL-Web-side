"use client";

import React, { useState, useEffect } from "react";
import {
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  ExternalLink,
  Play,
  AlertCircle,
} from "lucide-react";

const SmartVideoPlayer = ({ video, onClose, onTimeUpdate }) => {
  const [showEmbedWarning, setShowEmbedWarning] = useState(false);
  const [useExternalPlayer, setUseExternalPlayer] = useState(false);

  // Check if platform supports embedding
  const supportsEmbedding = video.platform === "youtube" && video.embedUrl;

  useEffect(() => {
    // For non-embeddable platforms, show warning after a delay
    if (!supportsEmbedding && !useExternalPlayer) {
      const timer = setTimeout(() => {
        setShowEmbedWarning(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [supportsEmbedding, useExternalPlayer]);

  // YouTube Player (Embedded)
  const renderYouTubePlayer = () => (
    <div className="w-full h-96 rounded-2xl overflow-hidden">
      <iframe
        src={video.embedUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={video.title}
      />
    </div>
  );

  // External Platform Player (with preview and open option)
  const renderExternalPlatformPlayer = () => (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-8 text-center">
      {/* Platform Preview */}
      <div className="text-6xl mb-4">
        {video.platform === "facebook" && "📘"}
        {video.platform === "instagram" && "📷"}
        {video.platform === "tiktok" && "🎵"}
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-4">{video.title}</h3>

      <p className="text-gray-600 mb-2">
        Ready to watch on{" "}
        {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
      </p>

      <p className="text-sm text-gray-500 mb-6 max-w-md">
        This video will open in a new tab. Don't worry - time tracking continues
        automatically in the background!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            window.open(video.videoUrl, "_blank", "noopener,noreferrer");
            setUseExternalPlayer(true);
          }}
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

      {/* Progress indicator */}
      {useExternalPlayer && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-xl">
          <div className="flex items-center text-green-700">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
            <span className="font-medium">
              Time tracking active - watching in background
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Platform warning for non-embeddable content
  const renderEmbedWarning = () => (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-xl animate-pulse">
      <div className="flex items-center text-yellow-800">
        <AlertCircle size={20} className="mr-2 flex-shrink-0" />
        <div>
          <p className="font-medium">Platform Restriction</p>
          <p className="text-sm">
            {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}{" "}
            doesn't allow embedded playback. Click "Open Video" to watch in a
            new tab.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Platform Header */}
      <div className="absolute top-4 left-4 bg-black/75 text-white px-4 py-2 rounded-full flex items-center space-x-2 z-10">
        {video.platform === "youtube" && (
          <Youtube size={20} className="text-red-500" />
        )}
        {video.platform === "facebook" && (
          <Facebook size={20} className="text-blue-500" />
        )}
        {video.platform === "instagram" && (
          <Instagram size={20} className="text-pink-500" />
        )}
        {video.platform === "tiktok" && (
          <MessageCircle size={20} className="text-white" />
        )}
        <span className="text-sm font-medium capitalize">{video.platform}</span>
      </div>

      {/* Video Player */}
      {supportsEmbedding
        ? renderYouTubePlayer()
        : renderExternalPlatformPlayer()}

      {/* Warning for non-embeddable platforms */}
      {!supportsEmbedding &&
        showEmbedWarning &&
        !useExternalPlayer &&
        renderEmbedWarning()}

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
