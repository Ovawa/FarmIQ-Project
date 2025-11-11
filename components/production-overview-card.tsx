"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface ProductionData {
  name: string
  value: number
  percentage: number
}

interface ProductionOverviewCardProps {
  yieldRecords?: Array<{
    crop_id: string
    yield_amount: number
    yield_unit: string
    crops: { name: string } | null
  }>
  randomColors?: boolean
}

const DASHBOARD_COLORS: Record<string, string> = {
  Banana: "#10b981", // green
  Bean: "#fbbf24", // yellow/gold
  Barley: "#fb923c", // orange
  Tomato: "#f87171", // red/orange
}

const RANDOM_COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#a855f7", "#3b82f6"]

export function ProductionOverviewCard({ yieldRecords, randomColors = false }: ProductionOverviewCardProps) {
  if (!yieldRecords || yieldRecords.length === 0) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-base font-medium text-gray-800">Production Overview</CardTitle>
          <p className="text-sm text-gray-600">Distribution of your farm production</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 text-center">No production data available</p>
          <p className="text-sm text-gray-400 mt-1">Add yield records to see your production distribution</p>
        </CardContent>
      </Card>
    )
  }

  const cropProduction = yieldRecords.reduce(
    (acc, record) => {
      const cropName = record.crops?.name || "Unknown"
      if (!acc[cropName]) {
        acc[cropName] = 0
      }
      acc[cropName] += Number(record.yield_amount) || 0
      return acc
    },
    {} as Record<string, number>,
  )

  const totalProduction = Object.values(cropProduction).reduce((sum, val) => sum + val, 0)

  const productionData: ProductionData[] = Object.entries(cropProduction).map(([name, value]) => ({
    name,
    value,
    percentage: totalProduction > 0 ? Math.round((value / totalProduction) * 100 * 10) / 10 : 0,
  }))

  const getColor = (cropName: string, index: number) => {
    if (randomColors) {
      return RANDOM_COLORS[index % RANDOM_COLORS.length]
    }
    return DASHBOARD_COLORS[cropName] || RANDOM_COLORS[index % RANDOM_COLORS.length]
  }

  const cropTypes = productionData.length

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-800">Production Overview</CardTitle>
        <p className="text-sm text-gray-600">Distribution of your farm production</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={productionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with percentages */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-sm">
            {productionData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(item.name, index) }} />
                <span className="text-gray-700">
                  {item.name} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>

          {/* Total Production Stats */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-700">{totalProduction.toFixed(1)}</div>
              <p className="text-xs text-gray-600">Total Production (tons)</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{cropTypes}</div>
              <p className="text-xs text-gray-600">Crop Types</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
