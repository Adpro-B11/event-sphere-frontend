"use client"

import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/types/auth"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}!</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Role</h3>
              <p className="mt-2">{user?.role}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Email</h3>
              <p className="mt-2">{user?.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Balance</h3>
              <p className="mt-2">${user?.balance}</p>
            </div>
          </div>
        </div>

        {user?.role === Role.USER && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">My Events</h2>
            <p className="text-gray-600">You haven't registered for any events yet.</p>
          </div>
        )}

        {user?.role === Role.ORGANIZER && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">My Organized Events</h2>
            <p className="text-gray-600">You haven't created any events yet.</p>
          </div>
        )}

        {user?.role === Role.ADMIN && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Total Users</h3>
                <p className="mt-2 text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Total Events</h3>
                <p className="mt-2 text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Total Revenue</h3>
                <p className="mt-2 text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
