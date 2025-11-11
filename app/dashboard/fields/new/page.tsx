import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { AddFieldForm } from "@/components/add-field-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default async function NewFieldPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Add New Field
              </CardTitle>
              <CardDescription className="text-green-600">
                Add a new field to your farm and start tracking crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddFieldForm userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
