"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditCropDialogProps {
  cropId: string
  cropName: string
  cropVariety?: string | null
  cropStatus: string
  plantingDate?: string | null
  expectedHarvestDate?: string | null
  productionCost?: number | null
  children: React.ReactNode
}

export function EditCropDialog({
  cropId,
  cropName,
  cropVariety,
  cropStatus,
  plantingDate,
  expectedHarvestDate,
  productionCost,
  children,
}: EditCropDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: cropName,
    variety: cropVariety || "",
    status: cropStatus,
    planting_date: plantingDate ? plantingDate.split("T")[0] : "",
    expected_harvest_date: expectedHarvestDate ? expectedHarvestDate.split("T")[0] : "",
    production_cost: productionCost?.toString() || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    try {
      const updateData: Record<string, unknown> = {
        name: formData.name,
        variety: formData.variety || null,
        status: formData.status,
        planting_date: formData.planting_date || null,
        expected_harvest_date: formData.expected_harvest_date || null,
      }

      // Handle production_cost - only include if it has a valid value
      if (formData.production_cost && formData.production_cost.trim()) {
        const cost = parseFloat(formData.production_cost)
        if (isNaN(cost)) {
          throw new Error("Production cost must be a valid number")
        }
        if (cost < 0) {
          throw new Error("Production cost cannot be negative")
        }
        updateData.production_cost = cost
      } else {
        // Explicitly set to null if empty
        updateData.production_cost = null
      }

      // Log the payload for debugging (will appear in browser console)
      // This helps capture the exact shape/types sent to PostgREST.
      // Remove or reduce logging once the issue is resolved.
      // eslint-disable-next-line no-console
      console.debug("EditCropDialog - updateData:", cropId, updateData)

      const { error: updateError } = await supabase
        .from("crops")
        .update(updateData)
        .eq("id", cropId)

      if (updateError) throw updateError

      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      // Better error serialization for PostgREST/PostgRESTError objects
      // eslint-disable-next-line no-console
      console.error("EditCropDialog error:", err)

      // Special-case common network/CORS failure which manifests as a TypeError in the browser
      if (err instanceof Error && err.message.includes("Failed to fetch")) {
        setError(
          "Network request failed: Could not reach Supabase (Failed to fetch). This is commonly caused by CORS or a misconfigured NEXT_PUBLIC_SUPABASE_URL.\n" +
            "Check browser DevTools Network tab for the failing request, ensure the Supabase URL is correct in .env.local, and that the project's allowed origins include your app origin."
        )
        setIsSaving(false)
        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else if (err && typeof err === "object") {
        try {
          // Include non-enumerable properties as well
          setError(JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
        } catch (e) {
          setError("An error occurred (see console for details)")
        }
      } else {
        setError(String(err))
      }

      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Crop</DialogTitle>
          <DialogDescription>Update crop details and production cost</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-green-800">
              Crop Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border-green-200 focus:border-green-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="variety" className="text-green-800">
              Variety (Optional)
            </Label>
            <Input
              id="variety"
              name="variety"
              value={formData.variety}
              onChange={handleInputChange}
              placeholder="e.g., Hass, Granny Smith"
              className="border-green-200 focus:border-green-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-green-800">
              Status
            </Label>
            <Select value={formData.status} onValueChange={handleStatusChange} disabled={isSaving}>
              <SelectTrigger className="border-green-200 focus:border-green-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planted">Planted</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="harvested">Harvested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="planting_date" className="text-green-800">
              Planting Date (Optional)
            </Label>
            <Input
              id="planting_date"
              name="planting_date"
              type="date"
              value={formData.planting_date}
              onChange={handleInputChange}
              className="border-green-200 focus:border-green-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="expected_harvest_date" className="text-green-800">
              Expected Harvest Date (Optional)
            </Label>
            <Input
              id="expected_harvest_date"
              name="expected_harvest_date"
              type="date"
              value={formData.expected_harvest_date}
              onChange={handleInputChange}
              className="border-green-200 focus:border-green-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="production_cost" className="text-green-800">
              Production Cost (N$) (Optional)
            </Label>
            <Input
              id="production_cost"
              name="production_cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.production_cost}
              onChange={handleInputChange}
              className="border-green-200 focus:border-green-500"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
            className="border-green-200 text-green-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
