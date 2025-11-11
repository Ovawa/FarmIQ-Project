"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Check } from "lucide-react"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  farm_name: string | null
  phone: string | null
}

interface User {
  id: string
  email?: string
}

interface ProfileSettingsFormProps {
  user: User
  profile: Profile | null
}

export function ProfileSettingsForm({ user, profile }: ProfileSettingsFormProps) {
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [farmName, setFarmName] = useState(profile?.farm_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: firstName || null,
          last_name: lastName || null,
          farm_name: farmName || null,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {/* Email (read-only) */}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-green-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={user.email || ""}
            disabled
            className="bg-green-50 border-green-200 text-green-600"
          />
          <p className="text-xs text-green-500">Email cannot be changed from this page</p>
        </div>

        {/* First Name */}
        <div className="grid gap-2">
          <Label htmlFor="firstName" className="text-green-700">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Last Name */}
        <div className="grid gap-2">
          <Label htmlFor="lastName" className="text-green-700">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Farm Name */}
        <div className="grid gap-2">
          <Label htmlFor="farmName" className="text-green-700">
            Farm Name
          </Label>
          <Input
            id="farmName"
            type="text"
            placeholder="Green Valley Farm"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="phone" className="text-green-700">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-600 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Profile updated successfully!
          </p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
        {isLoading ? (
          "Saving..."
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
