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
import { Calendar } from "lucide-react"

interface HarvestCropDialogProps {
  cropId: string
  fieldId: string
  cropName: string
  children?: React.ReactNode
}

export function HarvestCropDialog({ cropId, fieldId, cropName, children }: HarvestCropDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [harvestDate, setHarvestDate] = useState<string>(() => new Date().toISOString().split("T")[0])
  const [yieldAmount, setYieldAmount] = useState<string>("")
  const [yieldUnit, setYieldUnit] = useState<string>("kg")
  const router = useRouter()

  const handleSubmit = async () => {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    try {
      // get user id
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const yieldVal = parseFloat(yieldAmount)
      if (isNaN(yieldVal) || yieldVal <= 0) throw new Error("Yield amount must be a positive number")

      // Insert yield_records
      const { error: insertError } = await supabase.from("yield_records").insert({
        user_id: user.id,
        field_id: fieldId,
        crop_id: cropId,
        harvest_date: harvestDate,
        yield_amount: yieldVal,
        yield_unit: yieldUnit,
      })

      if (insertError) throw insertError

      // Update crop status to harvested
      const { error: updateError } = await supabase
        .from("crops")
        .update({ status: "harvested" })
        .eq("id", cropId)
        
      if (updateError) throw updateError

      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <div className="flex items-center gap-2 text-green-600 cursor-pointer">
            <Calendar className="h-4 w-4" />
            <span>Harvest</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Harvest</DialogTitle>
          <DialogDescription>Record harvested yield for "{cropName}"</DialogDescription>
        </DialogHeader>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3"><p className="text-sm text-red-600">{error}</p></div>}

        <div className="space-y-4">
          <div>
            <Label htmlFor="harvestDate">Harvest Date</Label>
            <Input id="harvestDate" type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="yieldAmount">Yield Amount</Label>
            <Input id="yieldAmount" type="number" step="0.01" min="0" value={yieldAmount} onChange={(e) => setYieldAmount(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="yieldUnit">Unit</Label>
            <Select value={yieldUnit} onValueChange={setYieldUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="tons">tons</SelectItem>
                <SelectItem value="pounds">pounds</SelectItem>
                <SelectItem value="bushels">bushels</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving} className="border-green-200 text-green-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? "Saving..." : "Record Harvest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
