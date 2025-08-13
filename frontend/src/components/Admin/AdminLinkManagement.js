import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/router";
import Header from "@/components/Header/Header";

const platforms = ["facebook", "instagram", "youtube", "tiktok"];

export default function AdminLinkManagement() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState("facebook");
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/admin/links");
        setLinks(response.data.data || []);
      } catch (error) {
        console.error("Error fetching links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [user, router]);

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    try {
      const response = await api.post(
        `/api/admin/links/${activePlatform}`,
        newLink
      );
      setLinks(
        links.map((link) =>
          link.platform === activePlatform ? response.data.data : link
        ) || [response.data.data]
      );
      setNewLink({ title: "", url: "" });
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  const handleToggleLink = async (linkId) => {
    try {
      const response = await api.patch(
        `/api/admin/links/${activePlatform}/${linkId}/toggle`
      );
      setLinks(
        links.map((link) =>
          link.platform === activePlatform ? response.data.data : link
        )
      );
    } catch (error) {
      console.error("Error toggling link:", error);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await api.delete(`/api/admin/links/${activePlatform}/${linkId}`);
      setLinks(
        links.map((link) => {
          if (link.platform === activePlatform) {
            return {
              ...link,
              links: link.links.filter((l) => l._id !== linkId),
            };
          }
          return link;
        })
      );
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const currentPlatformLinks =
    links.find((link) => link.platform === activePlatform)?.links || [];

  if (!user?.isAdmin) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Verification Link Management</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={`py-2 px-4 font-medium capitalize ${
                activePlatform === platform
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            {/* Add New Link Form */}
            <form onSubmit={handleAddLink} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Title
                  </label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Facebook Verification"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/verify"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </form>

            {/* Links List */}
            <h3 className="text-lg font-medium mb-4">
              {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}{" "}
              Links
            </h3>
            {currentPlatformLinks.length === 0 ? (
              <p className="text-gray-500">No links added yet</p>
            ) : (
              <div className="space-y-4">
                {currentPlatformLinks.map((link) => (
                  <div
                    key={link._id}
                    className={`p-4 border rounded-lg ${
                      link.active
                        ? "border-gray-200"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{link.title}</h4>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {link.url}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Added: {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleLink(link._id)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            link.active
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {link.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this link?"
                              )
                            ) {
                              handleDeleteLink(link._id);
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
