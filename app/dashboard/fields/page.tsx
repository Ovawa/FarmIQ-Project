import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { FieldActionsMenu } from "@/components/field-actions-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, Plus, Sprout, Ruler, MoreVertical } from "lucide-react"
import Link from "next/link"

export default async function FieldsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's fields with crop counts
  const { data: fields } = await supabase
    .from("fields")
    .select(`
      *,
      crops(id, name, status, planting_date)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Field Management</h1>
            <p className="text-green-600">Manage your fields and track crop rotations</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/fields/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Link>
          </Button>
        </div>

        {/* Fields Grid */}
        {fields && fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => {
              const activeCrops = field.crops?.filter((crop: any) => crop.status === "growing") || []
              const totalCrops = field.crops?.length || 0

              return (
                <Card key={field.id} className="border-green-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-green-800 flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {field.name}
                        </CardTitle>
                        <CardDescription className="text-green-600">{field.location}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-green-300 text-green-700">
                          {field.size_hectares} hectares
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <FieldActionsMenu fieldId={field.id} fieldName={field.name} />
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Field Details */}
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Ruler className="h-4 w-4" />
                        <span>Soil: {field.soil_type || "Not specified"}</span>
                      </div>

                      {/* Crop Status */}
                      <div className="flex items-center gap-2 text-sm">
                        <Sprout className="h-4 w-4 text-green-600" />
                        <span className="text-green-700">
                          {activeCrops.length > 0
                            ? `${activeCrops.length} active crop${activeCrops.length > 1 ? "s" : ""}`
                            : "No active crops"}
                        </span>
                      </div>

                      {/* Recent Crops */}
                      {field.crops && field.crops.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-green-700 mb-2">Recent Crops:</p>
                          <div className="flex flex-wrap gap-1">
                            {field.crops.slice(0, 3).map((crop: any) => (
                              <Badge key={crop.id} variant="secondary" className="text-xs bg-green-100 text-green-700">
                                {crop.name}
                              </Badge>
                            ))}
                            {field.crops.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                +{field.crops.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-green-100">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 border-green-200 text-green-700 bg-transparent"
                        >
                          <Link href={`/dashboard/fields/field/${field.id}`}>View Details</Link>
                        </Button>
                        <Button size="sm" asChild className="flex-1 bg-green-600 hover:bg-green-700">
                          <Link href={`/dashboard/fields/field/${field.id}/add-crop`}>Add Crop</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MapPin className="h-16 w-16 text-green-300 mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">No fields added yet</h3>
              <p className="text-green-600 text-center mb-6 max-w-md">
                Start by adding your first field to begin tracking your crops and managing your farm operations.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/fields/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Field
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
