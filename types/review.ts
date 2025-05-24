// Review and Event Rating Summary interfaces for EventSphere

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  username: string;
  eventId: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}

export interface EventRatingSummary {
  eventId: string;
  totalReviews: number;
  averageRating: number;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // rating -> count
  };
}