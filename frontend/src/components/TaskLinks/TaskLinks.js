import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";

export default function TaskLinks({ platform, onLinkClick }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, platform]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/links/${platform}`);
      if (response.data.success) {
        setLinks(response.data.data);
      } else {
        setError("Failed to load links");
      }
    } catch (err) {
      console.error("Error fetching links:", err);
      setError("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId, e) => {
    e.preventDefault(); // Prevent default link behavior

    try {
      // Track the click
      const response = await api.post(`/links/${linkId}/click`);

      if (response.data.success) {
        if (response.data.alreadyClicked) {
          // Link was already clicked but not submitted
          alert(
            "You've already clicked this link. Please submit a screenshot to complete the task."
          );
        } else {
          // Open the link in a new tab
          const link = links.find((l) => l._id === linkId);
          if (link) {
            window.open(link.url, "_blank", "noopener,noreferrer");
          }

          // Notify parent component
          if (onLinkClick) {
            onLinkClick(linkId);
          }
        }
      }
    } catch (err) {
      console.error("Error tracking link click:", err);
      // Even if tracking fails, still open the link
      const link = links.find((l) => l._id === linkId);
      if (link) {
        window.open(link.url, "_blank", "noopener,noreferrer");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
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
      {links.map((link) => (
        <div
          key={link._id}
          onClick={(e) => handleLinkClick(link._id, e)}
          className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200 border border-gray-200 hover:border-blue-300 group cursor-pointer"
        >
          <span className="text-gray-700 group-hover:text-blue-700 flex-1">
            {link.title}
          </span>
          <ExternalLink className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
        </div>
      ))}
    </div>
  );
}
