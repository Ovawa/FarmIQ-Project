"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Calendar } from "lucide-react"

interface YieldRecord {
  id: string
  harvest_date: string
  yield_amount: number
  yield_unit: string
  fields: {
    name: string
    size_hectares: number
  } | null
  crops: {
    name: string
    variety: string | null
  } | null
}

interface Prediction {
  id: string
  predicted_yield: number
  yield_unit: string
  prediction_date: string
  confidence_score: number | null
  fields: {
    name: string
  } | null
  crops: {
    name: string
  } | null
}

interface YieldAnalyticsChartsProps {
  yieldRecords: YieldRecord[]
  predictions: Prediction[]
}

export function YieldAnalyticsCharts({ yieldRecords, predictions }: YieldAnalyticsChartsProps) {
  // Prepare data for yield over time chart
  const yieldOverTime = yieldRecords
    .map((record) => ({
      date: new Date(record.harvest_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      yieldAmount: record.yield_amount,
      yieldPerAcre: record.fields?.size_hectares ? record.yield_amount / record.fields.size_hectares : 0,
      crop: record.crops?.name || "Unknown",
      field: record.fields?.name || "Unknown",
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12) // Last 12 records

  // Prepare data for crop comparison chart
  const cropComparison = yieldRecords.reduce(
    (acc, record) => {
      const cropName = record.crops?.name || "Unknown"
      if (!acc[cropName]) {
        acc[cropName] = { totalYield: 0, totalAcres: 0, count: 0 }
      }
      acc[cropName].totalYield += record.yield_amount
      acc[cropName].totalAcres += record.fields?.size_hectares || 0
      acc[cropName].count += 1
      return acc
    },
    {} as Record<string, { totalYield: number; totalAcres: number; count: number }>,
  )

  const cropComparisonData = Object.entries(cropComparison)
    .map(([crop, data]) => ({
      crop,
      avgYield: data.totalAcres > 0 ? data.totalYield / data.totalAcres : 0,
      totalYield: data.totalYield,
      harvests: data.count,
    }))
    .sort((a, b) => b.avgYield - a.avgYield)

  // Prepare monthly yield trend
  const monthlyYield = yieldRecords.reduce(
    (acc, record) => {
      const date = new Date(record.harvest_date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!acc[monthYear]) {
        acc[monthYear] = 0
      }
      acc[monthYear] += record.yield_amount
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyTrendData = Object.entries(monthlyYield)
    .map(([month, yieldValue]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      yield: yieldValue,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-12)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Yield Over Time */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Harvests
          </CardTitle>
          <CardDescription className="text-green-600">Yield amounts from your latest harvests</CardDescription>
        </CardHeader>
        <CardContent>
          {yieldOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yieldOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#16a34a" fontSize={12} />
                <YAxis stroke="#16a34a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => [
                    `${value} ${yieldRecords[0]?.yield_unit || "units"}`,
                    name === "yieldAmount" ? "Yield" : "Yield/Acre",
                  ]}
                />
                <Bar dataKey="yieldAmount" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-green-600">No harvest data available</div>
          )}
        </CardContent>
      </Card>

      {/* Crop Performance Comparison */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Crop Performance</CardTitle>
          <CardDescription className="text-green-600">Average yield per acre by crop type</CardDescription>
        </CardHeader>
        <CardContent>
          {cropComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropComparisonData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#16a34a" fontSize={12} />
                <YAxis dataKey="crop" type="category" stroke="#16a34a" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)} per acre`, "Avg Yield"]}
                />
                <Bar dataKey="avgYield" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-green-600">No crop data available</div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Yield Trend */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Yield Trend
          </CardTitle>
          <CardDescription className="text-green-600">Total yield harvested by month</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#16a34a" fontSize={12} />
                <YAxis stroke="#16a34a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} ${yieldRecords[0]?.yield_unit || "units"}`, "Total Yield"]}
                />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-green-600">No monthly data available</div>
          )}
        </CardContent>
      </Card>

      {/* Predictions vs Actuals */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Prediction Accuracy</CardTitle>
          <CardDescription className="text-green-600">Compare AI predictions with actual yields</CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.slice(0, 5).map((prediction) => {
                const matchingYield = yieldRecords.find(
                  (record) =>
                    record.crops?.name === prediction.crops?.name && record.fields?.name === prediction.fields?.name,
                )

                const accuracy = matchingYield
                  ? Math.abs(
                      1 -
                        Math.abs(matchingYield.yield_amount - prediction.predicted_yield) / matchingYield.yield_amount,
                    ) * 100
                  : null

                return (
                  <div key={prediction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">
                        {prediction.crops?.name} - {prediction.fields?.name}
                      </p>
                      <p className="text-sm text-green-600">
                        Predicted: {prediction.predicted_yield} {prediction.yield_unit}
                      </p>
                      {matchingYield && (
                        <p className="text-sm text-green-600">
                          Actual: {matchingYield.yield_amount} {matchingYield.yield_unit}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          accuracy && accuracy >= 80 ? "default" : accuracy && accuracy >= 60 ? "secondary" : "outline"
                        }
                        className={
                          accuracy && accuracy >= 80
                            ? "bg-green-100 text-green-700"
                            : accuracy && accuracy >= 60
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {accuracy ? `${accuracy.toFixed(0)}% accurate` : "No data"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-green-600">No predictions available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
