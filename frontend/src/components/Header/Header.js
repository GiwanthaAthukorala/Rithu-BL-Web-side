import React, { useEffect, useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className=" bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600">
                  Rithu Business Lanka
                </h1>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="#"
                className=" text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200  "
              >
                How It Works
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600  px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Platforms
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                FAQ
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {!mounted ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <>
                  <span className="text-sm">Welcome, {user.firstName}</span>
                  <Link
                    href="/Profile/page"
                    className="text-blue-600 hover:underline"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/Log-in/page"
                    className="text-blue-600 hover:underline"
                  >
                    Login
                  </Link>
                  <Link
                    href="/Sign-up/page"
                    className="text-blue-600 hover:underline"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-blue-600 p-2">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu - Hidden by default */}
      <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a
            href="#"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
          >
            How It Works
          </a>
          <a
            href="#"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
          >
            Platforms
          </a>
          <a
            href="#"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
          >
            FAQ
          </a>
          <a
            href="#"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
          >
            Contact
          </a>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-3 space-x-3">
              <button className="text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium">
                Log In
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
