import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { AddCropForm } from "@/components/add-crop-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout } from "lucide-react"

interface AddCropPageProps {
  params: Promise<{ id: string }>
}

export default async function AddCropPage({ params }: AddCropPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch field details
  const { data: field } = await supabase.from("fields").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!field) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Sprout className="h-6 w-6" />
                Add Crop to {field.name}
              </CardTitle>
              <CardDescription className="text-green-600">
                Plant a new crop in this field and start tracking its progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddCropForm userId={user.id} fieldId={field.id} fieldName={field.name} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
