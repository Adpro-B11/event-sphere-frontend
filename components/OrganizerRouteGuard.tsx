"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isOrganizer } from "@/utils/role-utils";

export default function OrganizerRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isOrganizer(user)) {
      router.push("/events");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="p-8 text-center">Checking access...</div>;
  }

  if (!isOrganizer(user)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}