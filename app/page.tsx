"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/types/auth"

export default function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Event background"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Discover and Create Unforgettable Events</h1>
            <p className="text-xl mb-8">
              EventSphere helps you find and organize events that matter to you. Join us today and be part of something
              special.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/events"
                className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100"
              >
                Explore Events
              </Link>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="bg-transparent border-2 border-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-gray-900"
                >
                  My Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="bg-transparent border-2 border-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-gray-900"
                >
                  Sign Up Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose EventSphere?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Event Management</h3>
            <p className="text-gray-600">Create, manage, and promote your events with our intuitive platform.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with Attendees</h3>
            <p className="text-gray-600">
              Build your community and engage with participants before, during, and after events.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-gray-600">Handle tickets, payments, and registrations with our secure platform.</p>
          </div>
        </div>
      </div>

      {/* CTA Section - Different for authenticated vs non-authenticated users */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl font-bold mb-6">Welcome Back, {user?.username}!</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {user?.role === Role.ORGANIZER
                  ? "Ready to manage your events or create a new one?"
                  : "Ready to discover new events that match your interests?"}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/events"
                  className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700"
                >
                  Browse Events
                </Link>
                {user?.role === Role.ORGANIZER && (
                  <Link
                    href="/organizer/create-event"
                    className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700"
                  >
                    Create Event
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="border border-gray-800 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-800 hover:text-white"
                >
                  My Dashboard
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of event organizers and attendees who trust EventSphere for their event needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/login"
                  className="border border-gray-800 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-800 hover:text-white"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
