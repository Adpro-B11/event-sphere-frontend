"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Send, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { CreateReportDTO, ReportCategory } from "@/types/report"
import ReportService from "@/services/report-service"

export default function CreateReportPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ReportCategory | "",
    categoryReference: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated || !user) {
      setError("You must be logged in to create a report")
      return
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const reportData: CreateReportDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        categoryReference: formData.categoryReference.trim() || undefined,
        createdBy: user.id
      }

      const createdReport = await ReportService.createReport(reportData)
      
      // Redirect to the created report detail page
      router.push(`/reports/${createdReport.reportID}`)
      
    } catch (err: any) {
      console.error("Error creating report:", err)
      setError(err.response?.data?.message || "Failed to create report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">You need to login to create a report.</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Report</h1>
        <p className="text-gray-600">
          Submit a report to get help with any issues you're experiencing.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                Please provide detailed information about your issue to help us assist you better.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Brief description of your issue"
                    className="mt-1"
                    disabled={isSubmitting}
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/35 characters
                  </p>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYMENT">Payment Issues</SelectItem>
                      <SelectItem value="TICKET">Ticket Problems</SelectItem>
                      <SelectItem value="EVENT_ISSUE">Event Issues</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Reference */}
                <div>
                  <Label htmlFor="categoryReference">Reference ID (Optional)</Label>
                  <Input
                    id="categoryReference"
                    type="text"
                    value={formData.categoryReference}
                    onChange={(e) => handleInputChange("categoryReference", e.target.value)}
                    placeholder="Event ID, Transaction ID, etc."
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If your issue is related to a specific event, transaction, or ticket, please provide the ID here.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Please describe your issue in detail. Include steps to reproduce the problem, error messages, and any other relevant information."
                    rows={6}
                    className="mt-1"
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/100 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.category}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Report...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Help Guidelines */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Report Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How to write a good report:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Be specific and clear in your title</li>
                  <li>• Describe the problem step by step</li>
                  <li>• Include relevant IDs or references</li>
                  <li>• Mention what you expected vs what happened</li>
                  <li>• Add any error messages you received</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Response Time:</h4>
                <p className="text-sm text-gray-600">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Category Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-blue-700">Payment Issues</h4>
                <p className="text-xs text-gray-600">
                  Problems with transactions, refunds, or payment processing
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-green-700">Ticket Problems</h4>
                <p className="text-xs text-gray-600">
                  Issues with ticket purchase, access, or validation
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-purple-700">Event Issues</h4>
                <p className="text-xs text-gray-600">
                  Problems with events, venues, or event information
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Other</h4>
                <p className="text-xs text-gray-600">
                  General questions or issues not covered by other categories
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}