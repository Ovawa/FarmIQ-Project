import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, BarChart3, MapPin, TrendingUp } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="border-b border-green-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/Logo-nobg.png" 
              alt="FarmIQ" 
              className="h-10 w-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-green-800 mb-6">
            Smart Farming,
            <br />
            <span className="text-green-600">Better Yields</span>
          </h2>
          <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
            Track your crops, analyze yields, and get AI-powered predictions to optimize your farm's performance.
          </p>
          <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
            <Link href="/auth/sign-up">Start Your Free Trial</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Field Management</CardTitle>
              <CardDescription className="text-green-600">
                Organize and track all your fields in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                Keep detailed records of each field including size, location, soil type, and crop history.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Yield Analytics</CardTitle>
              <CardDescription className="text-green-600">Comprehensive analysis of your harvest data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                Track yields over time, compare performance across fields, and identify trends.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">AI Predictions</CardTitle>
              <CardDescription className="text-green-600">Smart forecasting for better planning</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                Get AI-powered yield predictions based on historical data, weather, and soil conditions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg border border-green-200 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-green-800 mb-4">Ready to optimize your farm?</h3>
          <p className="text-green-700 mb-6">Join thousands of farmers already using FarmIQ to improve their yields.</p>
          <Button size="lg" asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/auth/sign-up">Get Started Today</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
