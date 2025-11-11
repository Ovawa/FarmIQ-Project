"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleSignOut}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  )
}
