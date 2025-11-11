"use client"

import { DeleteFieldDialog } from "@/components/delete-field-dialog"
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Trash2 } from "lucide-react"

interface FieldActionsMenuProps {
  fieldId: string
  fieldName: string
}

export function FieldActionsMenu({ fieldId, fieldName }: FieldActionsMenuProps) {
  return (
    <DropdownMenuContent align="end">
      <DeleteFieldDialog fieldId={fieldId} fieldName={fieldName}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Trash2 className="h-4 w-4 mr-2 text-red-600" />
          <span className="text-red-600">Delete Field</span>
        </DropdownMenuItem>
      </DeleteFieldDialog>
    </DropdownMenuContent>
  )
}
