"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sprout } from "lucide-react"
import { NAMIBIAN_REGIONS } from "@/lib/constants/regions"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [farmName, setFarmName] = useState("")
  const [region, setRegion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!region) {
      setError("Please select your region")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
            farm_name: farmName,
            region: region,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          email: email,
          region: region,
          first_name: firstName,
          last_name: lastName,
          farm_name: farmName,
        })

        if (profileError) {
          console.error("[v0] Profile creation error:", profileError)
        }
      }

      // Successfully signed up
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.error("[v0] Sign up error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred during sign up. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/Logo-nobg.png" 
              alt="FarmIQ" 
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-green-800">Create an account</h2>
          <p className="mt-2 text-sm text-green-600">
            Sign up to start managing your farm with FarmIQ
          </p>
        </div>
        
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">Get Started</CardTitle>
            <CardDescription className="text-green-600">Create your account to start tracking your farm</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName" className="text-green-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName" className="text-green-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="farmName" className="text-green-700">
                    Farm Name
                  </Label>
                  <Input
                    id="farmName"
                    type="text"
                    placeholder="Green Valley Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="region" className="text-green-700">
                    Region *
                  </Label>
                  <Select value={region} onValueChange={setRegion} required>
                    <SelectTrigger className="border-green-200 focus:border-green-400">
                      <SelectValue placeholder="Select your region in Namibia" />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMIBIAN_REGIONS.map((regionName) => (
                        <SelectItem key={regionName} value={regionName}>
                          {regionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-green-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-green-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-green-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-green-600 hover:text-green-700 underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
