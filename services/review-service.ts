import eventApiClient from "@/lib/eventApi";
import type { 
  ReviewDTO, 
  ReviewRequest,
  EventRatingSummaryDTO
} from "@/types/review";

const ReviewService = {
  // Get all reviews for a specific event
  getReviewsByEventId: async (eventId: string): Promise<ReviewDTO[]> => {
    const response = await eventApiClient.get<ReviewDTO[]>(`/api/events/${eventId}/reviews`);
    return response.data;
  },

  // Create a new review for an event
  createReview: async (eventId: string, rating: number, comment: string | undefined, userId: string, username: string): Promise<ReviewDTO> => {
    const requestBody: ReviewRequest = {
      rating,
      comment,
      userId,
      username,
      eventId
    };

    const response = await eventApiClient.post<ReviewDTO>(
      `/api/events/${eventId}/reviews`,
      requestBody
    );
    return response.data;
  },

  // Update an existing review
  updateReview: async (
    eventId: string, 
    reviewId: string, 
    rating: number,
    comment: string | undefined,
    userId: string,
    username: string
  ): Promise<ReviewDTO> => {
    const requestBody: ReviewRequest = {
      rating,
      comment,
      userId,
      username,
      eventId
    };

    const response = await eventApiClient.put<ReviewDTO>(
      `/api/events/${eventId}/reviews/${reviewId}`,
      requestBody
    );
    return response.data;
  },

  // Delete a review
  deleteReview: async (eventId: string, reviewId: string, userId: string, username: string): Promise<void> => {
    const requestBody: ReviewRequest = {
      rating: 1, 
      userId,
      username,
      eventId
    };

    await eventApiClient.delete(`/api/events/${eventId}/reviews/${reviewId}`, {
      data: requestBody
    });
  },

  // Get event rating summary
  getEventRatingSummary: async (eventId: string): Promise<EventRatingSummaryDTO> => {
    const response = await eventApiClient.get<EventRatingSummaryDTO>(
      `/api/events/${eventId}/rating-summary`
    );
    return response.data;
  },

  // Helper functions for frontend calculations
  calculateRatingStats: (reviews: ReviewDTO[]) => {
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
  canUserReview: (reviews: ReviewDTO[], userId: string): boolean => {
    return !reviews.some(review => review.userId === userId);
  },

  // Get user's review for an event
  getUserReview: (reviews: ReviewDTO[], userId: string): ReviewDTO | null => {
    return reviews.find(review => review.userId === userId) || null;
  },

  // Check if event is finished (temporary implementation)
  isEventFinished: (eventDate: string): boolean => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  },

  userHasTicket: (userId: string, eventId: string): boolean => {
    // TODO: Implement actual ticket check logic
    // This should call the ticket service to verify if user has a ticket for the event
    return true;
  }
};

export default ReviewService;