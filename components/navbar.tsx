"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/types/auth"
import { useState } from "react"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

                <div className="relative group">
                  <button className="flex items-center hover:text-gray-300">
                    {user?.username}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
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
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link href="/" className="block py-2 hover:text-gray-300">
              Home
            </Link>
            <Link href="/events" className="block py-2 hover:text-gray-300">
              Events
            </Link>
            <Link href="/troubleshoot" className="block py-2 hover:text-gray-300">
              Troubleshoot
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block py-2 hover:text-gray-300">
                  Dashboard
                </Link>

                {user?.role === Role.ADMIN && (
                  <Link href="/admin" className="block py-2 hover:text-gray-300">
                    Admin
                  </Link>
                )}

                {user?.role === Role.ORGANIZER && (
                  <Link href="/organizer" className="block py-2 hover:text-gray-300">
                    Organizer
                  </Link>
                )}

                <Link href="/profile" className="block py-2 hover:text-gray-300">
                  Profile
                </Link>

                <button onClick={logout} className="block w-full text-left py-2 hover:text-gray-300">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 hover:text-gray-300">
                  Login
                </Link>
                <Link href="/register" className="block py-2 hover:text-gray-300">
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
