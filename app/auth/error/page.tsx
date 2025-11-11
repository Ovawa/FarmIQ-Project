import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo and branding */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800">FarmIQ</h1>
            </div>
          </div>

          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-800">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="text-sm text-red-600 mb-4">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-red-600 mb-4">An authentication error occurred.</p>
              )}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 underline underline-offset-4">
                Return to login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
