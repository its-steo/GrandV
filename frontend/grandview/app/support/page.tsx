"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { CreateSupportMessage } from "@/components/support/create-support-message"
import { SupportFilters } from "@/components/support/support-filter"
import { ApiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Loader2, MessageCircle, Search, Plus, Star, Shield, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SupportMessageCard } from "@/components/support/support-message-card"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// Centralized User interface
interface User {
  id: number
  username: string
  email: string
  phone_number: string
  referral_code: string
  is_manager: boolean
  is_staff: boolean
  last_support_view?: string
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
  unread_comment_count: number
}

interface Conversation {
  id: number
  username: string
  unread_count: number
}

interface PrivateMessage {
  id: number
  sender: User
  receiver: User
  content: string
  image: string | null
  created_at: string
  read_at: string | null
}

export default function SupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [privateConversations, setPrivateConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
  const [newPrivateMessage, setNewPrivateMessage] = useState("")
  const [admins, setAdmins] = useState<User[]>([])
  const [showContactAdmin, setShowContactAdmin] = useState(false)
  const [loadingPrivate, setLoadingPrivate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [unreadPublicCount, setUnreadPublicCount] = useState(0)
  const [unreadMyPostsCount, setUnreadMyPostsCount] = useState(0)
  const [unreadPrivateCount, setUnreadPrivateCount] = useState(0)
  const { user: authUser } = useAuth()
  const user = authUser as User | null // Cast to local User interface

  useEffect(() => {
    fetchSupportData(1)
    fetchPrivateConversations()
    fetchAdmins()
  }, [selectedCategory, selectedPriority, activeTab])

  useEffect(() => {
    // Calculate unread counts for public messages and comments
    if (activeTab === "all") {
      const unreadMessages = messages.filter((msg) => new Date(msg.created_at) > new Date(user?.last_support_view || 0)).length
      const unreadComments = messages.reduce((sum, msg) => sum + msg.unread_comment_count, 0)
      setUnreadPublicCount(unreadMessages + unreadComments)
    } else if (activeTab === "my-messages") {
      const unreadMessages = messages.filter((msg) => new Date(msg.created_at) > new Date(user?.last_support_view || 0)).length
      const unreadComments = messages.reduce((sum, msg) => sum + msg.unread_comment_count, 0)
      setUnreadMyPostsCount(unreadMessages + unreadComments)
    }
  }, [messages, activeTab, user])

  useEffect(() => {
    // Calculate unread count for private messages
    const totalUnread = privateConversations.reduce((sum, convo) => sum + (convo.unread_count || 0), 0)
    setUnreadPrivateCount(totalUnread)
    console.log("Private conversations with unread counts:", privateConversations)
  }, [privateConversations])

  const fetchSupportData = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      const params = {
        page: pageNum,
        search: searchQuery,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        priority: selectedPriority !== "all" ? selectedPriority : undefined,
        user_id: activeTab === "my-messages" ? user?.id : undefined,
      }
      const messagesData = await ApiService.getSupportMessages(params)
      // Sort messages by created_at ascending (newest at bottom)
      const sortedMessages = (messagesData.results || []).sort((a, b) =>
        new Date(a.created_at) > new Date(b.created_at) ? 1 : -1
      )
      setMessages((prev) => (pageNum === 1 ? sortedMessages as SupportMessage[] : [...prev, ...sortedMessages] as SupportMessage[]))
      setHasMore(!!messagesData.next)
      setPage(pageNum)
      console.log("Fetched messages:", sortedMessages)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to load support data")
      console.error("Support data error:", error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  const fetchPrivateConversations = async () => {
    try {
      const convos = await ApiService.getPrivateConversations()
      setPrivateConversations(convos as Conversation[])
      console.log("Fetched conversations:", convos)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to load conversations")
      console.error("Conversations error:", error)
    }
  }

  const fetchAdmins = async () => {
    try {
      const data = await ApiService.getAdmins()
      setAdmins(data as User[])
      console.log("Fetched admins:", data)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to load admins")
      console.error("Admins error:", error)
    }
  }

  const fetchPrivateMessages = async (receiverId: number) => {
    setLoadingPrivate(true)
    try {
      const data = await ApiService.getPrivateMessages(receiverId) as { results?: PrivateMessage[] }
      // Sort private messages by created_at ascending (newest at bottom)
      const sortedMessages = (data.results || []).sort((a, b) =>
        new Date(a.created_at) > new Date(b.created_at) ? 1 : -1
      )
      setPrivateMessages(sortedMessages)
      // Update conversation unread count
      setPrivateConversations((prev) =>
        prev.map((convo) =>
          convo.id === receiverId ? { ...convo, unread_count: 0 } : convo
        )
      )
      console.log("Fetched private messages for receiver", receiverId, ":", sortedMessages)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to load private messages")
      console.error("Private messages error:", error)
    } finally {
      setLoadingPrivate(false)
    }
  }

  const handleSendPrivate = async () => {
    if (!newPrivateMessage.trim()) {
      toast.error("Message cannot be empty")
      return
    }
    if (!selectedConversation) {
      toast.error("Please select a recipient")
      return
    }
    try {
      const message = await ApiService.sendPrivateMessage({
        receiver: selectedConversation,
        content: newPrivateMessage,
      })
      setPrivateMessages((prev) => [
        ...prev,
        {
          ...message,
          read_at: message.read_at ?? null,
          sender: {
            ...message.sender,
            is_manager: (message.sender as User).is_manager ?? false,
            is_staff: (message.sender as User).is_staff ?? false,
          },
          receiver: {
            ...message.receiver,
            is_manager: (message.receiver as User).is_manager ?? false,
            is_staff: (message.receiver as User).is_staff ?? false,
          },
        } as PrivateMessage
      ].sort((a, b) =>
        new Date(a.created_at) > new Date(b.created_at) ? 1 : -1
      ))
      setNewPrivateMessage("")
      toast.success("Message sent successfully")
      fetchPrivateConversations()
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Failed to send message"
      if (errorMessage.includes("Receiver is required")) {
        toast.error("Please select a valid recipient")
      } else if (errorMessage.includes("cannot send a message to yourself")) {
        toast.error("You cannot send a message to yourself")
      } else if (errorMessage.includes("does not exist")) {
        toast.error("Selected recipient does not exist")
      } else if (errorMessage.includes("muted")) {
        toast.error("You are muted and cannot send messages")
      } else if (errorMessage.includes("blocked")) {
        toast.error("You are blocked and cannot send messages")
      } else {
        toast.error(errorMessage)
      }
      console.error("Send private message error:", error)
    }
  }

  const handleStartConversation = (adminId: number) => {
    setSelectedConversation(adminId)
    fetchPrivateMessages(adminId)
    setShowContactAdmin(false)
  }

  const handleCreateMessage = async (messageData: { content: string; image?: string }) => {
    try {
      const newMessage = await ApiService.createSupportMessage(messageData)
      setMessages((prev) => [...prev, newMessage as SupportMessage].sort((a, b) =>
        new Date(a.created_at) > new Date(b.created_at) ? 1 : -1
      ))
      toast.success("Support message created successfully!")
      setShowCreateForm(false)
      fetchSupportData(1)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create support message")
      console.error("Create message error:", error)
    }
  }

  const handleLikeMessage = async (messageId: number) => {
    try {
      await ApiService.likeSupportMessage(messageId)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                is_liked: true,
                like_count: msg.is_liked ? msg.like_count : msg.like_count + 1,
              }
            : msg
        ).sort((a, b) => new Date(a.created_at) > new Date(b.created_at) ? 1 : -1)
      )
      toast.success("Message liked successfully")
    } catch (error: unknown) {
      if ((error as Error).message.includes("already liked")) {
        toast.info("You have already liked this message")
      } else if ((error as Error).message.includes("muted")) {
        toast.error("You are muted and cannot like messages")
      } else if ((error as Error).message.includes("blocked")) {
        toast.error("You are blocked and cannot like messages")
      } else {
        toast.error((error as Error).message || "Failed to like message")
      }
      console.error("Like message error:", error)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchSupportData(page + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-full md:w-64 md:min-h-screen bg-white shadow-md">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-white/80">Loading support center...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-64 md:min-h-screen bg-white shadow-md">
          <Sidebar />
        </div>
        <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-4">
              <Badge className="bg-blue-200 text-blue-800 text-xs sm:text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Community Support Center
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Get Help from Our Community</h1>
              <p className="text-gray-500 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
                Ask questions, share ideas, and connect with other users in our support community.
              </p>
            </div>

            <div className="relative max-w-xs sm:max-w-md md:max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search support messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  fetchSupportData(1)
                }}
                className="pl-10 border-blue-200 bg-white shadow-sm w-full text-sm sm:text-base"
              />
            </div>

            <SupportFilters
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              onCategoryChange={setSelectedCategory}
              onPriorityChange={setSelectedPriority}
            />

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow-sm text-xs sm:text-sm">
              <TabsTrigger value="all" className="relative">
                Public Chat
                {unreadPublicCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {unreadPublicCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="my-messages" className="relative">
                My Posts
                {unreadMyPostsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {unreadMyPostsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="private" className="relative">
                Private Chats
                {unreadPrivateCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {unreadPrivateCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 sm:space-y-6">
              <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] max-h-[600px] overflow-y-auto p-2 sm:p-4 bg-white rounded-lg shadow border border-blue-200 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No messages yet. Start a conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <SupportMessageCard
                      key={message.id}
                      message={message}
                      onLike={() => handleLikeMessage(message.id)}
                      currentUser={user}
                    />
                  ))
                )}
              </div>
              {hasMore && (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="mt-4 w-full sm:w-auto mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm sm:text-base"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="my-messages" className="space-y-4 sm:space-y-6">
              {messages.length === 0 ? (
                <Card className="border-blue-200 bg-white shadow-sm">
                  <CardContent className="p-4 sm:p-6 md:p-12 text-center">
                    <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-gray-900">No messages found</h3>
                    <p className="text-gray-500 mb-4 text-xs sm:text-sm md:text-base">
                      {searchQuery ? "Try adjusting your search terms" : "Be the first to start a conversation!"}
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-full sm:w-auto text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] max-h-[600px] overflow-y-auto p-2 sm:p-4 bg-white rounded-lg shadow border border-blue-200 flex flex-col">
                  {messages.map((message) => (
                    <SupportMessageCard
                      key={message.id}
                      message={message}
                      onLike={() => handleLikeMessage(message.id)}
                      currentUser={user}
                    />
                  ))}
                </div>
              )}
              {hasMore && (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="mt-4 w-full sm:w-auto mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm sm:text-base"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="private" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/3 space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">Conversations</h3>
                  {privateConversations.length === 0 ? (
                    <p className="text-gray-500 text-xs sm:text-sm">No conversations yet.</p>
                  ) : (
                    privateConversations.map((convo) => (
                      <Button
                        key={convo.id}
                        variant="outline"
                        className="w-full justify-start border-blue-200 text-gray-900 hover:bg-blue-50 relative text-xs sm:text-sm"
                        onClick={() => {
                          setSelectedConversation(convo.id)
                          fetchPrivateMessages(convo.id)
                        }}
                      >
                        {convo.username}
                        {convo.unread_count > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                            {convo.unread_count}
                          </Badge>
                        )}
                      </Button>
                    ))
                  )}
                  <Button
                    onClick={() => setShowContactAdmin(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Contact Admin/Manager
                  </Button>
                </div>
                <div className="w-full lg:w-2/3">
                  {selectedConversation ? (
                    <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] max-h-[600px] flex flex-col bg-white rounded-lg shadow border border-blue-200">
                      <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col">
                        {loadingPrivate ? (
                          <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto" />
                        ) : privateMessages.length === 0 ? (
                          <p className="text-gray-500 text-center text-xs sm:text-sm">No messages in this conversation.</p>
                        ) : (
                          privateMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex mb-4",
                                msg.sender.id === user?.id ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[70%] p-2 sm:p-3 rounded-lg shadow-sm text-xs sm:text-sm",
                                  msg.sender.id === user?.id ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"
                                )}
                              >
                                {msg.sender.id !== user?.id && (
                                  <div className="font-bold mb-1">
                                    {msg.sender.username}
                                    {msg.sender.is_manager && (
                                      <Badge className="ml-2 bg-green-200 text-green-800 text-xs">Manager</Badge>
                                    )}
                                    {msg.sender.is_staff && (
                                      <Badge className="ml-2 bg-blue-200 text-blue-800 text-xs">Admin</Badge>
                                    )}
                                  </div>
                                )}
                                <p>{msg.content}</p>
                                {msg.image && <img src={msg.image} alt="" className="mt-2 rounded max-w-full" />}
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDistanceToNow(new Date(msg.created_at))}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 sm:p-4 border-t border-blue-200 flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newPrivateMessage}
                          onChange={(e) => setNewPrivateMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="border-blue-200 bg-white flex-1 text-sm"
                        />
                        <Button
                          onClick={handleSendPrivate}
                          disabled={!newPrivateMessage.trim() || !selectedConversation}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-full sm:w-auto text-sm"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm">Select a conversation to start chatting.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Card className="bg-white border-blue-200 shadow-sm">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <Star className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-gray-900">Need More Help?</h3>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base">Here are some quick resources to get you started</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Getting Started</h4>
                  <p className="text-xs sm:text-sm text-blue-700">
                    New to the platform? Check out our beginners guide and tutorials.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">Community Support</h4>
                  <p className="text-xs sm:text-sm text-green-700">
                    Engage with our community to get answers and share knowledge.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">Account Security</h4>
                  <p className="text-xs sm:text-sm text-purple-700">Keep your account safe with our security best practices.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showCreateForm && (
        <CreateSupportMessage onSubmit={handleCreateMessage} onClose={() => setShowCreateForm(false)} />
      )}

      <Dialog open={showContactAdmin} onOpenChange={setShowContactAdmin}>
        <DialogContent className="bg-white border-blue-200 max-w-xs sm:max-w-md md:max-w-lg p-4 sm:p-6">
          <h2 className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl">Select Admin/Manager</h2>
          {admins.map((admin) => (
            <Button
              key={admin.id}
              onClick={() => handleStartConversation(admin.id)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white mb-2 text-xs sm:text-sm"
            >
              {admin.username} {admin.is_manager && "(Manager)"} {admin.is_staff && "(Admin)"}
            </Button>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  )
}