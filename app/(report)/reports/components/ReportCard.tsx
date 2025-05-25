import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, User, Tag, Clock } from "lucide-react";
import type { ReportListDTO } from "@/types/report";
import ReportService from "@/services/report-service";
import { useEffect, useState } from "react";

interface ReportCardProps {
  report: ReportListDTO;
  username?: string;
}

export function ReportCard({ report, username }: ReportCardProps) {
  const [creatorUsername, setCreatorUsername] = useState<string>(
    username || "Loading..."
  );

  useEffect(() => {
    // Only fetch username if not provided as prop
    if (!username) {
      const fetchUsername = async () => {
        const username = await ReportService.getUsernameFromId(
          report.createdBy
        );
        setCreatorUsername(username);
      };

      fetchUsername();
    }
  }, [report.createdBy, username]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
      } else {
        return formatDate(dateString);
      }
    }
  };

  return (
    <Link href={`/reports/${report.reportID}`}>
      <Card className="h-full hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {report.title}
            </CardTitle>
            <Badge
              className={`${ReportService.getStatusBadgeColor(
                report.status
              )} shrink-0`}
              variant="secondary"
            >
              {ReportService.formatStatus(report.status)}
            </Badge>
          </div>
          <CardDescription className="line-clamp-3 text-gray-600">
            {report.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">
                {ReportService.getCategoryDisplayName(report.category)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span title={formatDate(report.createdAt)}>
                {formatRelativeTime(report.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>By {creatorUsername}</span>
            </div>
          </div>

          {/* Status indicator bar */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">
                {report.status.toLowerCase() === "pending" &&
                  "Waiting for review"}
                {report.status.toLowerCase() === "on_progress" &&
                  "Being processed"}
                {report.status.toLowerCase() === "resolved" && "Issue resolved"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
