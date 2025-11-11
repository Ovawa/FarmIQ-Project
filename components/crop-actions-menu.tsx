"use client"

import { EditCropDialog } from "@/components/edit-crop-dialog"
import { DeleteCropDialog } from "@/components/delete-crop-dialog"
import { HarvestCropDialog } from "@/components/harvest-crop-dialog"
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Edit2, Trash2, Calendar } from "lucide-react"

interface CropActionsMenuProps {
  cropId: string
  fieldId: string
  cropName: string
  cropVariety?: string | null
  cropStatus: string
  plantingDate?: string | null
  expectedHarvestDate?: string | null
  productionCost?: number | null
}

export function CropActionsMenu({
  cropId,
  fieldId,
  cropName,
  cropVariety,
  cropStatus,
  plantingDate,
  expectedHarvestDate,
  productionCost,
}: CropActionsMenuProps) {
  return (
    <DropdownMenuContent align="end">
      <HarvestCropDialog cropId={cropId} fieldId={fieldId} cropName={cropName}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Calendar className="h-4 w-4 mr-2 text-green-600" />
          <span className="text-green-600">Harvest</span>
        </DropdownMenuItem>
      </HarvestCropDialog>
      <EditCropDialog
        cropId={cropId}
        cropName={cropName}
        cropVariety={cropVariety}
        cropStatus={cropStatus}
        plantingDate={plantingDate}
        expectedHarvestDate={expectedHarvestDate}
        productionCost={productionCost}
      >
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit2 className="h-4 w-4 mr-2 text-blue-600" />
          <span className="text-blue-600">Edit Crop</span>
        </DropdownMenuItem>
      </EditCropDialog>
      <DeleteCropDialog cropId={cropId} cropName={cropName}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Trash2 className="h-4 w-4 mr-2 text-red-600" />
          <span className="text-red-600">Delete Crop</span>
        </DropdownMenuItem>
      </DeleteCropDialog>
    </DropdownMenuContent>
  )
}
