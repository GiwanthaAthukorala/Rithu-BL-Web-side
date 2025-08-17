"use client";
import { useState, useEffect } from "react";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Clock,
  Facebook,
} from "lucide-react";

// Mock components and hooks for demonstration
const Header = () => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Facebook className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-white">Verification Portal</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-blue-100">Welcome back!</span>
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const DuplicateWarningModal = ({ onClose, previousDate }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-3 text-red-600">
        Duplicate Image Detected
      </h3>
      <p className="text-gray-600 mb-4">
        This image is too similar to one you submitted on {previousDate}. Please
        upload a different screenshot.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
      >
        Close
      </button>
    </div>
  </div>
);

// Mock countdown component
const Countdown = ({ date, renderer }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    completed: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(date).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          completed: false,
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, completed: true });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return <span>{renderer(timeLeft)}</span>;
};

export default function FbVerificationTask() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  const [submissionLimit, setSubmissionLimit] = useState({
    remaining: 20,
    nextSubmissionTime: null,
  });

  // Mock user and auth
  const user = { _id: "user123", name: "John Doe" };
  const isAuthLoading = false;

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

    // Mock submission delay
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  // Countdown renderer
  const countdownRenderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <span className="text-green-600 font-medium">You can submit now!</span>
      );
    } else {
      return (
        <span className="font-mono text-sm">
          {hours}h {minutes}m {seconds}s
        </span>
      );
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="max-w-md mx-auto p-6 pt-16">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800">
                Submission Successful!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You've earned{" "}
                <span className="font-semibold text-green-600">Rs 1.00</span>
                <br />
                Your balance has been updated.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                View Your Earnings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const facebookPages = [
    {
      name: "CS Studio and Communication",
      url: "https://www.facebook.com/share/1CVEp1bSgv/?mibextid=wwXIfr",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "හෙළ වෙදකම",
      url: "https://www.facebook.com/profile.php?id=61579385003718",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "SHILA",
      url: "https://www.facebook.com/profile.php?id=61574553219898&mibextid=wwXIfr&mibextid=wwXIfr",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "Suwa Piyasa Home Nursing",
      url: "https://www.facebook.com/SuwaPiyasaHomeNursing",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "Minu Korean Language Center",
      url: "https://www.facebook.com/minukoreanlanguagecenter/",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "TMR Travels & Tours Private Ltd",
      url: "https://www.facebook.com/share/17ftfCoqE4/?mibextid=wwXIfr",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "Various Technologies",
      url: "https://www.facebook.com/share/16Ms5EmWDc/",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "NOIRELLE",
      url: "https://www.facebook.com/share/178gYEzVBS/?mibextid=wwXIfr",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
    {
      name: "𝐌 𝐢 𝐧 𝐝",
      url: "https://www.facebook.com/share/1ChgcGPsKX/",
      description: "ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                    <Facebook className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Facebook Verification Section
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Earn{" "}
                      <span className="font-semibold text-yellow-300">
                        Rs 1.00
                      </span>{" "}
                      per valid screenshot
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-200">Active</span>
                      </div>
                      <div className="text-sm text-blue-200">
                        {submissionLimit.remaining} submissions remaining
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <div className="text-4xl font-bold text-yellow-300">
                      Rs 1.00
                    </div>
                    <div className="text-blue-200 text-sm">per screenshot</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Submission Limit Info */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">
                    Daily Submission Limit
                  </h3>
                  <p className="text-gray-600">
                    {submissionLimit.remaining > 0 ? (
                      <span>
                        You can submit{" "}
                        <span className="font-semibold text-blue-600">
                          {submissionLimit.remaining}
                        </span>{" "}
                        more screenshots today
                      </span>
                    ) : (
                      <span className="text-red-600">
                        You've reached today's limit
                      </span>
                    )}
                  </p>
                </div>
                {submissionLimit.nextSubmissionTime && (
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Countdown
                      date={submissionLimit.nextSubmissionTime}
                      renderer={countdownRenderer}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                How It Works
              </h2>
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    step: "1",
                    title: "Visit Page",
                    desc: "Click on any Facebook page link below",
                  },
                  {
                    step: "2",
                    title: "Like/Follow",
                    desc: "Like or follow the page",
                  },
                  {
                    step: "3",
                    title: "Screenshot",
                    desc: "Take a clear screenshot",
                  },
                  {
                    step: "4",
                    title: "Upload",
                    desc: "Upload and earn Rs 1.00",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facebook Pages Links */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Facebook Pages to Follow
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {facebookPages.map((page, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
                  >
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {page.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {page.description} (This Page Like or Following)
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshot Requirements */}
            <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
              <h3 className="text-lg font-semibold mb-4 text-amber-800 flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                Screenshot Requirements
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Must clearly show the liked/followed page",
                  "Must show your profile or browser context",
                  "No edited or cropped images",
                  "File size under 5MB (PNG, JPG, JPEG only)",
                ].map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-amber-700 text-sm">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Upload Your Screenshot
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  {preview ? (
                    <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-6 text-center">
                      <img
                        src={preview}
                        alt="Screenshot preview"
                        className="max-h-64 mx-auto mb-4 rounded-lg shadow-md"
                      />
                      <p className="text-green-700 font-medium mb-2">
                        {file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 bg-white px-3 py-1 rounded-md border hover:bg-red-50 transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 mb-2 font-medium">
                        Drag and drop your screenshot here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        Supported formats: PNG, JPG, JPEG (max 5MB)
                      </p>
                      <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
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
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    !file || isSubmitting || submissionLimit.remaining <= 0
                  }
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    file && submissionLimit.remaining > 0
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </span>
                  ) : submissionLimit.remaining <= 0 ? (
                    "Daily Limit Reached"
                  ) : (
                    "Submit Screenshot & Earn Rs 1.00"
                  )}
                </button>
              </form>
            </div>
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
