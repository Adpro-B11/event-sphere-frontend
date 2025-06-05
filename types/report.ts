// Report types berdasarkan DTOs dari Spring Boot backend

export interface ReportListDTO {
  reportID: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export interface ReportDetailDTO {
  reportID: string;
  title: string;
  description: string;
  category: string;
  categoryReference?: string;
  status: string;
  createdAt: string;
  createdBy: string;
  messages: ReportMessageDTO[];
}

export interface ReportMessageDTO {
  messageID: string;
  message: string;
  timestamp: string;
  sender: string;
}

export interface CreateReportDTO {
  title: string;
  description: string;
  category: string;
  categoryReference?: string;
  createdBy: string;
}

export interface CreateReportMessageDTO {
  reportID: string;
  sender: string;
  message: string;
}

// Enums berdasarkan backend
export enum ReportCategory {
  OTHER = "OTHER",
  PAYMENT = "PAYMENT",
  TICKET = "TICKET",
  EVENT_ISSUE = "EVENT_ISSUE"
}

export enum ReportStatus {
  PENDING = "PENDING",
  ON_PROGRESS = "ON_PROGRESS",
  RESOLVED = "RESOLVED"
}

// Helper interfaces untuk form handling
export interface CreateReportFormData {
  title: string;
  description: string;
  category: ReportCategory;
  categoryReference?: string;
}

export interface ReportFilterOptions {
  status?: ReportStatus | "all";
  category?: ReportCategory | "all";
}