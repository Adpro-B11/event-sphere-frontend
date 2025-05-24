import eventApiClient from "@/lib/eventApi";
import type { 
  Review, 
  CreateReviewRequest, 
  UpdateReviewRequest, 
  EventRatingSummary 
} from "@/types/review";

const ReviewService = {
  // Get all reviews for a specific event
  getReviewsByEventId: async (eventId: string): Promise<Review[]> => {
    const response = await eventApiClient.get<Review[]>(`/api/events/${eventId}/reviews`);
    return response.data;
  },

  // Create a new review for an event
  createReview: async (eventId: string, reviewData: CreateReviewRequest): Promise<Review> => {
    const response = await eventApiClient.post<Review>(
      `/api/events/${eventId}/reviews`,
      reviewData
    );
    return response.data;
  },

  // Update an existing review
  updateReview: async (
    eventId: string, 
    reviewId: string, 
    reviewData: UpdateReviewRequest
  ): Promise<Review> => {
    const response = await eventApiClient.put<Review>(
      `/api/events/${eventId}/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  },

  // Delete a review
  deleteReview: async (eventId: string, reviewId: string): Promise<void> => {
    await eventApiClient.delete(`/api/events/${eventId}/reviews/${reviewId}`, {

    });
  },

  // Get event rating summary (calculated automatically on backend)
  getEventRatingSummary: async (eventId: string): Promise<EventRatingSummary> => {
    const response = await eventApiClient.get<EventRatingSummary>(
      `/api/events/${eventId}/rating-summary`
    );
    return response.data;
  },

  // Helper functions for frontend calculations
  calculateRatingStats: (reviews: Review[]) => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Number((totalRating / totalReviews).toFixed(1));

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as { [key: number]: number });

    // Ensure all ratings 1-5 are represented
    for (let i = 1; i <= 5; i++) {
      if (!ratingDistribution[i]) {
        ratingDistribution[i] = 0;
      }
    }

    return {
      totalReviews,
      averageRating,
      ratingDistribution
    };
  },

  // Check if user can review an event
  canUserReview: (reviews: Review[], userId: string): boolean => {
    return !reviews.some(review => review.userId === userId);
  },

  // Get user's review for an event
  getUserReview: (reviews: Review[], userId: string): Review | null => {
    return reviews.find(review => review.userId === userId) || null;
  }
};

export default ReviewService;