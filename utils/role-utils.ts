import { User } from "@/types/auth";

export const hasRole = (user: User | null, role: string): boolean => {
  if (!user || !user.role) return false;
  return user.role.includes(role);
};

export const isOrganizer = (user: User | null): boolean => {
  return hasRole(user, "ORGANIZER");
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, "ADMIN");
};

export const canManageEvent = (user: User | null, eventOrganizer?: string | null): boolean => {
  if (!user) return false;
  
  if (user.role?.includes('ORGANIZER')) {
    if (!eventOrganizer) return true;
    
    return user.username === eventOrganizer;
  }
  
  return false;
};