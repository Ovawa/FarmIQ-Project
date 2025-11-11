import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProfileSettingsForm } from "@/components/profile-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings, LogOut } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-green-50/30">
      <DashboardNav user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2 flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-green-600">Manage your account and farm information</p>
          </div>

          {/* Profile Settings */}
          <Card className="border-green-200 mb-6">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-green-600">Update your personal and farm details</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm user={user} profile={profile} />
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Account Actions
              </CardTitle>
              <CardDescription className="text-red-600">Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-medium">Sign out of your account</h3>
                <p className="text-sm text-muted-foreground">
                  You'll need to sign in again to access your account
                </p>
              </div>
              <SignOutButton />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
