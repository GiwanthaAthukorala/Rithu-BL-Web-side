"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ExternalLink, CheckCircle } from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";

export default function FbVerificationTask() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPEG, JPG, and PNG images are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("platform", "facebook");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-side.vercel.app";
      console.log("Submitting to:", `${apiUrl}/api/submissions`);
      console.log("Token exists:", !!token);
      const response = await fetch(`${apiUrl}/api/submissions`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      console.log("Success response : ", result);

      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/Profile/page");
      }, 1000);
      router.push("/Profile/page");
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Submission Successful!</h2>
            <p className="text-gray-600 mb-6">
              You've earned Rs 0.80. Your balance has been updated.
            </p>
            <button
              onClick={() => router.push("/Profile/page")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              View Your Earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Header />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="w-20 h-20 flex items-center justify-center mr-3 overflow-hidden">
            <img
              src="/facebook.png"
              alt="Facebook Icon"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-xl text-[#000000]  font-bold mb-2">
            Facebook Verification Section
          </h1>
          <p className="text-blue-100">Earn Rs 0.80 per valid screenshot</p>
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 rounded-b-lg shadow-sm">
          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Instructions</h2>
            <ul className="space-y-2 text-gray-700">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Visit our Facebook page using the link below</li>
                <li>Like or follow our page</li>
                <li>Take a clear screenshot showing your engagement</li>
                <li>Upload the screenshot below</li>
              </ol>
            </ul>
          </div>

          {/* Admin Message */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-3">
              Please visit this link and take a screenshot as proof:
            </p>
            <a
              href="https://www.facebook.com/share/1Ase2KqzCT/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit our Facebook page <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit our Facebook page <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit our Facebook page <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit our Facebook page <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit our Facebook page <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="mb-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-md font-medium mb-2 text-yellow-800">
              Screenshot Requirements
            </h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Must clearly show the liked/followed page</li>
              <li>Must show your profile or browser context</li>
              <li>No edited or cropped images</li>
              <li>File size under 5MB</li>
            </ul>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Upload Screenshot</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screenshot File
                </label>

                {preview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img
                      src={preview}
                      alt="Screenshot preview"
                      className="max-h-64 mx-auto mb-4 rounded"
                    />
                    <p className="text-green-600 font-medium">{file.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="mt-3 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your screenshot here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supported formats: PNG, JPG, JPEG (max 5MB)
                    </p>
                    <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700">
                      Choose File
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={!file || isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold ${
                  file
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Screenshot"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
