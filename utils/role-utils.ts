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

export const canManageEvent = (user: User | null, eventOrganizer?: string): boolean => {
  if (!user) return false;
  
  // Organizer can only manage their own events
  if (isOrganizer(user)) {
    // If no event organizer specified, general create permission
    if (!eventOrganizer) return true;
    
    // Otherwise check if this is the organizer's own event
    return user.username === eventOrganizer;
  }
  
  return false;
};