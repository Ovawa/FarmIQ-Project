import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
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

          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-800">Check Your Email</CardTitle>
              <CardDescription className="text-green-600">We've sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-green-700 mb-4">
                You've successfully signed up for FarmIQ! Please check your email and click the confirmation link to
                activate your account.
              </p>
              <p className="text-xs text-green-600">
                Didn't receive the email? Check your spam folder or{" "}
                <Link href="/auth/sign-up" className="underline hover:text-green-700">
                  try signing up again
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
