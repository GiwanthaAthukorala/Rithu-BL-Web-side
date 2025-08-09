import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null); // Mock user state
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Mock user for demo
    // setUser({ firstName: "John" });

    // Add scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const logout = () => {
    setUser(null);
    closeMobileMenu();
  };

  return (
    <div className="bg-gray-50">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
            : "bg-white shadow-sm border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo/Brand - Responsive */}
            <div className="flex-shrink-0 relative">
              <a href="/" className="inline-flex items-center space-x-2 group">
                {/* Logo Image */}
                <div className="relative">
                  <img
                    src="/RBL.png"
                    alt="RBL Logo"
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Animated ring around logo */}
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
                </div>

                {/* Brand Text */}
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                    Rithu Business Lanka
                  </h1>
                  <p className="text-xs text-gray-500 hidden lg:block">
                    Get Paid for Social Media
                  </p>
                </div>

                {/* Mobile Brand Text */}
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-blue-600">RBL</h1>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {["How It Works", "Platforms", "FAQ", "Contact"].map(
                (item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                  </a>
                )
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {!mounted ? (
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      Welcome, {user.firstName}
                    </span>
                  </div>
                  <a
                    href="/Profile/page"
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    Profile
                  </a>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a
                    href="/Log-in/page"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    Login
                  </a>
                  <a
                    href="/Sign-up/page"
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Auth Indicator */}
              {mounted && user && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}

              <button
                onClick={toggleMobileMenu}
                className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "opacity-0 rotate-180 scale-75"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-180 scale-75"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            <div className="px-4 py-4 space-y-1">
              {/* Navigation Links */}
              {["How It Works", "Platforms", "FAQ", "Contact"].map(
                (item, index) => (
                  <a
                    key={index}
                    href="#"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                  >
                    <span>{item}</span>
                    <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 -rotate-90 transition-all duration-200" />
                  </a>
                )
              )}

              {/* Mobile Auth Section */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {!mounted ? (
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.firstName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        Welcome, {user.firstName}!
                      </span>
                    </div>
                    <a
                      href="/Profile/page"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                    >
                      View Profile
                    </a>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <a
                      href="/Log-in/page"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-base font-medium text-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-gray-200"
                    >
                      Login
                    </a>
                    <a
                      href="/Sign-up/page"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-base font-medium text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Sign Up Free
                    </a>
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
