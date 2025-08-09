import React, { useEffect, useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  return (
    <div className="bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 relative">
              <Link href="/" className="inline-block" onClick={closeMobileMenu}>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-blue-600">
                    Rithu Business Lanka
                  </h1>
                  <img
                    src="/RBL.png"
                    alt="RBL Logo"
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                How It Works
              </Link>
              <Link
                href="#platforms"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Platforms
              </Link>
              <Link
                href="#faq"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                FAQ
              </Link>
              <Link
                href="#contact"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!mounted ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.firstName?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      Welcome, {user.firstName || user.name || "User"}
                    </span>
                  </div>
                  <Link
                    href="/Profile/page"
                    className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/Log-in/page"
                    className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/Sign-up/page"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Navigation Links */}
              <Link
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                How It Works
              </Link>
              <Link
                href="#platforms"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                Platforms
              </Link>
              <Link
                href="#faq"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                FAQ
              </Link>
              <Link
                href="#contact"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                Contact
              </Link>

              {/* Mobile Auth Section */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {!mounted ? (
                  <div className="px-3">
                    <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">
                          {user.firstName?.charAt(0).toUpperCase() ||
                            user.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName || user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="flex flex-col space-y-2 px-3">
                      <Link
                        href="/Profile/page"
                        onClick={closeMobileMenu}
                        className="w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 px-3">
                    <Link
                      href="/Log-in/page"
                      onClick={closeMobileMenu}
                      className="w-full text-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium border border-blue-600 transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/Sign-up/page"
                      onClick={closeMobileMenu}
                      className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
