import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, Target, TrendingUp, DollarSign } from "lucide-react"
import { AnalyticsContent } from "./AnalyticsContent"
import { AnalyticsCharts } from "./AnalyticsCharts"
import ExportDataButton from "./ExportDataButton"

interface CropPerformanceData {
  totalYield: number;
  count: number;
  totalAcres: number;
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Fetch user's yield records
  const { data: yieldRecords } = await supabase
    .from("yield_records")
    .select(`
      *,
      fields(name, size_hectares),
      crops(name, variety, production_cost)
    `)
    .eq("user_id", user.id)
    .order("harvest_date", { ascending: false })

  // Calculate analytics
  const totalYield = yieldRecords?.reduce((sum, record) => sum + Number(record.yield_amount || 0), 0) || 0
  const totalAcres = yieldRecords?.reduce((sum, record) => sum + Number(record.fields?.size_hectares || 0), 0) || 0
  const averageYieldPerAcre = totalAcres > 0 ? totalYield / totalAcres : 0

  const currentYear = new Date().getFullYear()
  const thisYearRecords = yieldRecords?.filter(
    (record) => new Date(record.harvest_date).getFullYear() === currentYear
  )
  const lastYearRecords = yieldRecords?.filter(
    (record) => new Date(record.harvest_date).getFullYear() === currentYear - 1
  )

  const thisYearYield = thisYearRecords?.reduce((sum, record) => sum + Number(record.yield_amount || 0), 0) || 0
  const lastYearYield = lastYearRecords?.reduce((sum, record) => sum + Number(record.yield_amount || 0), 0) || 0
  
  // Calculate year over year change
  const yearOverYearChange = lastYearYield > 0 
    ? ((thisYearYield - lastYearYield) / lastYearYield) * 100 
    : 0

  // Market prices per kg
  const marketPrices: Record<string, number> = {
    "Pearl Millet": 8.5, "Banana": 16.0, "Barley": 7.2, "Bean": 18.5, "Blackgram": 19.0,
    "Egg Plant": 14.0, "Castor seed": 12.5, "Chillies": 45.0, "Coriander": 38.0, "Cotton": 11.0,
    "Cowpea": 15.5, "Drum Stick": 22.0, "Garlic": 40.0, "Gram": 16.5, "Grapes": 30.0,
    "Groundnut": 25.0, "Guar seed": 14.0, "Horse-gram": 13.5, "Sorghum": 9.5, "Golden Fiber": 10.0,
    "Grass Pea": 12.0, "Lady Finger": 17.0, "Lentil": 22.5, "Linseed": 18.0, "Maize": 7.8,
    "Fiber": 10.0, "Green Gram": 19.5, "Moth": 15.0, "Onion": 12.0, "Orange": 10.5,
    "Peas & beans (Pulses)": 20.0, "Potato": 9.0, "Raddish": 11.0, "Finger Millet": 8.2,
    "Rice": 14.5, "Safflower": 16.0, "Sannhamp": 9.8, "Sesamum": 23.0, "Soyabean": 18.5,
    "Sugarcane": 5.5, "Sunflower": 14.0, "Sweet potato": 10.5, "Tapioca": 8.0,
    "Tomato": 13.0, "Black Gram": 19.0, "Wheat": 8.7
  };

  // Revenue and cost calculations
  const revenueByMonth: Record<string, { revenue: number; cost: number; profit: number }> = {}
  let totalRevenue = 0
  let totalCost = 0
  let totalProfit = 0

  // Debug: Log the first record to check data
  console.log('First yield record:', JSON.stringify(yieldRecords?.[0], null, 2));

  // Process yield records to calculate revenue and profit
  yieldRecords?.forEach((record) => {
    const month = new Date(record.harvest_date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const cropName = record.crops?.name || '';
    const marketPrice = marketPrices[cropName] || 0;
    const totalProductionCost = Number(record.crops?.production_cost) || 0;
    const yieldAmount = Number(record.yield_amount) || 0;
    
    // Debug log for each record
    console.log('Processing record:', {
      cropName,
      marketPrice,
      totalProductionCost,
      yieldAmount,
      recordCrop: record.crops
    });
    
    // Revenue = market price * yield of the crop
    const revenue = marketPrice * yieldAmount;
    
    // Profit = market price * yield of the crop - production cost
    // Note: totalProductionCost is the total production cost for the crop (not per kg)
    const profit = revenue - totalProductionCost;

    if (!revenueByMonth[month]) {
      revenueByMonth[month] = { revenue: 0, cost: 0, profit: 0 };
    }

    // Update monthly totals
    revenueByMonth[month].revenue += revenue;
    revenueByMonth[month].cost += totalProductionCost;
    revenueByMonth[month].profit += profit;

    totalRevenue += revenue;
    totalCost += totalProductionCost;
    totalProfit += profit;
  })

  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const revenueChartData = Object.entries(revenueByMonth)
    .map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      cost: Math.round(data.cost),
      profit: Math.round(data.profit),
    }))
    .slice(-6)

  // Calculate revenue/cost/profit by crop type
  const revenueByCrop: Record<string, { revenue: number; cost: number; profit: number }> = {}
  
  yieldRecords?.forEach((record) => {
    const cropName = record.crops?.name || 'Unknown'
    const marketPrice = marketPrices[cropName] || 0
    const totalProductionCost = Number(record.crops?.production_cost) || 0
    const yieldAmount = Number(record.yield_amount) || 0
    
    const revenue = marketPrice * yieldAmount
    const profit = revenue - totalProductionCost
    
    if (!revenueByCrop[cropName]) {
      revenueByCrop[cropName] = { revenue: 0, cost: 0, profit: 0 }
    }
    
    revenueByCrop[cropName].revenue += revenue
    revenueByCrop[cropName].cost += totalProductionCost
    revenueByCrop[cropName].profit += profit
  })

  // Prepare export-friendly datasets
  const exportYieldRecords = (yieldRecords || []).map((r: any) => ({
    id: r.id,
    harvest_date: r.harvest_date,
    yield_amount: Number(r.yield_amount || 0),
    field: r.fields?.name || null,
    crop: r.crops?.name || null,
  }))
  const cropPerformance = yieldRecords?.reduce(
    (acc, record) => {
      const cropName = record.crops?.name || "Unknown"
      if (!acc[cropName]) {
        acc[cropName] = { totalYield: 0, count: 0, totalAcres: 0 }
      }
      acc[cropName].totalYield += Number(record.yield_amount || 0)
      acc[cropName].count += 1
      acc[cropName].totalAcres += record.fields?.size_hectares || 0
      return acc
    },
    {} as Record<string, { totalYield: number; count: number; totalAcres: number }>
  ) || {}

  // Define the shape of crop performance data
  interface CropPerformance {
    totalYield: number;
    count: number;
    totalAcres: number;
  }

  // Transform crop performance data for the AnalyticsContent component
  const cropPerformanceArray = Object.entries<CropPerformance>(cropPerformance as Record<string, CropPerformance>)
    .map(([crop, data]) => ({
      crop,
      avgYield: data.totalYield / (data.count || 1), // Calculate average yield per harvest
      totalYield: data.totalYield,
      count: data.count,
      totalAcres: data.totalAcres,
      // Add revenue/cost/profit metrics for this crop
      revenue: Math.round(revenueByCrop[crop]?.revenue || 0),
      cost: Math.round(revenueByCrop[crop]?.cost || 0),
      profit: Math.round(revenueByCrop[crop]?.profit || 0),
    }))

  interface CropPerformanceData {
    totalYield: number;
    count: number;
    totalAcres: number;
  }

  // Create export-friendly crop performance data with all required fields
  const exportCropPerformance = Object.entries<CropPerformance>(cropPerformance as Record<string, CropPerformance>)
    .map(([crop, data]) => {
      const revenue = Math.round(revenueByCrop[crop]?.revenue || 0)
      const cost = Math.round(revenueByCrop[crop]?.cost || 0)
      const profit = Math.round(revenueByCrop[crop]?.profit || 0)
      const totalAcres = data.totalAcres || 1 // Avoid division by zero
      const avgYield = data.totalYield / (data.count || 1)
      const avgYieldPerHectare = totalAcres > 0 ? data.totalYield / totalAcres : 0
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
      
      return {
        crop,
        avgYield: Number(avgYield.toFixed(2)),
        totalYield: Number(data.totalYield.toFixed(2)),
        revenue,
        cost,
        profit,
        count: data.count || 0,
        totalAcres: Number(totalAcres.toFixed(2)),
        avgYieldPerHectare: Number(avgYieldPerHectare.toFixed(2)),
        profitMargin: Number(profitMargin.toFixed(2)),
        revenuePerHectare: Number((revenue / (totalAcres || 1)).toFixed(2)),
        costPerHectare: Number((cost / (totalAcres || 1)).toFixed(2)),
        profitPerHectare: Number((profit / (totalAcres || 1)).toFixed(2))
      }
    })

  // Recent harvests data
  const recentHarvestsData = yieldRecords?.slice(0, 10).map((record) => ({
    crop: record.crops?.name || "Unknown",
    yield: Number(record.yield_amount || 0),
    date: new Date(record.harvest_date).toLocaleDateString(),
  })) || []

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        {/* Section 1: Crop & Yield Analytics */}
        <div>
          <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-green-700">Crop & Yield Analytics</h2>
          <div>
            <ExportDataButton
              yieldRecords={exportYieldRecords}
              cropPerformance={exportCropPerformance}
              revenueByCrop={revenueByCrop}
            />
          </div>
        </div>
          
          {/* Top Row: 4 Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* 1. Total Yield */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Yield</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{totalYield.toFixed(2)} kg</div>
                <p className="text-xs text-green-600">All time production</p>
              </CardContent>
            </Card>

            {/* 2. Avg Yield/Hectare */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Avg Yield/Hectare</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{averageYieldPerAcre.toFixed(1)}</div>
                <p className="text-xs text-green-600">Across all crops</p>
              </CardContent>
            </Card>

            {/* 3. This Year */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">This Year</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{thisYearYield.toFixed(2)} kg</div>
                <p className="text-xs text-green-600">{currentYear} production</p>
              </CardContent>
            </Card>

            {/* 4. YoY Change */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">YoY Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{yearOverYearChange > 0 ? "+" : ""}{yearOverYearChange.toFixed(1)}%</div>
                <p className="text-xs text-green-600">vs previous year</p>
              </CardContent>
            </Card>
          </div>

          {/* Second Row: Recent Harvests, Crop Performance, Production Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnalyticsCharts recentHarvestsData={recentHarvestsData} cropPerformanceArray={cropPerformanceArray} />
          </div>
        </div>

        {/* Section 2: Revenue & Profit Analytics */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-green-700 mb-4">Revenue & Profit Analytics</h2>
          
          {/* Top Row: 4 Financial Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* 8. Total Revenue */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">N${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-green-600">From all harvests</p>
              </CardContent>
            </Card>

            {/* 9. Total Cost */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">N${totalCost.toFixed(2)}</div>
                <p className="text-xs text-green-600">Production costs</p>
              </CardContent>
            </Card>

            {/* 10. Net Profit */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  N${totalProfit.toFixed(2)}
                </div>
                <p className="text-xs text-green-600">Revenue - Cost</p>
              </CardContent>
            </Card>

            {/* 11. Profit Margin */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Profit Margin</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{profitMargin.toFixed(1)}%</div>
                <p className="text-xs text-green-600">Average margin</p>
              </CardContent>
            </Card>
          </div>

          {/* Row with Revenue/Cost/Profit Chart and Top Performing Crops */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 12. Revenue, Cost & Profit by Crop Chart */}
            <AnalyticsContent
              cropPerformanceData={cropPerformanceArray}
              recentHarvestsData={recentHarvestsData}
              revenueChartData={revenueChartData}
              profitMargin={profitMargin}
              totalRevenue={totalRevenue}
              totalCost={totalCost}
              totalProfit={totalProfit}
            />

            {/* 13. Top Performing Crops */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-green-800">Top Performing Crops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cropPerformanceArray
                    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
                    .slice(0, 5)
                    .map((crop, index) => (
                      <div key={index} className="flex justify-between items-center pb-3 border-b border-green-100 last:border-0">
                        <div>
                          <p className="font-medium text-green-800">{index + 1}. {crop.crop}</p>
                          <p className="text-xs text-green-600">Profit: N${(crop.profit || 0).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-700">N${(crop.profit || 0).toFixed(2)}</p>
                          <p className="text-xs text-green-600">{(crop.totalYield || 0).toFixed(0)}kg yield</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
