"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Save, X, Crown, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function UserInfoCard() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  })

  const handleSave = async () => {
    try {
      // API call to update user info would go here
      toast.success("Your profile information has been updated successfully")
      setIsEditing(false)
    } catch {
      toast.error("Failed to update profile information")
    }
  }

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    })
    setIsEditing(false)
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Profile Information
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-transparent border-white/20 hover:bg-blue-500/10"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="bg-transparent border-white/20 hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Type Badge */}
        <div className="flex items-center gap-2">
          <Badge
            className={`${user?.is_marketer ? "bg-gradient-to-r from-purple-500 to-purple-600" : "bg-gradient-to-r from-blue-500 to-blue-600"} text-white`}
          >
            {user?.is_marketer ? (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Marketer
              </>
            ) : (
              <>
                <Users className="h-3 w-3 mr-1" />
                Member
              </>
            )}
          </Badge>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            {isEditing ? (
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="glass border-white/20"
              />
            ) : (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">{user?.username}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass border-white/20"
              />
            ) : (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">{user?.email}</div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="glass border-white/20"
                placeholder="Enter phone number"
              />
            ) : (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                {user?.phone_number || "Not provided"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
