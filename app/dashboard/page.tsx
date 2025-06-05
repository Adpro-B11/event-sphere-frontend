// Update untuk app/dashboard/page.tsx
// Tambahkan import dan komponen untuk payment features

"use client"

import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/types/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  History,
  Wallet,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar, User
} from "lucide-react"
import Link from "next/link"
import PaymentService from "@/services/payment-service"

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
            </div>
          </div>

          {/* Payment Section - Only for USER Role */}
          {user?.role === Role.USER && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Payment & Balance
                  </CardTitle>
                  <CardDescription>
                    Manage your account balance and view transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Current Balance */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700">Current Balance</p>
                          <p className="text-2xl font-bold text-green-800">
                            {PaymentService.formatCurrency(user?.balance || 0)}
                          </p>
                        </div>
                        <Wallet className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    {/* Top Up Balance */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Top Up Balance</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Add funds to your account
                        </p>
                        <Link href="/payment/top-up">
                          <Button className="w-full" size="sm">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Top Up Now
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    {/* Transaction History */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Transaction History</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          View all your transactions
                        </p>
                        <Link href="/payment/transactions">
                          <Button variant="outline" className="w-full" size="sm">
                            View History
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Role-specific sections */}
          {user?.role === Role.USER && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">My Events</h2>
                <p className="text-gray-600">You haven't registered for any events yet.</p>
                <div className="mt-4">
                  <Link href="/events">
                    <Button>Browse Events</Button>
                  </Link>
                </div>
              </div>
          )}

          {user?.role === Role.ORGANIZER && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">My Organized Events</h2>
                <p className="text-gray-600">You haven't created any events yet.</p>
                <div className="mt-4">
                  <Link href="/events/create">
                    <Button>Create Event</Button>
                  </Link>
                </div>
              </div>
          )}

          {user?.role === Role.ADMIN && (
              <>
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

                {/* Admin Payment Management */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Payment Management
                    </CardTitle>
                    <CardDescription>
                      Monitor and manage system transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <History className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">All Transactions</span>
                            </div>
                            <Badge variant="secondary">Admin</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            View and manage all system transactions
                          </p>
                          <Link href="/admin/transactions">
                            <Button className="w-full" size="sm">
                              Manage Transactions
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <span className="font-medium">Revenue Analytics</span>
                            </div>
                            <Badge variant="secondary">Coming Soon</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            View payment analytics and reports
                          </p>
                          <Button variant="outline" className="w-full" size="sm" disabled>
                            View Analytics
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Top Up - Only for USER role */}
                {user?.role === Role.USER && (
                    <Link href="/payment/top-up">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <p className="font-medium">Top Up</p>
                          <p className="text-sm text-gray-600">Add Balance</p>
                        </CardContent>
                      </Card>
                    </Link>
                )}

                {/* Transactions - Only for USER role */}
                {user?.role === Role.USER && (
                    <Link href="/payment/transactions">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <History className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <p className="font-medium">History</p>
                          <p className="text-sm text-gray-600">View Transactions</p>
                        </CardContent>
                      </Card>
                    </Link>
                )}

                <Link href="/events">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Events</p>
                      <p className="text-sm text-gray-600">Browse Events</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/profile">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <User className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="font-medium">Profile</p>
                      <p className="text-sm text-gray-600">Edit Profile</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
  )
}