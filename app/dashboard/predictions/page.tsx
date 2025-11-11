import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { AdviceBox } from "@/components/advice-box"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TrendingUp, Brain, Calendar, Target, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { DeletePredictionDialog } from "@/components/delete-prediction-dialog"

export default async function PredictionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch predictions with field and crop data
  const { data: predictions } = await supabase
    .from("predictions")
    .select(`
      *,
      fields(name, size_hectares),
      crops(name, variety, status)
    `)
    .eq("user_id", user.id)
    .order("prediction_date", { ascending: false })

  // Fetch active crops for generating new predictions
  const { data: activeCrops } = await supabase
    .from("crops")
    .select(`
      *,
      fields(name, size_hectares)
    `)
    .eq("user_id", user.id)
    .in("status", ["planted", "growing"])

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Yield Predictions</h1>
            <p className="text-green-600">AI-powered forecasting for better farm planning</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/predictions/generate">
              <Brain className="h-4 w-4 mr-2" />
              Generate Prediction
            </Link>
          </Button>
        </div>

        {/* Active Crops Overview */}
        {activeCrops && activeCrops.length > 0 && (
          <Card className="border-green-200 mb-8">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Crops Ready for Prediction
              </CardTitle>
              <CardDescription className="text-green-600">
                Generate yield predictions for your active crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCrops.slice(0, 6).map((crop) => (
                  <div key={crop.id} className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-800">{crop.name}</h4>
                      <Badge className="bg-green-100 text-green-700">{crop.status}</Badge>
                    </div>
                    <p className="text-sm text-green-600 mb-2">{crop.fields?.name}</p>
                    <p className="text-xs text-green-500">{crop.fields?.size_hectares} hectares</p>
                  </div>
                ))}
              </div>
              {activeCrops.length > 6 && (
                <p className="text-sm text-green-600 mt-4">+{activeCrops.length - 6} more crops available</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Predictions List */}
        {predictions && predictions.length > 0 ? (
          <div className="space-y-6">
            {predictions.map((prediction) => {
              const outcomeQuality = prediction.confidence_score || 0;
              const outcomeLabel = 
                outcomeQuality >= 0.76 ? 'High' : 
                outcomeQuality >= 0.5 ? 'Moderate' : 
                'Poor';
              const isHighQuality = outcomeQuality >= 0.76;
              const isModerateQuality = outcomeQuality >= 0.5;

              return (
                <Card key={prediction.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-green-800 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          {prediction.crops?.name} - {prediction.fields?.name}
                        </CardTitle>
                        <CardDescription className="text-green-600">
                          Prediction generated on {new Date(prediction.prediction_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isHighQuality ? "default" : isModerateQuality ? "secondary" : "outline"}
                          className={
                            isHighQuality
                              ? "bg-green-100 text-green-700"
                              : isModerateQuality
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          {outcomeLabel}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DeletePredictionDialog
                              predictionId={prediction.id}
                              cropName={prediction.crops?.name || "Unknown"}
                            >
                              <div className="flex items-center gap-2 text-red-600 cursor-pointer px-2 py-1.5">
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </div>
                            </DeletePredictionDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Predicted Yield */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-800">Predicted Yield</h4>
                        <div className="text-2xl font-bold text-green-700">
                          {prediction.predicted_yield} {prediction.yield_unit}
                        </div>
                        <p className="text-sm text-green-600">
                          Per hectare:{" "}
                          {(prediction.predicted_yield / (prediction.fields?.size_hectares || 1)).toFixed(1)}{" "}
                          {prediction.yield_unit}/hectare
                        </p>
                      </div>

                      {/* Outcome Quality */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-800">Outcome Quality</h4>
                        <Progress 
                          value={Math.round(outcomeQuality * 100)} 
                          className="h-3 bg-green-100 [&>div]:bg-green-500" 
                        />
                        <p className="text-sm text-green-600">
                          {outcomeLabel} outcome conditions
                        </p>
                      </div>

                      {/* Key Factors */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-800">Key Factors</h4>
                        {prediction.factors && typeof prediction.factors === "object" ? (
                          <div className="space-y-1">
                            {Object.entries(prediction.factors as Record<string, any>)
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <p key={key} className="text-sm text-green-600">
                                  {key.replace("_", " ")}: {String(value)}
                                </p>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-600">Weather, soil conditions, historical data</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="mt-4 pt-4 border-t border-green-100 flex items-center gap-4 text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Field: {prediction.fields?.size_hectares} hectares
                      </span>
                      {prediction.crops?.variety && <span>Variety: {prediction.crops.variety}</span>}
                    </div>

                    {/* Advice Box */}
                    <AdviceBox
                      yieldCategory={outcomeLabel as "High" | "Moderate" | "Low"}
                      ndvi={prediction.factors && typeof prediction.factors === "object" ? (prediction.factors as any).ndvi : null}
                      rainfall={prediction.factors && typeof prediction.factors === "object" ? (prediction.factors as any).rainfall : null}
                      soilPH={prediction.factors && typeof prediction.factors === "object" ? (prediction.factors as any).soil_pH : null}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Brain className="h-16 w-16 text-green-300 mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">No predictions generated yet</h3>
              <p className="text-green-600 text-center mb-6 max-w-md">
                Generate AI-powered yield predictions for your crops to optimize your farming decisions and planning.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/predictions/generate">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Your First Prediction
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
