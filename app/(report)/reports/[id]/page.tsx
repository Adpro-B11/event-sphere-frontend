"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarDays,
  User,
  Tag,
  MessageSquare,
  Clock,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { ReportDetailDTO, ReportMessageDTO } from "@/types/report";
import ReportService from "@/services/report-service";

export default function ReportDetailPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [report, setReport] = useState<ReportDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatorUsername, setCreatorUsername] = useState<string>("Loading...");

  const reportId = params.id as string;

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await ReportService.getReportById(reportId);
        setReport(data);

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
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cannot Load Report
            </h1>
            <p className="text-red-700 mb-6">{error}</p>
          </div>
          <Link href="/reports">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Report not found
  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {" "}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Report Not Found
          </h1>
          <Link href="/reports">
            <Button>Back to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
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

      {/* Alert jika ada error */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
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

          {/* Messages/Responses - Read Only */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Response History
              </CardTitle>
              <CardDescription>
                History of responses and updates for this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.messages && report.messages.length > 0 ? (
                <div className="space-y-4">
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

                  {/* Info untuk user bahwa ini read-only */}
                  <div className="border-t pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-medium text-blue-800 mb-1">
                        View Mode
                      </h3>
                      <p className="text-blue-600 text-sm">
                        You can only view the response history for this report.
                        If the responses don't help, please create a new report.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">No responses yet</p>
                  <p className="text-sm">
                    Our team will respond to your report soon.
                  </p>
                </div>
              )}

              {/* Status resolved info */}
              {report.status === "RESOLVED" && (
                <div className="border-t pt-6 mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                      This report has been resolved
                    </p>
                    <p className="text-green-600 text-sm">
                      Thank you for your report
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
                    <p className="font-medium">Created Date</p>
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

            {/* Help Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Other Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you need immediate assistance or have additional questions:
                </p>
                <div className="space-y-2">
                  <Link href="/reports/create" className="block">
                    <Button variant="outline" className="w-full">
                      Create New Report
                    </Button>
                  </Link>
                  <Link href="/reports" className="block">
                    <Button variant="outline" className="w-full">
                      View All Reports
                    </Button>
                  </Link>
                </div>

                {/* Response time info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Response Time:</strong> We typically respond within
                    24-48 hours on business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}