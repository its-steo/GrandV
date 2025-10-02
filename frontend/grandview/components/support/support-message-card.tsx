"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Clock, Flag, Reply } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"

interface User {
  id: number
  username: string
  email: string
  phone_number: string
  referral_code: string
  is_manager: boolean
  is_staff: boolean
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
  comment_count: number
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

// Type for raw comment data from API
interface RawSupportComment {
  id: number
  message: number
  user: Omit<User, 'is_manager' | 'is_staff'> | null
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
  const username = message.user?.username || "Unknown"

  const fetchComments = useCallback(async (pageNum: number) => {
    try {
      setLoadingComments(true)
      const commentsData = await ApiService.getSupportMessageComments(message.id, pageNum)
      setComments((prev) => {
        const patchUser = (comment: RawSupportComment): SupportComment => ({
          ...comment,
          user: comment.user
            ? {
                ...comment.user,
                is_manager: false,
                is_staff: false,
              }
            : null,
        })
        const patchedResults = (commentsData.results || []).map(patchUser)
        return pageNum === 1 ? patchedResults : [...prev, ...patchedResults]
      })
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

  const handleTyping = async (text: string, inputType: "comment" | "reply") => {
    if (inputType === "comment") {
      setNewComment(text)
    } else {
      setReplyContent(text)
    }
    setCurrentInput(inputType)

    if (typingTimeout) clearTimeout(typingTimeout)

    setIsTyping(true)
    setTypingTimeout(setTimeout(() => setIsTyping(false), 3000))

    const match = text.match(/@(\w*)$/)
    if (match) {
      const query = match[1]
      if (query.length >= 1) {
        try {
          const users = await ApiService.getUsersForTagging(query)
          setTagSuggestions(users)
          setShowTagSuggestions(true)
        } catch (error) {
          setShowTagSuggestions(false)
        }
      } else {
        setShowTagSuggestions(false)
      }
    } else {
      setShowTagSuggestions(false)
    }
  }

  const handleTagSelect = (username: string, inputType: "comment" | "reply") => {
    if (inputType === "comment") {
      setNewComment((prev) => prev.replace(/@(\w*)$/, `@${username} `))
    } else {
      setReplyContent((prev) => prev.replace(/@(\w*)$/, `@${username} `))
    }
    setShowTagSuggestions(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }
    if (!currentUser) {
      toast.error("Please log in to add a comment")
      return
    }

    const mentions = newComment.match(/@(\w+)/g) || []
    for (const mention of mentions) {
      const username = mention.slice(1)
      try {
        const users = await ApiService.getUsersForTagging(username)
        if (!users.some((user) => user.username === username)) {
          toast.error(`User @${username} does not exist`)
          return
        }
      } catch (error) {
        toast.error("Failed to validate mentioned users")
        return
      }
    }

    try {
      setIsCommenting(true)
      const comment = await ApiService.createSupportComment(message.id, { content: newComment })
      setComments((prev) => [
        ...prev,
        {
          ...comment,
          user: comment.user
            ? {
                ...comment.user,
                is_manager: false,
                is_staff: false,
              }
            : null,
        },
      ])
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      if (errorMessage.includes("muted")) {
        toast.error("You are muted and cannot post comments")
      } else if (errorMessage.includes("blocked")) {
        toast.error("You are blocked and cannot post comments")
      } else {
        toast.error(errorMessage)
      }
      console.error("Add comment error:", error)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleAddReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty")
      return
    }
    if (!currentUser) {
      toast.error("Please log in to reply")
      return
    }
    if (!replyingTo) {
      toast.error("No comment selected for reply")
      return
    }

    const mentions = replyContent.match(/@(\w+)/g) || []
    for (const mention of mentions) {
      const username = mention.slice(1)
      try {
        const users = await ApiService.getUsersForTagging(username)
        if (!users.some((user) => user.username === username)) {
          toast.error(`User @${username} does not exist`)
          return
        }
      } catch (error) {
        toast.error("Failed to validate mentioned users")
        return
      }
    }

    try {
      setIsCommenting(true)
      const reply = await ApiService.createSupportComment(message.id, {
        content: replyContent,
        parent_comment: replyingTo,
      })
      // Patch user object to include is_manager and is_staff if missing
      const patchedReply = {
        ...reply,
        user: reply.user
          ? {
              ...reply.user,
              is_manager: false,
              is_staff: false,
            }
          : null,
      }
      setComments((prev) => [...prev, patchedReply])
      setReplyContent("")
      setReplyingTo(null)
      toast.success("Reply added successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      if (errorMessage.includes("muted")) {
        toast.error("You are muted and cannot post replies")
      } else if (errorMessage.includes("blocked")) {
        toast.error("You are blocked and cannot post replies")
      } else {
        toast.error(errorMessage)
      }
      console.error("Add reply error:", error)
    } finally {
      setIsCommenting(false)
    }
  }

  const renderComments = (comments: SupportComment[], parentId: number | null = null): React.ReactNode => {
    return comments
      .filter((comment) => comment.parent_comment === parentId)
      .map((comment) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, x: comment.user?.id === currentUser?.id ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="ml-0 sm:ml-4 mt-2 sm:mt-4 space-y-2"
        >
          <div
            className={cn(
              "max-w-[80%] xs:max-w-[75%] sm:max-w-[70%] md:max-w-[60%] p-2 sm:p-3 rounded-xl shadow-md text-xs sm:text-sm relative",
              comment.user?.id === currentUser?.id
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ml-auto"
                : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900"
            )}
          >
            {comment.user?.id !== currentUser?.id && (
              <div className="font-semibold text-xs sm:text-sm mb-1 flex items-center gap-1">
                {comment.user?.username || "Unknown"}
                {comment.user?.is_manager && (
                  <Badge className="ml-1 bg-green-500 text-white text-[10px] sm:text-xs">Manager</Badge>
                )}
                {comment.user?.is_staff && (
                  <Badge className="ml-1 bg-blue-500 text-white text-[10px] sm:text-xs">Admin</Badge>
                )}
              </div>
            )}
            <p className="leading-relaxed">{comment.content}</p>
            <div className="text-[10px] sm:text-xs text-gray-300 dark:text-gray-400 mt-1 flex items-center">
              {formatDistanceToNow(new Date(comment.created_at))}
            </div>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setReplyingTo(comment.id)}
            className="p-0 h-auto text-blue-500 hover:text-blue-700 text-xs sm:text-sm ml-2 sm:ml-4"
          >
            <Reply className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Reply
          </Button>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 sm:ml-6 mt-2"
            >
              <Textarea
                placeholder="Reply to comment..."
                value={replyContent}
                onChange={(e) => handleTyping(e.target.value, "reply")}
                className="w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 min-h-[60px] sm:min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl text-xs sm:text-sm"
                maxLength={500}
              />
              {showTagSuggestions && currentInput === "reply" && (
                <Popover open={showTagSuggestions}>
                  <PopoverContent className="w-48 p-2 bg-white border-gray-300 shadow-lg rounded-lg">
                    {tagSuggestions.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-blue-50 cursor-pointer text-gray-900 text-xs sm:text-sm rounded"
                        onClick={() => handleTagSelect(user.username, "reply")}
                      >
                        {user.username}
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              )}
              <div className="flex justify-end mt-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddReply}
                  disabled={isCommenting || !replyContent.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs sm:text-sm"
                >
                  {isCommenting ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Reply"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
          {renderComments(comments, comment.id)}
        </motion.div>
      ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-blue-200 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-bold text-sm sm:text-base md:text-lg mb-1 flex items-center gap-2">
            {username}
            {message.user?.is_manager && (
              <Badge className="bg-green-200 text-green-800 text-[10px] sm:text-xs">Manager</Badge>
            )}
            {message.user?.is_staff && (
              <Badge className="bg-blue-200 text-blue-800 text-[10px] sm:text-xs">Admin</Badge>
            )}
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-900 mb-2 leading-relaxed">
            {showFullContent ? message.content : truncatedContent}
          </p>
          {message.content.length > 200 && (
            <Button
              variant="link"
              onClick={() => setShowFullContent(!showFullContent)}
              className="p-0 text-blue-500 hover:text-blue-700 text-xs sm:text-sm"
            >
              {showFullContent ? "Show less" : "Read more"}
            </Button>
          )}
          {message.image && (
            <img
              src={message.image}
              alt="Support image"
              className="mt-2 rounded-lg max-w-full sm:max-w-[80%] md:max-w-[60%] object-contain"
            />
          )}
          <div className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center gap-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            {formatDistanceToNow(new Date(message.created_at))}
            {message.is_pinned && (
              <Badge className="ml-2 bg-yellow-200 text-yellow-800 text-[10px] sm:text-xs">Pinned</Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      <div className="flex gap-3 sm:gap-4 mt-4">
        <Button
          variant="ghost"
          onClick={onLike}
          disabled={message.is_liked || !currentUser}
          className={cn(
            "gap-1 sm:gap-2 text-xs sm:text-sm transition-colors rounded-full",
            message.is_liked ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
          )}
        >
          <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", message.is_liked && "fill-current")} />
          {message.like_count}
        </Button>
        <Button
          variant="ghost"
          className="gap-1 sm:gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs sm:text-sm transition-colors rounded-full"
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          {message.comment_count}
        </Button>
      </div>

      <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {loadingComments ? (
          <div className="text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-600 text-center text-xs sm:text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          <AnimatePresence>
            {renderComments(comments)}
          </AnimatePresence>
        )}
        {hasMore && (
          <Button
            onClick={() => fetchComments(page + 1)}
            disabled={loadingComments}
            className="w-full sm:w-auto mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs sm:text-sm rounded-lg"
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
      </div>

      {isTyping && (
        <p className="text-xs sm:text-sm text-gray-600 italic mt-2">Someone is typing...</p>
      )}

      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 sm:mt-6"
        >
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => handleTyping(e.target.value, "comment")}
            className="w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 min-h-[80px] sm:min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl text-xs sm:text-sm"
            maxLength={500}
          />
          {showTagSuggestions && currentInput === "comment" && (
            <Popover open={showTagSuggestions}>
              <PopoverContent className="w-48 p-2 bg-white border-gray-300 shadow-lg rounded-lg">
                {tagSuggestions.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-blue-50 cursor-pointer text-gray-900 text-xs sm:text-sm rounded"
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
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs sm:text-sm rounded-lg"
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
        </motion.div>
      )}
    </motion.div>
  )
}