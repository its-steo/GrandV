"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { SupportMessageCard } from "@/components/support/support-message-card"
import { CreateSupportMessage } from "@/components/support/create-support-message"
import { SupportFilters } from "@/components/support/support-filter"
import { ApiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Loader2, MessageCircle, Search, Plus, Star, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SupportMessage {
  id: number
  content: string
  user: {
    id: number
    username: string
    email: string
    phone_number: string
    referral_code: string
  }
  created_at: string
  image: string | null
  is_private: boolean
  is_pinned: boolean
  is_liked: boolean
  like_count: number
}

export default function SupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchSupportData(1)
  }, [selectedCategory, selectedPriority, activeTab])

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
      setMessages((prev) => (pageNum === 1 ? messagesData.results || [] : [...prev, ...(messagesData.results || [])]))
      setHasMore(!!messagesData.next)
      setPage(pageNum)
    } catch (error) {
      toast.error("Failed to load support data")
      console.error("Support data error:", error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleCreateMessage = async (messageData: {
    content: string
    image?: string
  }) => {
    try {
      await ApiService.createSupportMessage(messageData)
      toast.success("Support message created successfully!")
      setShowCreateForm(false)
      fetchSupportData(1)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create support message")
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
            : msg,
        ),
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
        toast.error("Failed to like message")
      }
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchSupportData(page + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading support center...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="md:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 py-8">
            <div className="space-y-4">
              <Badge className="professional-badge">
                <Shield className="h-4 w-4 mr-2" />
                Community Support Center
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Get Help from Our Community</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Ask questions, share ideas, and connect with other users in our support community.
              </p>
            </div>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search support messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  fetchSupportData(1)
                }}
                className="pl-10 glass border-white/20"
              />
            </div>

            <SupportFilters
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              onCategoryChange={setSelectedCategory}
              onPriorityChange={setSelectedPriority}
            />

            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="all">All Messages</TabsTrigger>
              <TabsTrigger value="my-messages">My Messages</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {messages.length === 0 ? (
                <Card className="professional-card">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search terms" : "Be the first to start a conversation!"}
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {messages.map((message) => (
                    <SupportMessageCard
                      key={message.id}
                      message={message}
                      onLike={() => handleLikeMessage(message.id)}
                      currentUser={user}
                    />
                  ))}
                  {hasMore && (
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="mt-4 mx-auto bg-gradient-to-r from-primary to-secondary"
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
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Help Section */}
          <Card className="professional-card">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
                <p className="text-muted-foreground">Here are some quick resources to get you started</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-blue-800 mb-2">Getting Started</h4>
                  <p className="text-sm text-blue-700">
                    New to the platform? Check out our beginners guide and tutorials.
                  </p>
                </div>

                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 mb-2">Community Support</h4>
                  <p className="text-sm text-green-700">
                    Engage with our community to get answers and share knowledge.
                  </p>
                </div>

                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-purple-800 mb-2">Account Security</h4>
                  <p className="text-sm text-purple-700">Keep your account safe with our security best practices.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showCreateForm && (
        <CreateSupportMessage onSubmit={handleCreateMessage} onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  )
}
