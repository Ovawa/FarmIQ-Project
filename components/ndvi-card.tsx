"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, Leaf } from "lucide-react"
import { getNDVIForRegion, getNDVIStatus } from "@/lib/constants/regions"

interface NDVICardProps {
  region: string
}

export function NDVICard({ region }: NDVICardProps) {
  const ndviValue = getNDVIForRegion(region)
  const { status, color, description } = getNDVIStatus(ndviValue)

  // Calculate position for the indicator on the scale (0-100%)
  const indicatorPosition = (ndviValue / 1.0) * 100

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Sprout className="h-5 w-5 text-green-600" />
            <Leaf className="h-5 w-5 text-green-500" />
          </div>
          NDVI Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NDVI Value */}
        <div className="text-center">
          <div className="text-5xl font-bold text-green-700">{ndviValue.toFixed(4)}</div>
          <p className="text-sm text-gray-600 mt-1">NDVI Index</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className={`${status === "Healthy" ? "bg-green-100 text-green-700" : status === "Moderate Stress" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"} px-4 py-1`}
          >
            {status}
          </Badge>
        </div>

        {/* Region */}
        <div className="text-center">
          <p className="text-lg font-semibold text-green-800">{region}</p>
          <p className="text-sm text-green-600">Region Analysis</p>
        </div>

        {/* NDVI Scale */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Poor (0.0-0.4)</span>
            <span>Stressed (0.4-0.6)</span>
            <span>Healthy (0.6-1.0)</span>
          </div>
          <div className="relative h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg"
              style={{ left: `calc(${indicatorPosition}% - 8px)` }}
            />
          </div>
        </div>

        {/* Update Info */}
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 pt-2 border-t border-gray-200">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Updated {new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
        </div>
      </CardContent>
    </Card>
  )
}
