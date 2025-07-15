import React, { useState } from "react";
import { Upload, ExternalLink, User } from "lucide-react";
import Header from "@/components/Header/Header";

export default function TikTokVerificationTask() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50  p-">
      <Header />
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h1 className="text-xl font-semibold mb-2">Verification Task</h1>
          <p className="text-blue-100">Complete this task to continue</p>
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 rounded-b-lg shadow-sm">
          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Instructions</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Click the social media link below
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Take a screenshot of the page
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Upload your screenshot as proof
              </li>
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
                  <span className="font-medium text-gray-900">Admin</span>
                  <span className="text-sm text-gray-500">
                    Posted 2 hours ago
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  Please visit this social media link and take a screenshot as
                  proof:
                </p>
                <a
                  href="https://twitter.com/example"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  https://twitter.com/example
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Upload Screenshot</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

              {uploadedFile ? (
                <div className="text-green-600">
                  <p className="font-medium">File uploaded successfully!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadedFile.name}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    Drag and drop your screenshot here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported formats: PNG, JPG, JPEG
                  </p>
                </>
              )}

              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              >
                Browse Files
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
