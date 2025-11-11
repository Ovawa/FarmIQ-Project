import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { CropActionsMenu } from "@/components/crop-actions-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, Plus, Sprout, Calendar, Ruler, ArrowLeft, MoreVertical } from "lucide-react"
import Link from "next/link"

interface FieldDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function FieldDetailPage({ params }: FieldDetailPageProps) {
  const { id } = await params

  if (id === "new") {
    notFound()
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch field details with crops and yield records
  const { data: field } = await supabase
    .from("fields")
    .select(`
      *,
      crops(
        *,
        yield_records(*)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!field) {
    notFound()
  }

  const activeCrops = field.crops?.filter((crop: any) => crop.status === "growing") || []
  const harvestedCrops = field.crops?.filter((crop: any) => crop.status === "harvested") || []

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-green-600 hover:text-green-700 mb-4">
            <Link href="/dashboard/fields">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fields
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2 flex items-center gap-3">
                <MapPin className="h-8 w-8" />
                {field.name}
              </h1>
              <p className="text-green-600">{field.location}</p>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href={`/dashboard/fields/field/${field.id}/add-crop`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Crop
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Field Information */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Field Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Size: {field.size_hectares} hectares</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Location: {field.location || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Soil: {field.soil_type || "Not specified"}</span>
              </div>
              <div className="pt-2 border-t border-green-100">
                <p className="text-sm text-green-600">Created: {new Date(field.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Crops */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Active Crops ({activeCrops.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCrops.length > 0 ? (
                <div className="space-y-3">
                  {activeCrops.map((crop: any) => (
                    <div key={crop.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-green-800">{crop.name}</h4>
                            <Badge className="bg-green-100 text-green-700">{crop.status}</Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <CropActionsMenu
                            cropId={crop.id}
                            fieldId={field.id}
                            cropName={crop.name}
                            cropVariety={crop.variety}
                            cropStatus={crop.status}
                            plantingDate={crop.planting_date}
                            expectedHarvestDate={crop.expected_harvest_date}
                            productionCost={crop.production_cost}
                          />
                        </DropdownMenu>
                      </div>
                      {crop.variety && <p className="text-sm text-green-600">Variety: {crop.variety}</p>}
                      {crop.planting_date && (
                        <p className="text-sm text-green-600">
                          Planted: {new Date(crop.planting_date).toLocaleDateString()}
                        </p>
                      )}
                      {crop.production_cost && (
                        <p className="text-sm text-green-600">
                          Production Cost: N${(crop.production_cost as number).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sprout className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-green-600">No active crops</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Harvest History */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Harvest History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {harvestedCrops.length > 0 ? (
                <div className="space-y-3">
                  {harvestedCrops.slice(0, 5).map((crop: any) => (
                    <div key={crop.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-green-800">{crop.name}</h4>
                            <Badge variant="secondary">{crop.status}</Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <CropActionsMenu
                            cropId={crop.id}
                            fieldId={field.id}
                            cropName={crop.name}
                            cropVariety={crop.variety}
                            cropStatus={crop.status}
                            plantingDate={crop.planting_date}
                            expectedHarvestDate={crop.expected_harvest_date}
                            productionCost={crop.production_cost}
                          />
                        </DropdownMenu>
                      </div>
                      {crop.yield_records && crop.yield_records.length > 0 && (
                        <p className="text-sm text-green-600">
                          Yield: {crop.yield_records[0].yield_amount} {crop.yield_records[0].yield_unit}
                        </p>
                      )}
                      {crop.production_cost && (
                        <p className="text-sm text-green-600">
                          Production Cost: N${(crop.production_cost as number).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-green-600">No harvests yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
