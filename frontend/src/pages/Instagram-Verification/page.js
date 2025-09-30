"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Instagram,
  Heart,
  Info,
  Star,
  FileImage,
  ImageIcon,
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";

export default function InstagramVerificationTask() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPEG, JPG, and PNG images are allowed");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

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

      const response = await fetch(`${apiUrl}/api/submissions`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.message.includes("too similar")) {
          const dateMatch = errorData.message.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
          setPreviousSubmissionDate(dateMatch ? dateMatch[0] : "previously");
          setShowDuplicateModal(true);
          return;
        }

        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/Profile/page");
      }, 1000);
    } catch (error) {
      console.error("Submission error:", error);
      if (!error.message.includes("too similar")) {
        setError(error.message || "Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Header />
        <div className="max-w-md mx-auto p-6 flex items-center min-h-screen">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-full border border-purple-100">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 left-0  mx-auto w-32 h-32 bg-green-100 rounded-full blur-xl opacity-50"></div>
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Submission Successful!
            </h2>
            <p className="text-gray-600 mb-2 text-lg">
              You've earned{" "}
              <span className="font-bold text-green-600">Rs 0.80</span>
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Your balance has been updated successfully
            </p>
            <button
              onClick={() => router.push("/Profile/page")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              View Your Earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header />
      <div className="max-w-5xl mx-auto p-4 py-8">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-8 rounded-3xl shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-start gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <img
                src="/instragrma.png"
                alt="Instagram Icon"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Instagram className="w-6 h-6" />
                <h1 className="text-3xl font-bold">Instagram Verification</h1>
              </div>
              <p className="text-white/90 text-lg mb-2">
                Complete simple tasks and earn rewards
              </p>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span className="font-semibold">
                  Earn Rs 1.00 per screenshot
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Instructions */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">How It Works</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { num: "1", text: "Visit Instagram post", icon: ExternalLink },
                { num: "2", text: "Like the post", icon: Heart },
                { num: "3", text: "Take screenshot", icon: ImageIcon },
                { num: "4", text: "Upload & earn", icon: Upload },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {step.num}
                    </div>
                    <step.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Task Links */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                📱 Complete These Tasks:
              </h3>
              <div className="space-y-3">
                {[
                  "https://www.instagram.com/p/DO8fFLECkts/?igsh=YzljYTk1ODg3Zg==",
                  "https://www.instagram.com/p/DO8fRdDCjlX/?igsh=YzljYTk1ODg3Zg==",
                  "https://www.instagram.com/p/DPJNo6Fityp/?igsh=YzljYTk1ODg3Zg==",
                ].map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white p-4 rounded-xl hover:shadow-md transition-all duration-200 group border border-blue-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-blue-600 font-medium flex-1 group-hover:text-blue-800">
                      පොස්ට් ලයික් (Like) කරන්න - Post {idx + 1}
                    </span>
                    <ExternalLink className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50 border-b border-amber-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              Screenshot Requirements
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Must clearly show the liked post",
                "Show your profile or browser context",
                "No edited or cropped images",
                "File size under 5MB",
              ].map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-white p-3 rounded-xl"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Upload Screenshot
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                {preview ? (
                  <div className="border-3 border-dashed border-green-300 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Screenshot preview"
                        className="max-h-80 mx-auto rounded-xl shadow-lg border-4 border-white"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        Ready
                      </div>
                    </div>
                    <p className="text-green-700 font-medium text-center mt-4 flex items-center justify-center gap-2">
                      <FileImage className="w-5 h-5" />
                      {file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="mt-4 mx-auto block text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
                    >
                      Remove and choose different file
                    </button>
                  </div>
                ) : (
                  <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50 to-slate-50 hover:border-purple-400 transition-all duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium text-lg">
                      Drop your screenshot here
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      or click the button below to browse
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                      Supported: PNG, JPG, JPEG • Max 5MB
                    </p>
                    <label className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium">
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

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  file
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Submit Screenshot & Earn Rs 1.00
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {showDuplicateModal && (
          <DuplicateWarningModal
            onClose={() => {
              setShowDuplicateModal(false);
              setFile(null);
              setPreview(null);
            }}
            previousDate={previousSubmissionDate}
          />
        )}
      </div>
    </div>
  );
}
