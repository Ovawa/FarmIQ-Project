import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { GeneratePredictionForm } from "@/components/generate-prediction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default async function GeneratePredictionPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch active crops for prediction
  const { data: activeCrops } = await supabase
    .from("crops")
    .select(`
      *,
      fields(id, name, size_hectares, soil_type, location)
    `)
    .eq("user_id", user.id)
    .in("status", ["planted", "growing"])

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Generate Yield Prediction
              </CardTitle>
              <CardDescription className="text-green-600">
                Use AI to predict yields based on historical data, weather patterns, and field conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneratePredictionForm userId={user.id} activeCrops={activeCrops || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
