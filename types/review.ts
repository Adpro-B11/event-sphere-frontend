export interface ReviewDTO {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  username: string;
  eventId: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
  userId: string;
  username: string;
  eventId: string;
}

export interface EventRatingSummaryDTO {
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
    [key: number]: number;
  };
}