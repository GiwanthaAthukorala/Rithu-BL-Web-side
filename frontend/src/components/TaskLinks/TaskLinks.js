"use client";

import { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";

export default function TaskLinks({ platform, onLinkClick }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const { user } = useAuth();
  const clickTimers = useRef({});

  useEffect(() => {
    // Detect iOS devices
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    console.log("Is iOS device:", isIOSDevice);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, platform, retryCount]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/links/${platform}`);

      if (response.data.success) {
        setLinks(response.data.data);
      } else {
        setError(response.data.message || "Failed to load links");
      }
    } catch (err) {
      console.error("Error fetching links:", err);
      setError(err.message || "Failed to load links. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openLinkInNewTab = (url, linkId) => {
    // Clear any existing timer for this link
    if (clickTimers.current[linkId]) {
      clearTimeout(clickTimers.current[linkId]);
      delete clickTimers.current[linkId];
    }

    // For iOS, we need to use a different approach due to popup blockers
    if (isIOS) {
      // Method 1: Use window.location (less ideal but works)
      // window.location.href = url;

      // Method 2: Create a temporary anchor element and trigger click
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.style.display = "none";
      document.body.appendChild(anchor);

      // Trigger click programmatically
      const event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });

      // Use a try-catch block for iOS compatibility
      try {
        anchor.dispatchEvent(event);
      } catch (e) {
        console.error("Error dispatching click event:", e);
        // Fallback: open in same tab
        window.location.href = url;
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(anchor);
      }, 100);
    } else {
      // Standard method for other devices
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleLinkClick = async (link, e) => {
    e.preventDefault(); // Prevent default link behavior

    try {
      // Track the click
      const response = await api.post(`/links/${link._id}/click`);

      if (response.data.success) {
        // Update the link with new click count
        const updatedLinks = links.map((l) => {
          if (l._id === link._id) {
            return {
              ...l,
              userClickCount: response.data.clickCount,
              remainingClicks: response.data.remainingClicks,
            };
          }
          return l;
        });
        setLinks(updatedLinks);

        // Open the link with iOS-compatible method
        openLinkInNewTab(link.url, link._id);

        // Notify parent component
        if (onLinkClick) {
          onLinkClick(link._id, response.data.clickCount);
        }
      }
    } catch (err) {
      console.error("Error tracking link click:", err);

      if (err.response?.data?.maxClicksReached) {
        // Remove the link from the list if max clicks reached
        const updatedLinks = links.filter((l) => l._id !== link._id);
        setLinks(updatedLinks);
        alert("You've reached the maximum number of clicks for this link.");
      } else {
        // Even if tracking fails, still try to open the link
        openLinkInNewTab(link.url, link._id);

        // Show a more user-friendly message for iOS
        if (isIOS) {
          // Set a timer to check if the link opened successfully
          clickTimers.current[link._id] = setTimeout(() => {
            alert(
              "If the link didn't open, please check your pop-up settings or tap the link again."
            );
          }, 1000);
        }
      }
    }
  };

  const getClickStatus = (link) => {
    if (link.userClickCount >= link.maxClicks) {
      return "completed";
    } else if (link.userClickCount > 0) {
      return "in-progress";
    } else {
      return "not-started";
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Add instructions for iOS users
  const IOSInstructions = () => (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-semibold text-yellow-800 mb-1">iPhone/iPad Users:</h4>
      <p className="text-yellow-700 text-sm">
        If links don't open automatically, please allow pop-ups for this site in
        your browser settings.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center mb-3">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-red-800 font-medium">Failed to load links</h3>
        </div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Try Again
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-blue-700 font-medium">
          You've completed all available tasks for this platform!
        </p>
        <p className="text-blue-600 text-sm mt-1">
          Check back later for new tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isIOS && <IOSInstructions />}

      {links.map((link) => {
        const status = getClickStatus(link);
        const isCompleted = status === "completed";
        const isInProgress = status === "in-progress";

        return (
          <div
            key={link._id}
            onClick={isCompleted ? null : (e) => handleLinkClick(link, e)}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 border ${
              isCompleted
                ? "bg-green-50 border-green-200 cursor-not-allowed"
                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
            } group`}
          >
            <div className="flex-1">
              <span
                className={`${
                  isCompleted
                    ? "text-green-700 line-through"
                    : "text-gray-700 group-hover:text-blue-700"
                }`}
              >
                {link.title}
              </span>

              {isInProgress && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (link.userClickCount / link.maxClicks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span>
                    {link.userClickCount}/{link.maxClicks} clicks
                  </span>
                </div>
              )}

              {isCompleted && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>
                    Completed ({link.maxClicks}/{link.maxClicks} clicks)
                  </span>
                </div>
              )}
            </div>

            {!isCompleted ? (
              <ExternalLink className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
