import eventApiClient from "@/lib/eventApi";
import AuthService from "@/services/auth-service";
import type { 
  ReportListDTO,
  ReportDetailDTO,
  ReportMessageDTO,
  CreateReportDTO,
  CreateReportMessageDTO,
  ReportStatus
} from "@/types/report";

const ReportService = {
  // Membuat report baru
  createReport: async (reportData: CreateReportDTO): Promise<ReportDetailDTO> => {
    const response = await eventApiClient.post<ReportDetailDTO>("/api/reports/new", reportData);
    return response.data;
  },

  // Mendapatkan semua reports
  getAllReports: async (): Promise<ReportListDTO[]> => {
    const response = await eventApiClient.get<ReportListDTO[]>("/api/reports");
    return response.data;
  },

  // Mendapatkan semua reports secara async
  getAllReportsAsync: async (): Promise<ReportListDTO[]> => {
    const response = await eventApiClient.get<ReportListDTO[]>("/api/reports/async");
    return response.data;
  },

  // Mendapatkan reports berdasarkan user
  getUserReports: async (userId: string): Promise<ReportListDTO[]> => {
    const response = await eventApiClient.get<ReportListDTO[]>(`/api/reports/user/${userId}`);
    return response.data;
  },

  // Mendapatkan reports berdasarkan user secara async
  getUserReportsAsync: async (userId: string): Promise<ReportListDTO[]> => {
    const response = await eventApiClient.get<ReportListDTO[]>(`/api/reports/user/${userId}/async`);
    return response.data;
  },

  // Mendapatkan detail report berdasarkan ID
  getReportById: async (reportId: string): Promise<ReportDetailDTO> => {
    const response = await eventApiClient.get<ReportDetailDTO>(`/api/reports/${reportId}`);
    return response.data;
  },

  // Update status report (untuk admin/organizer)
  updateReportStatus: async (reportId: string, status: ReportStatus): Promise<ReportDetailDTO> => {
    const response = await eventApiClient.patch<ReportDetailDTO>(
      `/api/reports/${reportId}/status`,
      { status: status }
    );
    return response.data;
  },

  // Menghapus report
  deleteReport: async (reportId: string): Promise<void> => {
    await eventApiClient.delete(`/api/reports/${reportId}`);
  },

  // === Report Messages ===

  // Membuat message baru untuk report
  createReportMessage: async (messageData: CreateReportMessageDTO): Promise<ReportMessageDTO> => {
    const response = await eventApiClient.post<ReportMessageDTO>(
      "/api/report-messages/new",
      messageData
    );
    return response.data;
  },

  // Mendapatkan semua messages untuk report tertentu
  getReportMessages: async (reportId: string): Promise<ReportMessageDTO[]> => {
    const response = await eventApiClient.get<ReportMessageDTO[]>(
      `/api/report-messages/report/${reportId}`
    );
    return response.data;
  },

  // Mendapatkan message berdasarkan ID
  getMessageById: async (messageId: string): Promise<ReportMessageDTO> => {
    const response = await eventApiClient.get<ReportMessageDTO>(
      `/api/report-messages/${messageId}`
    );
    return response.data;
  },

  // Helper function to get username from user ID
  getUsernameFromId: async (userId: string): Promise<string> => {
    try {
      const userData = await AuthService.getCurrentUserById(userId);
      return userData.username || userData.email;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User";
    }
  },

  // === Helper Functions ===

  // Filter reports berdasarkan status
  filterReportsByStatus: (reports: ReportListDTO[], status: string): ReportListDTO[] => {
    if (status === "all") return reports;
    return reports.filter((report) => 
      report.status.toLowerCase() === status.toLowerCase().replace("_", " ")
    );
  },

  // Filter reports berdasarkan kategori
  filterReportsByCategory: (reports: ReportListDTO[], category: string): ReportListDTO[] => {
    if (category === "all") return reports;
    return reports.filter((report) => report.category === category);
  },

  // Sort reports berdasarkan tanggal (terbaru dulu)
  sortReportsByDate: (reports: ReportListDTO[], ascending: boolean = false): ReportListDTO[] => {
    return reports.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Cek apakah user adalah admin/staff berdasarkan nama sender
  isAdminMessage: (sender: string): boolean => {
    return sender.toLowerCase().includes("admin") || 
           sender.toLowerCase().includes("organizer") ||
           sender.toLowerCase().includes("staff");
  },

  // Format status untuk display
  formatStatus: (status: string): string => {
    return status.replace("_", " ").toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  // Get status badge color
  getStatusBadgeColor: (status: string): string => {
    switch (status.toLowerCase().replace("_", " ")) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "on progress":
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Get category display name
  getCategoryDisplayName: (category: string): string => {
    switch (category) {
      case "EVENT_ISSUE":
        return "Event Issue";
      case "PAYMENT":
        return "Payment";
      case "TICKET":
        return "Ticket";
      case "OTHER":
        return "Other";
      default:
        return category;
    }
  }
};

export default ReportService;