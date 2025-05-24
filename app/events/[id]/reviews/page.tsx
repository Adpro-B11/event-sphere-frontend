"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, StarOff, ArrowLeft, User, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import EventService from "@/services/event-service"
import ReviewService from "@/services/review-service"
import type { Event } from "@/types/event"
import type { Review, EventRatingSummary } from "@/types/review"

export default function EventReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // State management
  const [event, setEvent] = useState<Event | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [ratingSummary, setRatingSummary] = useState<EventRatingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form state for new/edit review
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const eventId = params.id as string

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      setIsLoading(true)
      setError("")
      
      try {
        // Fetch event details and reviews in parallel
        const [eventData, reviewsData] = await Promise.all([
          EventService.getEventById(eventId),
          ReviewService.getReviewsByEventId(eventId)
        ])
        
        setEvent(eventData)
        setReviews(reviewsData)
        
        // Check if current user has already reviewed
        if (user?.id) {
          const existingUserReview = ReviewService.getUserReview(reviewsData, user.id)
          if (existingUserReview) {
            setUserReview(existingUserReview)
            setRating(existingUserReview.rating)
            setComment(existingUserReview.comment || "")
          }
        }
        
        // Fetch rating summary
        try {
          const summary = await ReviewService.getEventRatingSummary(eventId)
          setRatingSummary(summary)
        } catch (summaryError) {
          // If backend summary fails, calculate from reviews
          const stats = ReviewService.calculateRatingStats(reviewsData)
          setRatingSummary({
            eventId,
            totalReviews: stats.totalReviews,
            averageRating: stats.averageRating
          })
        }
        
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.response?.data?.message || "Failed to load reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId, user?.id])

  // Check if event has finished (only finished events can be reviewed)
  const isEventFinished = (eventDate: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    return eventDateObj < today
  }

  // Handle review submission (create or update)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated || !user) {
      setError("Please login to submit a review")
      return
    }

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      let updatedReview: Review

      if (userReview) {
        // Update existing review
        updatedReview = await ReviewService.updateReview(eventId, userReview.id, {
          rating,
          comment: comment.trim() || undefined
        })
        setSuccess("Review updated successfully!")
        
        // Update reviews list
        setReviews(reviews.map(r => r.id === userReview.id ? updatedReview : r))
      } else {
        // Create new review
        updatedReview = await ReviewService.createReview(eventId, {
          rating,
          comment: comment.trim() || undefined
        })
        console.log(updatedReview)
        console.log("here")
        setSuccess("Review submitted successfully!")
        
        // Add to reviews list
        setReviews([updatedReview, ...reviews])
      }
      
      setUserReview(updatedReview)
      setIsEditing(false)
      
      // Refresh rating summary
      try {
        const summary = await ReviewService.getEventRatingSummary(eventId)
        setRatingSummary(summary)
      } catch {
        // Fallback to manual calculation
        const newReviews = userReview 
          ? reviews.map(r => r.id === userReview.id ? updatedReview : r)
          : [updatedReview, ...reviews]
        const stats = ReviewService.calculateRatingStats(newReviews)
        setRatingSummary({
          eventId,
          totalReviews: stats.totalReviews,
          averageRating: stats.averageRating
        })
      }
      
    } catch (err: any) {
      console.error("Error submitting review:", err)
      if (err.response?.status === 409) {
        setError("You have already reviewed this event")
      } else if (err.response?.status === 403) {
        setError("You are not authorized to perform this action")
      } else {
        setError(err.response?.data?.message || "Failed to submit review. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle review deletion
  const handleDeleteReview = async () => {
    if (!userReview || !user) return
    
    if (!window.confirm("Are you sure you want to delete your review?")) return
    
    setIsSubmitting(true)
    setError("")
    
    try {
      await ReviewService.deleteReview(eventId, userReview.id)
      
      // Remove from UI
      setReviews(reviews.filter(r => r.id !== userReview.id))
      setUserReview(null)
      setRating(0)
      setComment("")
      setIsEditing(false)
      setSuccess("Review deleted successfully!")
      
      // Update rating summary
      const newReviews = reviews.filter(r => r.id !== userReview.id)
      const stats = ReviewService.calculateRatingStats(newReviews)
      setRatingSummary({
        eventId,
        totalReviews: stats.totalReviews,
        averageRating: stats.averageRating
      })
      
    } catch (err: any) {
      console.error("Error deleting review:", err)
      setError(err.response?.data?.message || "Failed to delete review")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Star Rating Component
  const StarRating = ({ rating: currentRating, onRatingChange, readonly = false }: { 
    rating: number, 
    onRatingChange?: (rating: number) => void,
    readonly?: boolean 
  }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400'} transition-colors`}
            onClick={() => !readonly && onRatingChange?.(star)}
            disabled={readonly}
          >
            {star <= currentRating ? (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading reviews...</span>
        </div>
      </div>
    )
  }

  // Event not found
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Event not finished yet
  if (!isEventFinished(event.date)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reviews Not Available</h1>
          <p className="text-gray-600 mb-6">
            Reviews are only available after the event has finished.
          </p>
          <Link href={`/events/${eventId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Reviews for {event.title}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <StarRating rating={ratingSummary?.averageRating || 0} readonly />
            <span className="ml-2 text-lg font-medium">
              {ratingSummary?.averageRating?.toFixed(1) || '0.0'} ({ratingSummary?.totalReviews || 0} review{(ratingSummary?.totalReviews || 0) !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">All Reviews</h2>
          
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No reviews yet. Be the first to review this event!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{review.username}</h4>
                          <div className="flex items-center space-x-2">
                            <StarRating rating={review.rating} readonly />
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                            {review.updatedAt && (
                              <Badge variant="secondary" className="text-xs">
                                Edited
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent className="pt-0">
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="lg:col-span-1">
          {isAuthenticated ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {userReview ? (isEditing ? 'Edit Your Review' : 'Your Review') : 'Write a Review'}
                </CardTitle>
                <CardDescription>
                  {userReview && !isEditing ? 
                    'You have already reviewed this event' : 
                    'Share your experience with others'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userReview && !isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Your Rating</Label>
                      <StarRating rating={userReview.rating} readonly />
                    </div>
                    {userReview.comment && (
                      <div>
                        <Label>Your Comment</Label>
                        <p className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-md">
                          {userReview.comment}
                        </p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="flex-1"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={handleDeleteReview}
                        className="flex-1"
                        variant="destructive"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating *</Label>
                      <div className="mt-1">
                        <StarRating rating={rating} onRatingChange={setRating} />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="comment">Comment (Optional)</Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this event..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isSubmitting || rating === 0} className="flex-1">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {userReview ? "Updating..." : "Submitting..."}
                          </>
                        ) : (
                          userReview ? "Update Review" : "Submit Review"
                        )}
                      </Button>
                      {isEditing && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            if (userReview) {
                              setRating(userReview.rating)
                              setComment(userReview.comment || "")
                            }
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Login Required</CardTitle>
                <CardDescription>
                  You need to be logged in to write a review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button className="w-full">Login to Review</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}