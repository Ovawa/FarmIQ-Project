"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AddFieldFormProps {
  userId: string
}

export function AddFieldForm({ userId }: AddFieldFormProps) {
  const [name, setName] = useState("")
  const [sizeHectares, setSizeHectares] = useState("")
  const [location, setLocation] = useState("")
  const [soilType, setSoilType] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("fields").insert({
        user_id: userId,
        name,
        size_hectares: Number.parseFloat(sizeHectares),
        location,
        soil_type: soilType || null,
      })

      if (error) throw error

      router.push("/dashboard/fields")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="text-green-600 hover:text-green-700 p-0">
        <Link href="/dashboard/fields">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fields
        </Link>
      </Button>

      <div className="grid gap-4">
        {/* Field Name */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-green-700">
            Field Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., North Field, Back 40"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Size */}
        <div className="grid gap-2">
          <Label htmlFor="size" className="text-green-700">
            Size (hectares) *
          </Label>
          <Input
            id="size"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g., 10.5"
            required
            value={sizeHectares}
            onChange={(e) => setSizeHectares(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Location */}
        <div className="grid gap-2">
          <Label htmlFor="location" className="text-green-700">
            Location
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g., North Section, GPS coordinates"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Soil Type */}
        <div className="grid gap-2">
          <Label htmlFor="soilType" className="text-green-700">
            Soil Type
          </Label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger className="border-green-200 focus:border-green-400">
              <SelectValue placeholder="Select soil type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Clay">Clay</SelectItem>
              <SelectItem value="Loamy">Loamy</SelectItem>
              <SelectItem value="Sandy">Sandy</SelectItem>
              <SelectItem value="Silty">Silty</SelectItem>
              <SelectItem value="Peaty">Peaty</SelectItem>
              <SelectItem value="Chalky">Chalky</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 border-green-200 text-green-700"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700">
          {isLoading ? "Adding Field..." : "Add Field"}
        </Button>
      </div>
    </form>
  )
}
