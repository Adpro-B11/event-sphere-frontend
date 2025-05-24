"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/types/auth"
import { useState, useEffect, useRef } from "react" // Added useEffect and useRef

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Renamed for clarity
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown

  // Close profile dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);


  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false); // Close dropdown on logout
    setIsMobileMenuOpen(false); // Also close mobile menu if open
  }

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold">
            EventSphere
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/events" className="hover:text-gray-300">
              Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:text-gray-300">
                  Dashboard
                </Link>

                {user?.role === Role.ADMIN && (
                  <Link href="/admin" className="hover:text-gray-300">
                    Admin
                  </Link>
                )}

                {user?.role === Role.ORGANIZER && (
                  <Link href="/organizer" className="hover:text-gray-300">
                    Organizer
                  </Link>
                )}

                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center hover:text-gray-300"
                  >
                    {user?.username}
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} // Rotate arrow
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)} // Close on click
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-300">
                  Login
                </Link>
                <Link href="/register" className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
           <div className="md:hidden pb-4">
            <Link href="/" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/events" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
              Events
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                {user?.role === Role.ADMIN && (
                  <Link href="/admin" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                {user?.role === Role.ORGANIZER && (
                  <Link href="/organizer" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                    Organizer
                  </Link>
                )}
                <Link href="/profile" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 hover:text-gray-300">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block py-2 hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}