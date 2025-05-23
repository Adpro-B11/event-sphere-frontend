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
import { Star, StarOff, ArrowLeft, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
  userId: string
  username: string
  eventId: string
}

interface Event {
  id: string
  title: string
  date: string
  status: string
}

export default function EventReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form state for new/edit review
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const eventResponse = await EventService.getEventById(eventId)
        // const reviewsResponse = await ReviewService.getReviewsByEventId(eventId)
        
        // Placeholder data
        setTimeout(() => {
          const mockEvent = {
            id: eventId,
            title: "Tech Conference 2024",
            date: "2024-12-25",
            status: "PUBLISHED"
          }
          
          const mockReviews = [
            {
              id: "rev_1",
              rating: 5,
              comment: "Amazing event! Great speakers and networking opportunities.",
              createdAt: "2024-12-26T10:00:00Z",
              userId: "user_1",
              username: "John Doe",
              eventId: eventId
            },
            {
              id: "rev_2",
              rating: 4,
              comment: "Very informative sessions, but the venue was a bit crowded.",
              createdAt: "2024-12-26T14:30:00Z",
              userId: "user_2",
              username: "Jane Smith",
              eventId: eventId
            }
          ]
          
          setEvent(mockEvent)
          setReviews(mockReviews)
          
          // Check if current user has already reviewed
          const existingUserReview = mockReviews.find(r => r.userId === user?.id)
          if (existingUserReview) {
            setUserReview(existingUserReview)
            setRating(existingUserReview.rating)
            setComment(existingUserReview.comment)
          }
          
          setIsLoading(false)
        }, 1000)
      } catch (err: any) {
        setError("Failed to load reviews")
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchData()
    }
  }, [eventId, user?.id])

  const isEventFinished = (eventDate: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    return eventDateObj < today
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setError("Please login to submit a review")
      return
    }

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // TODO: Replace with actual API call
      // if (userReview) {
      //   await ReviewService.updateReview(userReview.id, { rating, comment })
      // } else {
      //   await ReviewService.createReview(eventId, { rating, comment })
      // }
      
      // Mock API call
      setTimeout(() => {
        setSuccess(userReview ? "Review updated successfully!" : "Review submitted successfully!")
        setIsSubmitting(false)
        setIsEditing(false)
        
        // Update local state
        const newReview = {
          id: userReview?.id || `rev_${Date.now()}`,
          rating,
          comment,
          createdAt: userReview?.createdAt || new Date().toISOString(),
          updatedAt: userReview ? new Date().toISOString() : undefined,
          userId: user!.id,
          username: user!.username,
          eventId: eventId
        }
        
        if (userReview) {
          setReviews(reviews.map(r => r.id === userReview.id ? newReview : r))
        } else {
          setReviews([newReview, ...reviews])
        }
        
        setUserReview(newReview)
      }, 1500)
      
    } catch (err: any) {
      setError("Failed to submit review. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!userReview) return
    
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        // TODO: Replace with actual API call
        // await ReviewService.deleteReview(userReview.id)
        
        setTimeout(() => {
          setReviews(reviews.filter(r => r.id !== userReview.id))
          setUserReview(null)
          setRating(0)
          setComment("")
          setSuccess("Review deleted successfully!")
        }, 500)
        
      } catch (err: any) {
        setError("Failed to delete review")
      }
    }
  }

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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Number((sum / reviews.length).toFixed(1))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

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

  const eventFinished = isEventFinished(event.date)

  if (!eventFinished) {
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
          <Button variant="ghost" className="mb-4" type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Reviews for {event.title}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <StarRating rating={calculateAverageRating()} readonly />
            <span className="ml-2 text-lg font-medium">
              {calculateAverageRating()} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
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
                              <Badge variant="secondary">Edited</Badge>
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
                        variant="outline"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={handleDeleteReview}
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        Delete
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
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? "Submitting..." : (userReview ? "Update Review" : "Submit Review")}
                      </Button>
                      {isEditing && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false)
                            setRating(userReview!.rating)
                            setComment(userReview!.comment)
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