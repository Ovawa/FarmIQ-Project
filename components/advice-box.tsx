"use client"

import { AlertCircle } from "lucide-react"

interface AdviceBoxProps {
  yieldCategory: "High" | "Moderate" | "Low"
  ndvi?: number | null
  rainfall?: number | null
  soilPH?: number | null
}

export function AdviceBox({ yieldCategory, ndvi, rainfall, soilPH }: AdviceBoxProps) {
  // Primary advice messages based on yield category
  const getPrimaryAdvice = (): string => {
    switch (yieldCategory) {
      case "High":
        return "Your predicted yield is above regional average. Current conditions show strong crop performance. Maintain current management practices."
      case "Moderate":
        return "Your predicted yield is within a normal range. Crop growth is fair — consider optimizing irrigation or applying light nutrients to improve performance."
      case "Low":
        return "Your predicted yield is below expected levels. This may be linked to low vegetation health or limited rainfall. Inspect for water stress, nutrient deficiency, or pests."
      default:
        return ""
    }
  }

  // Secondary advice based on NDVI levels
  const getSecondaryAdviceNDVI = (): string | null => {
    if (ndvi === null || ndvi === undefined) return null

    if (yieldCategory === "High" && ndvi > 0.7) {
      return "Vegetation cover is excellent — continue monitoring for pests and late-season diseases."
    }
    if (yieldCategory === "Moderate" && ndvi >= 0.5 && ndvi <= 0.65) {
      return "NDVI is stable. Minor adjustments to irrigation or fertilizer could increase yield."
    }
    if (yieldCategory === "Low" && ndvi < 0.45) {
      return "Low NDVI suggests weak vegetation cover. Consider increasing watering frequency or reapplying fertilizer."
    }
    return null
  }

  // Rainfall-based advice
  const getRainfallAdvice = (): string | null => {
    if (rainfall === null || rainfall === undefined) return null

    if (rainfall < 25) {
      return "Recent rainfall has been low — supplemental irrigation may be needed to maintain soil moisture."
    }
    if (rainfall > 70) {
      return "High rainfall could cause nutrient loss. Check for root diseases and reapply fertilizer if necessary."
    }
    return null
  }

  const primaryAdvice = getPrimaryAdvice()
  const secondaryNDVIAdvice = getSecondaryAdviceNDVI()
  const rainfallAdvice = getRainfallAdvice()

  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      {/* Recommendations Section */}
      <div className="mb-4">
        <h4 className="font-semibold text-green-800 mb-2">Recommendations</h4>
        <p className="text-sm text-green-700 mb-2">{primaryAdvice}</p>

        {/* Secondary advice - NDVI */}
        {secondaryNDVIAdvice && (
          <p className="text-sm text-green-700 mb-2 italic">{secondaryNDVIAdvice}</p>
        )}

        {/* Secondary advice - Rainfall */}
        {rainfallAdvice && (
          <p className="text-sm text-green-700 mb-2 italic">{rainfallAdvice}</p>
        )}
      </div>

      {/* Data Summary */}
      {(ndvi !== null || rainfall !== null || soilPH !== null) && (
        <div className="mb-4 p-3 bg-white rounded border border-green-100">
          <h5 className="font-medium text-green-800 text-sm mb-2">Data Summary</h5>
          <div className="text-xs text-green-600 space-y-1">
            <div className="flex gap-4 flex-wrap">
              {ndvi !== null && ndvi !== undefined && (
                <span>NDVI: {ndvi.toFixed(2)}</span>
              )}
              {rainfall !== null && rainfall !== undefined && (
                <span>Rainfall: {rainfall} mm</span>
              )}
              {soilPH !== null && soilPH !== undefined && (
                <span>Soil pH: {soilPH.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex gap-2 text-xs text-gray-500">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> FarmIQ provides AI-generated insights to guide farm management decisions.
          It does not replace the experience or judgment of a farmer or agronomist.
        </p>
      </div>
    </div>
  )
}
