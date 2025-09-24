"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageSquare, Clock, Flag, MoreHorizontal, Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Popover, PopoverContent } from "@/components/ui/popover"

interface User {
  id: number
  username: string
  email: string
  phone_number: string
  referral_code: string
}

interface SupportMessage {
  id: number
  content: string
  user: User | null
  created_at: string
  image: string | null
  is_private: boolean
  is_pinned: boolean
  is_liked: boolean
  like_count: number
}

interface SupportComment {
  id: number
  message: number
  user: User | null
  content: string
  created_at: string
  parent_comment: number | null
  mentioned_users: Array<{ id: number; username: string }>
}

interface SupportMessageCardProps {
  message: SupportMessage
  onLike: () => void
  currentUser: User | null
}

export function SupportMessageCard({ message, onLike, currentUser }: SupportMessageCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [comments, setComments] = useState<SupportComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [tagSuggestions, setTagSuggestions] = useState<Array<{ id: number; username: string }>>([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [currentInput, setCurrentInput] = useState<"comment" | "reply">("comment")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const truncatedContent = message.content.length > 200 ? message.content.substring(0, 200) + "..." : message.content
  const shortTitle = message.content.length > 50 ? message.content.substring(0, 50) + "..." : message.content
  const username = message.user?.username || "Unknown"
  const avatarInitial = username[0]?.toUpperCase() || "?"

  const fetchComments = useCallback(async (pageNum: number) => {
    try {
      setLoadingComments(true)
      const commentsData = await ApiService.getSupportMessageComments(message.id, pageNum)
      setComments((prev) => (pageNum === 1 ? commentsData.results || [] : [...prev, ...(commentsData.results || [])]))
      setHasMore(!!commentsData.next)
      setPage(pageNum)
    } catch (error: unknown) {
      toast.error("Failed to load comments")
      console.error("Comments fetch error:", error)
    } finally {
      setLoadingComments(false)
    }
  }, [message.id])

  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }
    if (!currentUser) {
      toast.error("Please log in to add a comment")
      return
    }

    // Validate mentions
    const mentions = newComment.match(/@(\w+)/g) || []
    for (const mention of mentions) {
      const username = mention.slice(1) // Remove '@'
      try {
        const users = await ApiService.getUsersForTagging(username)
        if (!users.some((user) => user.username === username)) {
          toast.error(`User @${username} does not exist`)
          return
        }
      } catch (error: unknown) {
        toast.error("Failed to validate mentioned users")
        return
      }
    }

    try {
      setIsCommenting(true)
      const comment = await ApiService.createSupportComment(message.id, { content: newComment })
      setComments((prev) => [...prev, comment])
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      if (errorMessage.includes("muted")) {
        toast.error("You are muted and cannot post comments")
      } else if (errorMessage.includes("blocked")) {
        toast.error("You are blocked and cannot post comments")
      } else if (errorMessage.includes("does not exist")) {
        toast.error("Tagged user does not exist")
      } else {
        toast.error(`Failed to add comment: ${errorMessage}`)
      }
    } finally {
      setIsCommenting(false)
      setIsTyping(false)
    }
  }

  const handleAddReply = async (parentCommentId: number) => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty")
      return
    }
    if (!currentUser) {
      toast.error("Please log in to reply")
      return
    }

    // Validate parent_comment
    const parentComment = comments.find((comment) => comment.id === parentCommentId)
    if (!parentComment || parentComment.message !== message.id) {
      toast.error("Invalid parent comment")
      return
    }

    // Validate mentions
    const mentions = replyContent.match(/@(\w+)/g) || []
    for (const mention of mentions) {
      const username = mention.slice(1)
      try {
        const users = await ApiService.getUsersForTagging(username)
        if (!users.some((user) => user.username === username)) {
          toast.error(`User @${username} does not exist`)
          return
        }
      } catch (error: unknown) {
        toast.error("Failed to validate mentioned users")
        return
      }
    }

    try {
      setIsCommenting(true)
      const comment = await ApiService.createSupportComment(message.id, {
        content: replyContent,
        parent_comment: parentCommentId,
      })
      setComments((prev) => [...prev, comment])
      setReplyContent("")
      setReplyingTo(null)
      toast.success("Reply added successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      if (errorMessage.includes("muted")) {
        toast.error("You are muted and cannot post comments")
      } else if (errorMessage.includes("blocked")) {
        toast.error("You are blocked and cannot post comments")
      } else if (errorMessage.includes("does not exist")) {
        toast.error("Tagged user does not exist")
      } else {
        toast.error(`Failed to add reply: ${errorMessage}`)
      }
    } finally {
      setIsCommenting(false)
    }
  }

  const handleTyping = async (value: string, inputType: "comment" | "reply") => {
    setCurrentInput(inputType)
    if (inputType === "comment") {
      setNewComment(value)
    } else {
      setReplyContent(value)
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    setIsTyping(true)
    setTypingTimeout(
      setTimeout(() => {
        setIsTyping(false)
      }, 1000),
    )

    const lastWord = value.split(" ").pop() || ""
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.slice(1)
      try {
        const users = await ApiService.getUsersForTagging(query)
        setTagSuggestions(users)
        setShowTagSuggestions(true)
      } catch (error: unknown) {
        console.error("Failed to fetch tag suggestions:", error)
      }
    } else {
      setShowTagSuggestions(false)
      setTagSuggestions([])
    }
  }

  const handleTagSelect = (username: string, inputType: "comment" | "reply") => {
    const currentValue = inputType === "comment" ? newComment : replyContent
    const words = currentValue.split(" ")
    words[words.length - 1] = `@${username} `
    const newValue = words.join(" ")
    if (inputType === "comment") {
      setNewComment(newValue)
    } else {
      setReplyContent(newValue)
    }
    setShowTagSuggestions(false)
    setTagSuggestions([])
  }

  const renderComments = (comments: SupportComment[], depth = 0, parentId: number | null = null) => {
    return comments
      .filter((comment) => comment.parent_comment === parentId)
      .map((comment) => (
        <div key={comment.id} className={cn("ml-4", depth > 0 && "ml-8 border-l-2 border-border/50 pl-4")}>
          <div className="flex items-start gap-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{comment.user?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user?.username || "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-muted-foreground mt-1"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
          </div>
          {replyingTo === comment.id && (
            <div className="mt-2 ml-8">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => handleTyping(e.target.value, "reply")}
                className="glass border-white/20 min-h-[60px] resize-none"
                maxLength={500}
              />
              {showTagSuggestions && currentInput === "reply" && (
                <Popover open={showTagSuggestions}>
                  <PopoverContent className="w-48 p-2">
                    {tagSuggestions.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-accent cursor-pointer"
                        onClick={() => handleTagSelect(user.username, "reply")}
                      >
                        {user.username}
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              )}
              <div className="flex justify-end mt-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)} disabled={isCommenting}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAddReply(comment.id)}
                  disabled={isCommenting || !replyContent.trim()}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {isCommenting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Reply"
                  )}
                </Button>
              </div>
            </div>
          )}
          {renderComments(comments, depth + 1, comment.id)}
        </div>
      ))
  }

  return (
    <Card className="professional-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{avatarInitial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-balance">{shortTitle}</h3>
              {message.is_pinned && (
                <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">Pinned</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="font-medium">{username}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {showFullContent ? message.content : truncatedContent}
            </p>
            {message.content.length > 200 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="p-0 h-auto text-primary"
              >
                {showFullContent ? "Show less" : "Read more"}
              </Button>
            )}
          </div>

          {message.image && <img src={message.image} alt="Support image" className="max-w-full h-auto rounded-lg" />}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                disabled={message.is_liked || !currentUser}
                className={cn(
                  "gap-2 hover:bg-red-50 hover:text-red-600 transition-colors",
                  message.is_liked && "text-red-600 bg-red-50",
                )}
              >
                <Heart className={cn("h-4 w-4", message.is_liked && "fill-current")} />
                <span className="font-medium">{message.like_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{comments.length}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <h4 className="font-semibold text-sm">Comments</h4>
            {loadingComments ? (
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-3">{renderComments(comments)}</div>
            )}
            {hasMore && (
              <Button
                onClick={() => fetchComments(page + 1)}
                disabled={loadingComments}
                className="mt-4 mx-auto bg-gradient-to-r from-primary to-secondary"
              >
                {loadingComments ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Comments"
                )}
              </Button>
            )}

            {isTyping && <p className="text-xs text-muted-foreground italic">Someone is typing...</p>}

            {currentUser && (
              <div className="mt-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => handleTyping(e.target.value, "comment")}
                  className="glass border-white/20 min-h-[80px] resize-none"
                  maxLength={500}
                />
                {showTagSuggestions && currentInput === "comment" && (
                  <Popover open={showTagSuggestions}>
                    <PopoverContent className="w-48 p-2">
                      {tagSuggestions.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleTagSelect(user.username, "comment")}
                        >
                          {user.username}
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={isCommenting || !newComment.trim()}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    {isCommenting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}