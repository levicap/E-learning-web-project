"use client"

import { useState, useRef, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star, Smile, CheckCircle } from 'lucide-react'
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const CourseReviewForm = ({ courseId, onReviewSubmitted }) => {
  const { user } = useUser()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const textareaRef = useRef(null)

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setComment("")
        setRating(5)
        setError("")
        setSuccess(false)
      }, 300)
    }
  }, [isOpen])

  const submitReview = async () => {
    setError("")
    if (!comment) {
      setError("Comment is required")
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user.id,
        },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Failed to submit review")
      } else {
        setSuccess(true)
        onReviewSubmitted(data)
        
        // Auto close after showing success message
        setTimeout(() => {
          setIsOpen(false)
        }, 2000)
      }
    } catch (err) {
      setError("Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  const addEmoji = (emoji) => {
    setComment((prev) => prev + emoji.native)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all"
          onClick={() => setIsOpen(true)}
        >
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Thank You!</DialogTitle>
            <p className="text-muted-foreground">Your review has been submitted successfully.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-center">Share Your Experience</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Your Rating</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-all ${
                          (hoverRating ? hoverRating >= star : rating >= star)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment with Emoji */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Your Review</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-none" side="top" align="end">
                      <Picker
                        data={data}
                        onEmojiSelect={addEmoji}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  ref={textareaRef}
                  placeholder="Share your thoughts about this course..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[150px] resize-none focus-visible:ring-primary"
                />
                <div className="text-xs text-right text-muted-foreground">{comment.length} characters</div>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
            </div>

            <DialogFooter className="flex justify-between items-center gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={submitReview} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CourseReviewForm
