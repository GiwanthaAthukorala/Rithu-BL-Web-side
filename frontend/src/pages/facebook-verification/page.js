"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ExternalLink, User, CheckCircle } from "lucide-react";
import Header from "@/components/Header/Header";
import axios from "axios";
import api from "@/lib/api";

export default function FbVerificationTask() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const baseUrl =
          process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

        const response = await axios.get(`${baseUrl}/api/tasks/active`);
        if (response.data.length > 0) {
          setTask(response.data[0]); // Use the first task
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchTask();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("platform", "facebook");

      const response = await api.post("/api/submissions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Failed to submit screenshot");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Submission Successful!</h2>
            <p className="text-gray-600 mb-6">
              You've earned Rs 0.80. Your balance will be updated after
              approval.
            </p>
            <button
              onClick={() => router.push("/tasks")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  p-">
      <Header />
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h1 className="text-xl font-semibold mb-2">
            Facebook Verification Task
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
                <li>Like or follow our Facebook page</li>
                <li>Take a clear screenshot showing your engagement</li>
                <li>Upload the screenshot below</li>
              </ol>
            </ul>
          </div>

          {/* Admin Message */}
          <div className="mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-gray-700 mb-3">
                    Please visit this link and take a screenshot as proof:
                  </p>
                  {/*Link upload in pages  */}
                  <div className="mb-6">
                    <a
                      href="https://facebook.com/yourpage"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      Visit our Facebook page{" "}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>

                  <span className="font-medium text-gray-900">Admin</span>
                  <span className="text-sm text-gray-500">
                    Posted 2 hours ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Upload Screenshot</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Screenshot
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  {file ? (
                    <p className="text-green-600 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-2">
                        Drag and drop your screenshot here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supported formats: PNG, JPG, JPEG (max 5MB)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700"
                  >
                    Choose File
                  </label>
                </div>
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
