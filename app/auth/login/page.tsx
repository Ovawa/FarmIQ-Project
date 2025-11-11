'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signIn } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction] = useFormState(signIn, null)

  useEffect(() => {
    console.log('State changed:', state)
    if (state?.success) {
      console.log('Login successful, checking session before redirect...')
      
      // Create a function to check session and redirect
      const checkSessionAndRedirect = async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Current session:', session)
        
        if (session) {
          console.log('Session found, redirecting to dashboard')
          window.location.href = '/dashboard'
        } else {
          console.log('No session found, will retry...')
          // Retry after a short delay
          setTimeout(checkSessionAndRedirect, 500)
        }
      }
      
      // Start checking for session
      checkSessionAndRedirect()
    }
  }, [state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/Logo-nobg.png" 
              alt="FarmIQ Namibia" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-green-800">Welcome back</h1>
          <p className="mt-2 text-green-600">Sign in to your FarmIQ Namibia account</p>
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">Welcome Back</CardTitle>
              <CardDescription className="text-green-600">Sign in to your FarmIQ dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-green-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="farmer@example.com"
                      required
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-green-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  {state?.error && (
                    <div className="text-red-500 text-sm text-center">
                      {state.error}
                    </div>
                  )}
                  <SubmitButton />
                </div>
              </form>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="text-green-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}