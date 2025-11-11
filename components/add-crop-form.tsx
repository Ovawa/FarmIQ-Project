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

interface AddCropFormProps {
  userId: string
  fieldId: string
  fieldName: string
}

export function AddCropForm({ userId, fieldId, fieldName }: AddCropFormProps) {
  const [name, setName] = useState("")
  const [variety, setVariety] = useState("")
  const [plantingDate, setPlantingDate] = useState("")
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("")
  const [status, setStatus] = useState("planted")
  const [productionCost, setProductionCost] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("crops").insert({
        user_id: userId,
        field_id: fieldId,
        name,
        variety: variety || null,
        planting_date: plantingDate || null,
        expected_harvest_date: expectedHarvestDate || null,
        status,
        production_cost: productionCost ? Number.parseFloat(productionCost) : null,
      })

      if (error) throw error

      router.push(`/dashboard/fields/field/${fieldId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const trainedCrops = [
    "Pearl Millet",
    "Banana",
    "Barley",
    "Bean",
    "Blackgram",
    "Egg Plant",
    "Castor seed",
    "Chillies",
    "Coriander",
    "Cotton",
    "Cowpea",
    "Drum Stick",
    "Garlic",
    "Gram",
    "Grapes",
    "Groundnut",
    "Guar seed",
    "Horse-gram",
    "Sorghum",
    "Golden Fiber",
    "Grass Pea",
    "Lady Finger",
    "Lentil",
    "Linseed",
    "Maize",
    "Fiber",
    "Green Gram",
    "Moth",
    "Onion",
    "Orange",
    "Peas & beans (Pulses)",
    "Potato",
    "Raddish",
    "Finger Millet",
    "Rice",
    "Safflower",
    "Sannhamp",
    "Sesamum",
    "Soyabean",
    "Sugarcane",
    "Sunflower",
    "Sweet potato",
    "Tapioca",
    "Tomato",
    "Black Gram",
    "Wheat",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="text-green-600 hover:text-green-700 p-0">
        <Link href={`/dashboard/fields/field/${fieldId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {fieldName}
        </Link>
      </Button>

      <div className="grid gap-4">
        {/* Crop Name */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-green-700">
            Crop Name *
          </Label>
          <Select value={name} onValueChange={setName} required>
            <SelectTrigger className="border-green-200 focus:border-green-400">
              <SelectValue placeholder="Select crop type" />
            </SelectTrigger>
            <SelectContent>
              {trainedCrops.map((crop) => (
                <SelectItem key={crop} value={crop}>
                  {crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Variety */}
        <div className="grid gap-2">
          <Label htmlFor="variety" className="text-green-700">
            Variety
          </Label>
          <Input
            id="variety"
            type="text"
            placeholder="e.g., Pioneer P1234"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="productionCost" className="text-green-700">
            Production Cost (N$)
          </Label>
          <Input
            id="productionCost"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 1500.00"
            value={productionCost}
            onChange={(e) => setProductionCost(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-green-600">Optional: Enter total production cost in Namibian Dollars (N$)</p>
        </div>

        {/* Planting Date */}
        <div className="grid gap-2">
          <Label htmlFor="plantingDate" className="text-green-700">
            Planting Date
          </Label>
          <Input
            id="plantingDate"
            type="date"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Expected Harvest Date */}
        <div className="grid gap-2">
          <Label htmlFor="expectedHarvestDate" className="text-green-700">
            Expected Harvest Date
          </Label>
          <Input
            id="expectedHarvestDate"
            type="date"
            value={expectedHarvestDate}
            onChange={(e) => setExpectedHarvestDate(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="status" className="text-green-700">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border-green-200 focus:border-green-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planted">Planted</SelectItem>
              <SelectItem value="growing">Growing</SelectItem>
              <SelectItem value="harvested">Harvested</SelectItem>
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
          {isLoading ? "Adding Crop..." : "Add Crop"}
        </Button>
      </div>
    </form>
  )
}
