"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  User,
  Tag,
  MessageSquare,
  Clock,
  Send,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type {
  ReportDetailDTO,
  ReportMessageDTO,
  CreateReportMessageDTO,
  ReportStatus,
} from "@/types/report";
import ReportService from "@/services/report-service";
import ProtectedRoute from "@/components/protected-route";
import { Role } from "@/types/auth";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [report, setReport] = useState<ReportDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creatorUsername, setCreatorUsername] = useState<string>("Loading...");

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Message form state
  const [newMessage, setNewMessage] = useState("");

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | "">("");

  const reportId = params.id as string;

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await ReportService.getReportById(reportId);
        setReport(data);
        setSelectedStatus(data.status as ReportStatus);

        // Fetch the username for createdBy
        if (data && data.createdBy) {
          const username = await ReportService.getUsernameFromId(
            data.createdBy
          );
          setCreatorUsername(username);
        }
      } catch (err: any) {
        console.error("Error fetching report:", err);
        if (err.response?.status === 404) {
          setError("Report not found");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view this report");
        } else {
          setError(
            err.response?.data?.message || "Failed to load report details"
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user || !report) {
      setError("You must be logged in to send a message");
      return;
    }

    if (!newMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const messageData: CreateReportMessageDTO = {
        reportID: report.reportID,
        sender: user.username || user.email,
        message: newMessage.trim(),
      };

      const createdMessage = await ReportService.createReportMessage(
        messageData
      );

      // Update report dengan message baru
      setReport({
        ...report,
        messages: [...(report.messages || []), createdMessage],
      });

      setNewMessage("");
      setSuccess("Message sent successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !report || selectedStatus === report.status) {
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      console.log("Updating report status to:", selectedStatus);
      const updatedReport = await ReportService.updateReportStatus(
        report.reportID,
        selectedStatus
      );

      setReport(updatedReport);
      setSuccess(
        `Report status updated to ${ReportService.formatStatus(selectedStatus)}`
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error updating report status:", err);
      setError(err.response?.data?.message || "Failed to update report status");
      // Reset selected status to current report status
      setSelectedStatus(report.status as ReportStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;

    setIsDeleting(true);
    setError("");

    try {
      await ReportService.deleteReport(report.reportID);
      router.push("/management-reports");
    } catch (err: any) {
      console.error("Error deleting report:", err);
      setError(err.response?.data?.message || "Failed to delete report");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Check if user can manage this report (admin, organizer, or creator)
  const canManageReport = () => {
    if (!user || !report) return false;
    return (
      user.role === Role.ADMIN ||
      user.role === Role.ORGANIZER ||
      user.id === report.createdBy
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading report details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !report) {
    return (
      <ProtectedRoute allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Load Report
              </h1>
              <p className="text-red-700 mb-6">{error}</p>
            </div>
            <Link href="/management-reports">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Management Reports
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Report not found
  if (!report) {
    return (
      <ProtectedRoute allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Report Not Found
            </h1>
            <Link href="/management-reports">
              <Button>Back to Management Report</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/management-reports">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Management Reports
            </Button>
          </Link>
        </div>

        {/* Report Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {report.title}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  className={ReportService.getStatusBadgeColor(report.status)}
                >
                  {ReportService.formatStatus(report.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Report ID: {report.reportID}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Report Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Report Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {report.description}
                </p>
              </CardContent>
            </Card>

            {/* Messages/Responses */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Responses & Updates
                </CardTitle>
                <CardDescription>
                  Communication history for this report
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.messages && report.messages.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {report.messages
                      .sort(
                        (a, b) =>
                          new Date(a.timestamp).getTime() -
                          new Date(b.timestamp).getTime()
                      )
                      .map((message: ReportMessageDTO) => (
                        <div
                          key={message.messageID}
                          className={`p-4 rounded-lg border ${
                            ReportService.isAdminMessage(message.sender)
                              ? "bg-blue-50 border-blue-200 ml-4"
                              : "bg-gray-50 border-gray-200 mr-4"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${
                                  ReportService.isAdminMessage(message.sender)
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {message.sender}
                              </span>
                              {ReportService.isAdminMessage(message.sender) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-100"
                                >
                                  Staff
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span title={formatDate(message.timestamp)}>
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">
                            {message.message}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 mb-6">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No responses yet. Our team will respond to your report
                      soon.
                    </p>
                  </div>
                )}

                {/* Message Form */}
                {isAuthenticated && report.status !== "RESOLVED" && (
                  <div className="border-t pt-6">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <Label htmlFor="message">Add a message</Label>
                        <Textarea
                          id="message"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message here..."
                          rows={3}
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !newMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {report.status === "RESOLVED" && (
                  <div className="border-t pt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-800 font-medium">
                        This report has been resolved
                      </p>
                      <p className="text-green-600 text-sm">
                        No further response can be added
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Fixed position */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Report Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Created Date */}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-gray-600">
                        {formatDate(report.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Category */}
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-gray-600">
                        {ReportService.getCategoryDisplayName(report.category)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Reference */}
                  {report.categoryReference && (
                    <>
                      <div className="flex items-start gap-3">
                        <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Reference</p>
                          <p className="text-gray-600 font-mono text-sm">
                            {report.categoryReference}
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Created By */}
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Created By</p>
                      <p className="text-gray-600">{creatorUsername}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Status */}
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 mt-0.5">
                      <div
                        className={`h-3 w-3 rounded-full mt-1 ${
                          report.status.toLowerCase() === "pending"
                            ? "bg-yellow-500"
                            : report.status.toLowerCase() === "on_progress"
                            ? "bg-blue-500"
                            : report.status.toLowerCase() === "resolved"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-gray-600">
                        {ReportService.formatStatus(report.status)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Management Card */}
              {canManageReport() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Report Management
                    </CardTitle>
                    <CardDescription>
                      Update status or manage this report
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status Update */}
                    <div className="space-y-3">
                      <Label htmlFor="status-select">Update Status</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) =>
                          setSelectedStatus(value as ReportStatus)
                        }
                      >
                        <SelectTrigger id="status-select">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="ON_PROGRESS">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              On Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="RESOLVED">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Resolved
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {selectedStatus && selectedStatus !== report.status && (
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={isUpdating}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Update Status
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Delete Report */}
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium text-red-600 mb-1">
                          Danger Zone
                        </p>
                        <p className="text-gray-600 text-xs">
                          Permanently delete this report and all associated
                          data.
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                        variant="destructive"
                        className="w-full"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions for non-managers */}
              {!canManageReport() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Link href="/reports/create" className="block">
                        <Button variant="outline" className="w-full">
                          Create New Report
                        </Button>
                      </Link>
                      <Link href="/reports" className="block">
                        <Button variant="outline" className="w-full">
                          View My Reports
                        </Button>
                      </Link>
                    </div>

                    {/* Response time info */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Response Time:</strong> We typically respond
                        within 24-48 hours during business days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be
              undone.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteReport}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
