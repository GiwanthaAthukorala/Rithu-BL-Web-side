import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import { ExternalLink } from "lucide-react";

export default function TaskLinks({ platform, onLinkClick }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLinks();
  }, [platform, user]);

  const fetchLinks = async () => {
    try {
      const response = await api.get(`/links/${platform}`);
      if (response.data.success) {
        setLinks(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId, url) => {
    try {
      // Track the click
      await api.post(`/links/${linkId}/click`);

      // Open the link in a new tab
      window.open(url, "_blank");

      // Notify parent component
      if (onLinkClick) {
        onLinkClick(linkId);
      }
    } catch (error) {
      console.error("Failed to track link click:", error);
      // Still open the link even if tracking fails
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return <div>Loading links...</div>;
  }

  if (links.length === 0) {
    return <div>No links available at the moment.</div>;
  }

  return (
    <div className="grid gap-3">
      {links.map((link) => (
        <div
          key={link._id}
          className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200 border border-gray-200 hover:border-blue-300 group"
        >
          <span className="text-gray-700 group-hover:text-blue-700">
            {link.title}
          </span>
          <button
            onClick={() => handleLinkClick(link._id, link.url)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            Open Link
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>
      ))}
    </div>
  );
}
