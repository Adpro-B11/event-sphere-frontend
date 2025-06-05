"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { ReportListDTO } from "@/types/report";
import ReportService from "@/services/report-service";
import { ReportCard } from "./components/ReportCard";
import ProtectedRoute from "@/components/protected-route"

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const [allReports, setAllReports] = useState<ReportListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Menggunakan getUserReports dengan ID user yang sebenarnya
        const reports = await ReportService.getUserReports(user.id);

        // Sort reports berdasarkan tanggal (terbaru dulu)
        const sortedReports = ReportService.sortReportsByDate(reports, false);
        setAllReports(sortedReports);
      } catch (err: any) {
        console.error("Error fetching reports:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load reports";
        setError(errorMessage);
        setAllReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAuthenticated, user?.id]);

  const filterReportsByStatus = (status: string) => {
    return ReportService.filterReportsByStatus(allReports, status);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading reports...</span>
        </div>
      </div>
    );
  }


  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Help</h1>
            <p className="text-gray-600 mt-1">
              Manage your support requests and get help
            </p>
          </div>
          <Link href="/reports/create">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 text-center text-red-700 bg-red-100 rounded-lg border border-red-300">
            <p>Error: {error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Reports ({allReports.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterReportsByStatus("pending").length})
            </TabsTrigger>
            <TabsTrigger value="on progress">
              In Progress ({filterReportsByStatus("on progress").length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({filterReportsByStatus("resolved").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="mb-4 text-sm text-gray-600">
              {filterReportsByStatus("all").length} report
              {filterReportsByStatus("all").length !== 1 ? "s" : ""} found
            </div>
            {filterReportsByStatus("all").length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <p className="text-gray-500 text-lg mb-4">No reports found.</p>
                <p className="text-gray-400 mb-6">
                  Create your first report to get started with our support system.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterReportsByStatus("all").map((report) => (
                  <ReportCard
                    key={report.reportID}
                    report={report}
                    username={user?.username}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <div className="mb-4 text-sm text-gray-600">
              {filterReportsByStatus("pending").length} pending report
              {filterReportsByStatus("pending").length !== 1 ? "s" : ""} found
            </div>
            {filterReportsByStatus("pending").length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No pending reports.</p>
                <p className="text-gray-400">
                  All your reports have been processed or resolved.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterReportsByStatus("pending").map((report) => (
                  <ReportCard
                    key={report.reportID}
                    report={report}
                    username={user?.username}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="on progress">
            <div className="mb-4 text-sm text-gray-600">
              {filterReportsByStatus("on progress").length} report
              {filterReportsByStatus("on progress").length !== 1 ? "s" : ""} in
              progress
            </div>
            {filterReportsByStatus("on progress").length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  No reports in progress.
                </p>
                <p className="text-gray-400">
                  Our team will start working on your reports soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterReportsByStatus("on progress").map((report) => (
                  <ReportCard
                    key={report.reportID}
                    report={report}
                    username={user?.username}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            <div className="mb-4 text-sm text-gray-600">
              {filterReportsByStatus("resolved").length} resolved report
              {filterReportsByStatus("resolved").length !== 1 ? "s" : ""}
            </div>
            {filterReportsByStatus("resolved").length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No resolved reports.</p>
                <p className="text-gray-400">
                  Completed reports will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterReportsByStatus("resolved").map((report) => (
                  <ReportCard
                    key={report.reportID}
                    report={report}
                    username={user?.username}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
