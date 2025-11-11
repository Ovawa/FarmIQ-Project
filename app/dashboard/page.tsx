import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { WeatherCard } from "@/components/weather-card"
import { NDVICard } from "@/components/ndvi-card"
import { ProductionOverviewCard } from "@/components/production-overview-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("region").eq("id", user.id).single()

  const userRegion = profile?.region || "Khomas"

  // Fetch user's fields and recent data
  const { data: crops } = await supabase
    .from("crops")
    .select("*, fields(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: yieldRecords } = await supabase
    .from("yield_records")
    .select("*, crops(name)")
    .eq("user_id", user.id)
    .order("harvest_date", { ascending: false })

  const { data: recentYields } = await supabase
    .from("yield_records")
    .select("*, fields(name), crops(name)")
    .eq("user_id", user.id)
    .order("harvest_date", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Welcome back, {user.user_metadata?.first_name || "Farmer"}!
            </h1>
            <p className="text-green-600">Here's an overview of your farm operations</p>
          </div>
          <Button asChild className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Detailed Analytics
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <WeatherCard region={userRegion} />
          <NDVICard region={userRegion} />
          <ProductionOverviewCard yieldRecords={yieldRecords || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Crops */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Recent Crops
              </CardTitle>
              <CardDescription className="text-green-600">Your latest crop plantings</CardDescription>
            </CardHeader>
            <CardContent>
              {crops && crops.length > 0 ? (
                <div className="space-y-3">
                  {crops.map((crop) => (
                    <Link
                      key={crop.id}
                      href={`/dashboard/fields/field/${crop.field_id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:shadow-sm cursor-pointer">
                        <div>
                          <p className="font-medium text-green-800">{crop.name}</p>
                          <p className="text-sm text-green-600">{crop.fields?.name}</p>
                        </div>
                        <Badge
                          variant={crop.status === "growing" ? "default" : "secondary"}
                          className={crop.status === "growing" ? "bg-green-100 text-green-700" : ""}
                        >
                          {crop.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sprout className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-green-600 mb-2">No crops planted yet</p>
                  <p className="text-sm text-green-500">Start by adding your fields and crops</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Harvests */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Harvests
              </CardTitle>
              <CardDescription className="text-green-600">Your latest yield records</CardDescription>
            </CardHeader>
            <CardContent>
              {recentYields && recentYields.length > 0 ? (
                <div className="space-y-3">
                  {recentYields.map((yield_record) => (
                    <div key={yield_record.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{yield_record.crops?.name}</p>
                        <p className="text-sm text-green-600">{yield_record.fields?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-800">
                          {yield_record.yield_amount} {yield_record.yield_unit}
                        </p>
                        <p className="text-sm text-green-600">
                          {new Date(yield_record.harvest_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-green-600 mb-2">No harvests recorded yet</p>
                  <p className="text-sm text-green-500">Record your first harvest to see data here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
