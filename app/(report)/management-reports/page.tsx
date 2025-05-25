"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronRight,
  MoreHorizontal,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import type { ReportListDTO } from "@/types/report";
import ReportService from "@/services/report-service";
import { Role } from "@/types/auth";
import ProtectedRoute from "@/components/protected-route";

export default function AdminReportsPage() {
  const [allReports, setAllReports] = useState<ReportListDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const isMounted = useRef(true);

  // State untuk delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    isMounted.current = true;

    const fetchReports = async () => {
      setLoading(true);
      try {
        const reports = await ReportService.getAllReports();
        if (!isMounted.current) return;
        setAllReports(reports);

        // Fetch usernames for reports
        const usernames: Record<string, string> = {};
        await Promise.all(
          reports.map(async (report) => {
            if (!userMap[report.createdBy]) {
              const username = await ReportService.getUsernameFromId(
                report.createdBy
              );
              if (!isMounted.current) return;
              usernames[report.createdBy] = username;
            }
          })
        );

        if (!isMounted.current) return;
        setUserMap((prevUserMap) => ({
          ...prevUserMap,
          ...usernames,
        }));
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchReports();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status: string) => {
    return ReportService.getStatusBadgeColor(status);
  };

  // Fungsi untuk mengurutkan data
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Fungsi untuk memfilter data
  const filteredReports = allReports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      report.status.toLowerCase() ===
        statusFilter.toLowerCase().replace("_", " ");
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;

    // Filter berdasarkan rentang tanggal
    let matchesDateRange = true;
    if (dateRange.from && dateRange.to) {
      const reportDate = new Date(report.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDateRange = reportDate >= fromDate && reportDate <= toDate;
    }

    return (
      matchesSearch && matchesStatus && matchesCategory && matchesDateRange
    );
  });

  // Mengurutkan data
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortField === "createdAt") {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    } else if (sortField === "reportID") {
      return sortDirection === "asc"
        ? a.reportID.localeCompare(b.reportID)
        : b.reportID.localeCompare(a.reportID);
    } else if (sortField === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortField === "status") {
      return sortDirection === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortField === "category") {
      return sortDirection === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    } else if (sortField === "createdBy") {
      return sortDirection === "asc"
        ? a.createdBy.localeCompare(b.createdBy)
        : b.createdBy.localeCompare(a.createdBy);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedReports.slice(indexOfFirstItem, indexOfLastItem);

  // Fungsi untuk mengubah halaman
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Fungsi untuk mengubah jumlah item per halaman
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Fungsi untuk menangani seleksi laporan
  const handleSelectReport = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  // Fungsi untuk menangani seleksi semua laporan
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedReports([]);
    } else {
      setSelectedReports(currentItems.map((report) => report.reportID));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Effect untuk mengupdate isAllSelected berdasarkan selectedReports
  useEffect(() => {
    if (
      currentItems.length > 0 &&
      selectedReports.length === currentItems.length
    ) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedReports, currentItems]);

  // Fungsi untuk menghapus report yang dipilih
  const handleDeleteSelectedReports = async () => {
    if (selectedReports.length === 0) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      // Menghapus setiap report secara berurutan
      const deletePromises = selectedReports.map((reportId) =>
        ReportService.deleteReport(reportId)
      );

      await Promise.all(deletePromises);

      // Update state lokal untuk menghapus report yang telah dihapus
      setAllReports((prevReports) =>
        prevReports.filter(
          (report) => !selectedReports.includes(report.reportID)
        )
      );

      // Reset selection
      setSelectedReports([]);
      setIsAllSelected(false);
      setShowDeleteDialog(false);

      // Reset halaman jika perlu
      const remainingReports = allReports.filter(
        (report) => !selectedReports.includes(report.reportID)
      );
      const newTotalPages = Math.ceil(remainingReports.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error: any) {
      console.error("Error deleting reports:", error);
      setDeleteError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while deleting reports. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Fungsi untuk menangani bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedReports.length === 0) {
      alert("Please select at least one report");
      return;
    }

    if (action === "delete") {
      setShowDeleteDialog(true);
    } else if (action.startsWith("status-")) {
      const newStatus = action.replace("status-", "").toUpperCase();

      try {
        // Update status untuk setiap report yang dipilih
        const updatePromises = selectedReports.map((reportId) =>
          ReportService.updateReportStatus(reportId, newStatus as any)
        );

        await Promise.all(updatePromises);

        // Refresh data
        const reports = await ReportService.getAllReports();
        setAllReports(reports);
        setSelectedReports([]);

        alert(
          `Status of ${
            selectedReports.length
          } reports successfully updated to ${ReportService.formatStatus(
            newStatus
          )}`
        );
      } catch (error: any) {
        console.error("Error updating report status:", error);
        alert("An error occurred while updating report status");
      }
    }
  };

  // Fungsi untuk me-reset filter
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setDateRange({ from: null, to: null });
    setSortField("createdAt");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  // Fungsi untuk menutup dialog delete
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteError("");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Management Reports</h1>
            <p className="text-gray-600 mt-1">Manage and Respond to Reports</p>
          </div>
        </div>

        {/* Header dan Filter */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">
                  Report List ({filteredReports.length})
                </h2>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {(statusFilter !== "all" ||
                    categoryFilter !== "all" ||
                    dateRange.from) && (
                    <Badge className="ml-1 bg-primary h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      <span className="text-xs">
                        {[
                          statusFilter !== "all" ? 1 : 0,
                          categoryFilter !== "all" ? 1 : 0,
                          dateRange.from ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </span>
                    </Badge>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("createdAt");
                        setSortDirection("desc");
                      }}
                    >
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("createdAt");
                        setSortDirection("asc");
                      }}
                    >
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("title");
                        setSortDirection("asc");
                      }}
                    >
                      Title (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("status");
                        setSortDirection("asc");
                      }}
                    >
                      Status (A-Z)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Panel Filter */}
          {isFilterOpen && (
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="on progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Category
                  </label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="EVENT_ISSUE">Event Issue</SelectItem>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="TICKET">Ticket</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Date Range
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Select dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from || undefined}
                        selected={{
                          from: dateRange.from || undefined,
                          to: dateRange.to || undefined,
                        }}
                        onSelect={(range) => {
                          if (!range) {
                            setDateRange({ from: null, to: null });
                          } else {
                            setDateRange({
                              from: range.from || null,
                              to: range.to || null,
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedReports.length > 0 && (
            <div className="p-4 border-b bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    {selectedReports.length} reports selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("status-pending")}
                      >
                        Set to Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("status-on_progress")}
                      >
                        Set to In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("status-resolved")}
                      >
                        Set to Resolved
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction("delete")}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabel Laporan */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("reportID")}
                    >
                      Report ID
                      {sortField === "reportID" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="w-[300px]">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      Title
                      {sortField === "title" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("createdBy")}
                    >
                      Created By
                      {sortField === "createdBy" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      Category
                      {sortField === "category" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {sortField === "status" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Date
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="w-[60px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((report) => (
                    <TableRow
                      key={report.reportID}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedReports.includes(report.reportID)}
                          onCheckedChange={() =>
                            handleSelectReport(report.reportID)
                          }
                          aria-label={`Select report ${report.reportID}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {report.reportID.substring(0, 8)}***
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="line-clamp-2">{report.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {userMap[report.createdBy] || report.createdBy}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ReportService.getCategoryDisplayName(report.category)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {ReportService.formatStatus(report.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Link href={`/management-reports/${report.reportID}`}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reports found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredReports.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <span className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredReports.length)} of{" "}
                  {filteredReports.length} reports
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">per page</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">First page</span>
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={i}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="icon"
                        onClick={() => paginate(pageNum)}
                        className="w-9 h-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Last page</span>
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{selectedReports.length}</strong> selected reports?
                <br />
                <span className="text-red-600 font-medium">
                  This action cannot be undone.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleCloseDeleteDialog}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelectedReports}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedReports.length} Reports
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
